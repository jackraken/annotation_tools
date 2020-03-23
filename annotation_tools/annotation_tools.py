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
import pathlib
from glob import glob
from urllib.parse import unquote_plus
from typing import Dict, Optional
from Crypto.Cipher import AES
from PIL import Image

from flask import Flask, render_template, jsonify, request, url_for
from flask import session, current_app, redirect, make_response, Response, send_file
from flask_session import Session
from flask_login import LoginManager, login_required, login_user, current_user, logout_user
from flask_pymongo import PyMongo
from bson import json_util
from werkzeug.utils import secure_filename

from annotation_tools import default_config as cfg
from annotation_tools.config import default

import sys
sys.path.append('config/default.py')

app = Flask(__name__)

app.config.from_object('annotation_tools.config.default')
# app.config['GOOGLE_CLIENT_ID'] = os.environ.get("GOOGLE_CLIENT_ID", default="120971085062-trbgdnaksj7tttjdivmqfeb8jk360949.apps.googleusercontent.com")
# app.config['GOOGLE_CLIENT_SECRET'] = os.environ.get("GOOGLE_CLIENT_SECRET", default="yq2vVwkgEsLqOoZkCO9uTbR7")
# app.config['HOSTNAME'] = os.environ.get("HOSTNAME", default="http://localhost:8008")
# app.config['SECRET_KEY'] = os.environ.get("SECRET_KEY", default="super-secret")
app.config['SESSION_TYPE'] = 'filesystem'
# app.secret_key = "super-secret"
#app.config.from_object('annotation_tools.default_config')
app.config['MONGO_URI'] = 'mongodb://'+cfg.MONGO_HOST+':'+str(cfg.MONGO_PORT)+'/'+cfg.MONGO_DBNAME
# if 'VAT_CONFIG' in os.environ:
#   app.config.from_envvar('VAT_CONFIG')

mongo = PyMongo(app)

Session(app)

login_manager = LoginManager()
login_manager.init_app(app)

@attr.s
class User(object):
    id = attr.ib()
    name = attr.ib()
    email = attr.ib()
    editingBatchId = attr.ib()
    is_authenticated = True
    is_active = True
    is_anonymous = False

    def get_id(self):
        return self.id

users: Dict[str, User] = {}

@login_manager.unauthorized_handler
def unauthorized_callback():
    return redirect('/')

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
@login_required
def dashboard():
  if current_user.email in app.config["ADMIN_EMAIL"]:
    is_admin = True
  else:
    is_admin = False
  data = mongo.db.user.find_one({'id' : current_user.id})
  if not data:
    data = {
      "verified": "not verified"
    }
  else:
    if "verified" not in data:
      data["verified"] = "pending"
  return render_template('dashboard.html', verified = data["verified"], is_admin = is_admin)

@app.route("/setting")
# @login_required
def setting():
  if current_user.email in app.config["ADMIN_EMAIL"]:
    return redirect(url_for('admin'))

  data = mongo.db.user.find_one({'id' : current_user.id})
  if not data:
    data = {
      "verified": "not verified"
    }
  else:
    if "verified" not in data:
      data["verified"] = "pending"
  return render_template('setting.html', verified = data["verified"])

@app.route("/salary")
# @login_required
def salary():
  if current_user.email in app.config["ADMIN_EMAIL"]:
    is_admin = True
  else:
    is_admin = False
  return render_template('salary.html', is_admin = is_admin)

@app.route("/admin")
# @login_required
def admin():
  print("admin")
  return render_template('admin.html')

@app.route('/users/all', methods=['GET'])
def get_users():
  data = []
  records = mongo.db.user.find({})
  for record in records:
    data.append(record)
  return json.dumps(data, default=str)

@app.route('/salary/user', methods=['GET'])
def get_salary():
  if current_user.email in app.config["ADMIN_EMAIL"]:
    return redirect(url_for('get_salaries'))
  userId = current_user.id
  data = []
  records = mongo.db.salary.find({"userId": userId})
  for record in records:
    data.append(record)
  return json.dumps(data, default=str)

@app.route('/salaries/all', methods=['GET'])
def get_salaries():
  data = []
  records = mongo.db.salary.find({})
  for record in records:
    data.append(record)
  return json.dumps(data, default=str)

@app.route('/user/verify', methods=['PUT'])
def verify_user():
  userId = request.args.get('id')
  verify = request.args.get('verify')

  mongo.db.user.update_one({'id' : userId}, {'$set' :{'verified': verify}})
  return ""

@app.route('/info/update', methods=['POST'])
def update_info():
  info = json_util.loads(json.dumps(request.json['info']))

  return ""

@app.route("/logout")
def logout():
    logout_user()
    r = requests.get('https://accounts.google.com/Logout')
    # return redirect(url_for('home'))
    return redirect("https://www.google.com/accounts/Logout?continue=https://appengine.google.com/_ah/logout?continue=" + current_app.config["HOSTNAME"])

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

    u = User(user_id, jwt_payload['name'], jwt_payload['email'], -1)

    # Automatically add users to DB (a dict).
    users[user_id] = u

    login_user(u)

    response = make_response(json.dumps(user_id))
    response.headers['Content-Type'] = 'application/json'
    return redirect(url_for('home'))

@app.route("/info/personal", methods=['GET'])
@login_required
def get_personal_info():
  print("get_personal_info")
  print(current_user.id)
  data = mongo.db.user.find_one_or_404({'id' : current_user.id})
  return json.dumps(data, default=str)

@app.route("/info/personal", methods=['POST'])
@login_required
def update_personal_info():
  print("update personal")
  info = json_util.loads(json.dumps(request.form))
  info["id"] = current_user.id
  info["verified"] = "pending"
  aes = AES.new('This is a key123', AES.MODE_CBC, 'This is an IV456')
  info["id_number"] = aes.encrypt(info["id_number"]+"888888")
  print(current_user)
  print(info)
  mongo.db.user.replace_one({'id' : info['id']}, info, upsert=True)
  return json.dumps({"123":"QWQ"})

@app.route('/download/info', methods=['GET'])
def downloadFileInfo ():
  files = {}
  for dirpath, dirnames, filenames in os.walk("annotation_tools/files"):
    for filename in [f for f in filenames if f.endswith("upload.pdf")]:
        files[dirpath.split('/')[-1]] = filename
        print(os.path.join(dirpath.split('/')[-1], filename))

  return json.dumps(files)

@app.route('/download/<path:user_dir>')
def downloadUserFile (user_dir):
    user_dir = unquote_plus(user_dir)
    print(user_dir)
    path = "files/" + user_dir + "/upload.pdf"
    return send_file(path, as_attachment=True)

@app.route('/download')
def downloadFile ():
    #For windows you need to use drive name [ex: F:/Example.pdf]
    path = "files/downloadable/download.pdf"
    return send_file(path, as_attachment=True)

ALLOWED_EXTENSIONS = {'pdf'}
def allowed_file(filename):
    return '.' in filename and \
      filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/upload', methods=['POST'])
@login_required
def uploadFile():
  if current_user.email in app.config["ADMIN_EMAIL"]:
    is_admin = True
  else:
    is_admin = False

  if 'file' not in request.files:
    flash('No file part')
    return ""
  file = request.files['file']
  basedir = os.path.abspath(os.path.dirname(__file__))
  if is_admin:
    uploadPath = os.path.join(basedir, 'files/%s'%('downloadable'))
    file.filename = "download.pdf"  
  else:
    uploadPath = os.path.join(basedir, 'files/%s(%s)'%(current_user.name, current_user.email))
    file.filename = "upload.pdf" 
  pathlib.Path(uploadPath).mkdir(exist_ok=True)
  if file and allowed_file(file.filename):
      filename = secure_filename(file.filename)
      file.save(os.path.join(uploadPath, filename))
      return redirect(url_for('dashboard'))
  return ""

@app.route('/edit_images')
@login_required
def edit_images():

  new_directory_list = []
  for root, dirs, files in os.walk("./data/images", topdown=False):
    for idx, name in enumerate(dirs):
      if not mongo.db.batch.find_one({'folder_name' : name}):
        print("new folder")
        new_directory_list.append(name)
  
  for new_folder in new_directory_list:
    curBatchId = mongo.db.batch.count_documents({})
    curImageId = mongo.db.image.count_documents({})
    count = 0
    for root, dirs, files in os.walk("./data/images/" + new_folder):
      for f in files:
        curImageId = curImageId + 1
        count = count + 1
        url = 'http://' + '127.0.0.1' + ':' + '6678' + '/' + new_folder + '/' + f
        image = Image.open(root + '/' + f)
        image_data = {
          "id": '{:08d}'.format(curImageId),
          "file_name": f,
          "width": image.size[0],
          "height": image.size[1],
          "date_captured": datetime.datetime.utcnow().isoformat(' '),
          "license": 1,
          "coco_url": url,
          "flickr_url": "",
          "url": url,
          "rights_holder": ""
        }
        mongo.db.image.replace_one({'id' : curImageId}, image_data, upsert=True)

        if count % 5 == 0:
          curBatchId = curBatchId + 1
          mongo.db.batch.replace_one({'id' : curBatchId}, 
            {
              'id': '{:08d}'.format(curBatchId),
              'start_image_id': curImageId - 4,
              'end_image_id': curImageId,
              'folder_name': new_folder,
              'annotated': False,
              'annotater': '',
              'progress': 0,
              'checked': False,
              'paid': False
            }, 
            upsert=True)
  batch = mongo.db.batch.find_one({'annotater' : current_user.id, 'progress' : {"$lt": 5}})
  if batch == None:
    batch = mongo.db.batch.find_one_or_404({'annotated' : False})
  print(batch)
  current_user.editingBatchId = batch['id']
  batch['annotated'] = True
  batch['annotater'] = current_user.id
  mongo.db.batch.replace_one({'id' : batch['id']}, batch)
  images = list()
  annotations = list()
  for i in range(batch['start_image_id'], batch['end_image_id']+1):
    # print(i)
    image_id = '{:08d}'.format(i)
    image = mongo.db.image.find_one_or_404({'id' : image_id})
    annotation = list(mongo.db.annotation.find({'image_id' : image_id}))
    images.append(image)
    annotations.append(annotation)
  categories = list(mongo.db.category.find())

  images = json_util.dumps(images)
  annotations = json_util.dumps(annotations)
  categories = json_util.dumps(categories)

  if request.is_xhr:
    # Return just the data
    return jsonify({
      'images' : json.loads(images),
      'annotations' : json.loads(annotations),
      'categories' : json.loads(categories)
    })
  else:
    # Render a webpage to edit the annotations for this image
    return render_template('edit_images.html', images=images, annotations=annotations, categories=categories)

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
@app.route('/batch/save', methods=['POST'])
def save_batch():
  info = json_util.loads(request.data)
  # print(info)
  print(current_user.editingBatchId)
  progress = info['imagesAnnotated'].count(True)
  mongo.db.batch.update_one({'id': current_user.editingBatchId}, {'$set': {'progress': progress}})
  
  return ""

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
