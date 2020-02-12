"""
Flask web server.
"""
from __future__ import absolute_import
from __future__ import division
from __future__ import print_function

import datetime
import json
import os
import random
import hashlib
import requests
import base64
import attr
import time
from typing import Dict, Optional

from flask import Flask, render_template, jsonify, request, url_for
from flask import session, current_app, redirect, make_response, Response
from flask_session import Session
from flask_login import LoginManager, login_required, login_user, current_user
from flask_pymongo import PyMongo
from bson import json_util

from annotation_tools import default_config as cfg

app = Flask(__name__)

app.config['GOOGLE_CLIENT_ID'] = os.environ.get("GOOGLE_CLIENT_ID", default="120971085062-trbgdnaksj7tttjdivmqfeb8jk360949.apps.googleusercontent.com")
app.config['GOOGLE_CLIENT_SECRET'] = os.environ.get("GOOGLE_CLIENT_SECRET", default="yq2vVwkgEsLqOoZkCO9uTbR7")
app.config['HOSTNAME'] = os.environ.get("HOSTNAME", default="http://localhost:8008")
app.config['SECRET_KEY'] = os.environ.get("SECRET_KEY", default="super-secret")
app.config['SESSION_TYPE'] = 'filesystem'
# app.secret_key = "super-secret"
#app.config.from_object('annotation_tools.default_config')
app.config['MONGO_URI'] = 'mongodb://'+cfg.MONGO_HOST+':'+str(cfg.MONGO_PORT)+'/'+cfg.MONGO_DBNAME
if 'VAT_CONFIG' in os.environ:
  app.config.from_envvar('VAT_CONFIG')

mongo = PyMongo(app)

Session(app)

login_manager = LoginManager()
login_manager.init_app(app)

@attr.s
class User(object):
    id = attr.ib()
    name = attr.ib()
    email = attr.ib()
    is_authenticated = True
    is_active = True
    is_anonymous = False

    def get_id(self):
        return self.id

users: Dict[str, User] = {}

@login_manager.user_loader
def load_user(user_id) -> Optional[User]:
    app.logger.debug('looking for user %s', user_id)
    u = users.get(user_id, None)
    if not id:
        return None
    return u

def generate_nonce(length=8):
  """Generate pseudorandom number."""
  return ''.join([str(random.randint(0, 9)) for i in range(length)])

def get_db():
  """ Return a handle to the database
  """
  with app.app_context():
    db = mongo.db
    return db

############### Dataset Utilities ###############

@app.route('/')
def home():
  if current_user.is_authenticated:
    return redirect(url_for('dashboard'))
  else:
    return render_template('login.html')

@app.route("/dashboard")
# @login_required
def dashboard():
    return render_template('dashboard.html')

@app.route("/setting")
# @login_required
def setting():
    return render_template('setting.html')

@app.route('/info/update', methods=['POST'])
def update_info():
  info = json_util.loads(json.dumps(request.json['info']))

  return ""

@app.route("/logout")
def logout():
    logout_user()
    return redirect(url_for('home'))

@app.route("/login", methods=['GET'])
def login() -> Response:
  # 1. Create an anti-forgery state token
  state = hashlib.sha256(os.urandom(1024)).hexdigest()
  session['state'] = state

  nonce = generate_nonce()
  session['nonce'] = nonce

  # 2. Send an authentication request to Google
  payload = {
      'client_id':     current_app.config["GOOGLE_CLIENT_ID"],
      'response_type': 'code',
      'scope':         'openid email profile',
      'redirect_uri':  current_app.config["HOSTNAME"]+'/callback',
      'state':         state,
      'nonce':         nonce,
  }
  r = requests.get('https://accounts.google.com/o/oauth2/v2/auth?', payload)

  # app.logger.debug('session id is %s', session.sid)
  print('session id is %s', session.sid)

  return redirect(r.url)

@app.route("/callback", methods=['GET'])
def callback() -> Response:
    print("callback")
    # 3. Confirm anti-forgery state token
    if request.args.get('state', '') != session['state']:
        response = make_response(json.dumps('Invalid state parameter.'), 401)
        response.headers['Content-Type'] = 'application/json'
        return response

    # 4. Exchange code for access token and ID token
    code = request.args.get('code', '')
    payload = {
        'code':          code,
        'client_id':     current_app.config["GOOGLE_CLIENT_ID"],
        'client_secret': current_app.config["GOOGLE_CLIENT_SECRET"],
        'redirect_uri':  current_app.config["HOSTNAME"]+'/callback',
        'grant_type':    'authorization_code',
    }

    endpoint = 'https://www.googleapis.com/oauth2/v4/token'

    r = requests.post(endpoint, payload)
    if r.status_code != requests.codes.ok:
        response = make_response(json.dumps('Got error from Google.'), 401)
        response.headers['Content-Type'] = 'application/json'
        return response

    id_token = r.json()['id_token']

    # 5. Obtain user information from the ID token
    jwt = id_token.split('.')
    jwt_payload = json.loads(base64.b64decode(jwt[1] + "==="))

    if jwt_payload['nonce'] != session.pop('nonce', ''):
        response = make_response(json.dumps('Invalid nonce.'), 401)
        response.headers['Content-Type'] = 'application/json'
        return response

    if jwt_payload['iss'] != 'https://accounts.google.com':
        response = make_response(json.dumps('Invalid issuer.'), 401)
        response.headers['Content-Type'] = 'application/json'
        return response

    print(jwt_payload)
    user_id = 'google-' + jwt_payload['sub']
    print("user id = " + user_id)

    u = User(user_id, jwt_payload['name'], jwt_payload['email'])

    # Automatically add users to DB (a dict).
    users[user_id] = u

    login_user(u)

    response = make_response(json.dumps(user_id))
    response.headers['Content-Type'] = 'application/json'
    # return response
    # return render_template('login.html')
    return redirect(url_for('home'))

@app.route('/edit_image/<image_id>')
# @login_required
def edit_image(image_id):
  """ Edit a single image.
  """

  image = mongo.db.image.find_one_or_404({'id' : image_id})
  annotations = list(mongo.db.annotation.find({'image_id' : image_id}))
  categories = list(mongo.db.category.find())

  image = json_util.dumps(image)
  annotations = json_util.dumps(annotations)
  categories = json_util.dumps(categories)

  if request.is_xhr:
    # Return just the data
    return jsonify({
      'image' : json.loads(image),
      'annotations' : json.loads(annotations),
      'categories' : json.loads(categories)
    })
  else:
    # Render a webpage to edit the annotations for this image
    return render_template('edit_image.html', image=image, annotations=annotations, categories=categories)

@app.route('/edit_task/')
def edit_task():
  """ Edit a group of images.
  """

  if 'image_ids' in request.args:

    image_ids = request.args['image_ids'].split(',')

  else:

    start=0
    if 'start' in request.args:
      start = int(request.args['start'])
    end=None
    if 'end' in request.args:
      end = int(request.args['end'])

    # Find annotations and their accompanying images for this category
    if 'category_id' in request.args:
      category_id = request.args['category_id']
      annos = mongo.db.annotation.find({ "category_id" : category_id}, projection={'image_id' : True, '_id' : False})#.sort([('image_id', 1)])
      image_ids = list(set([anno['image_id'] for anno in annos]))
      image_ids.sort()

    # Else just grab all of the images.
    else:
      images = mongo.db.image.find(projection={'id' : True, '_id' : False}).sort([('id', 1)])
      image_ids = [image['id'] for image in images]

    if end is None:
      image_ids = image_ids[start:]
    else:
      image_ids = image_ids[start:end]

    if 'randomize' in request.args:
      if request.args['randomize'] >= 1:
        random.shuffle(image_ids)

  categories = list(mongo.db.category.find(projection={'_id' : False}))

  return render_template('edit_task.html',
    task_id=1,
    image_ids=image_ids,
    categories=categories,
  )

@app.route('/annotations/save', methods=['POST'])
def save_annotations():
  """ Save the annotations. This will overwrite annotations.
  """
  annotations = json_util.loads(json.dumps(request.json['annotations']))

  for annotation in annotations:
    # Is this an existing annotation?
    if '_id' in annotation:
      if 'deleted' in annotation and annotation['deleted']:
        mongo.db.annotation.delete_one({'_id' : annotation['_id']})
      else:
        result = mongo.db.annotation.replace_one({'_id' : annotation['_id']}, annotation)
    else:
      if 'deleted' in annotation and annotation['deleted']:
        pass # this annotation was created and then deleted.
      else:
        # This is a new annotation
        # The client should have created an id for this new annotation
        # Upsert the new annotation so that we create it if its new, or replace it if (e.g) the
        # user hit the save button twice, so the _id field was never seen by the client.
        assert 'id' in annotation
        mongo.db.annotation.replace_one({'id' : annotation['id']}, annotation, upsert=True)

        # if 'id' not in annotation:
        #   insert_res = mongo.db.annotation.insert_one(annotation, bypass_document_validation=True)
        #   anno_id =  insert_res.inserted_id
        #   mongo.db.annotation.update_one({'_id' : anno_id}, {'$set' : {'id' : str(anno_id)}})
        # else:
        #   insert_res = mongo.db.insert_one(annotation)

  return ""

#################################################

################## BBox Tasks ###################

@app.route('/bbox_task/<task_id>')
def bbox_task(task_id):
  """ Get the list of images for a bounding box task and return them along
  with the instructions for the task to the user.
  """

  bbox_task = mongo.db.bbox_task.find_one_or_404({'id' : task_id})
  task_id = str(bbox_task['id'])
  tasks = []
  for image_id in bbox_task['image_ids']:
    image = mongo.db.image.find_one_or_404({'id' : image_id}, projection={'_id' : False})
    tasks.append({
      'image' : image,
      'annotations' : []
    })

  category_id = bbox_task['category_id']
  categories = [mongo.db.category.find_one_or_404({'id' : category_id}, projection={'_id' : False})]
  #categories = json.loads(json_util.dumps(categories))

  task_instructions_id = bbox_task['instructions_id']
  task_instructions = mongo.db.bbox_task_instructions.find_one_or_404({'id' : task_instructions_id}, projection={'_id' : False})

  return render_template('bbox_task.html',
    task_id=task_id,
    task_data=tasks,
    categories=categories,
    mturk=True,
    task_instructions=task_instructions
  )

@app.route('/bbox_task/save', methods=['POST'])
def bbox_task_save():
  """ Save the results of a bounding box task.
  """

  task_result = json_util.loads(json.dumps(request.json))

  task_result['date'] = str(datetime.datetime.now())

  insert_res = mongo.db.bbox_task_result.insert_one(task_result, bypass_document_validation=True)

  return ""

#################################################
