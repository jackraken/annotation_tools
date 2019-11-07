import os
import json
import argparse
import re
import fnmatch
from PIL import Image
import datetime


def filter_for_jpeg(root, files):
    file_types = ['*.jpeg', '*.jpg', '*.png']
    file_types = r'|'.join([fnmatch.translate(x) for x in file_types])
    files = [os.path.join(root, f) for f in files]
    files = [f for f in files if re.match(file_types, f)]

    return files


def create_image_info(image_id, file_name, image_size,
                      date_captured=datetime.datetime.utcnow().isoformat(' '),
                      license_id=1, coco_url="", flickr_url=""):

    image_info = {
            "id": '{:06d}'.format(image_id),
            "file_name": file_name,
            "width": image_size[0],
            "height": image_size[1],
            "date_captured": date_captured,
            "license": license_id,
            "coco_url": coco_url,
            "flickr_url": flickr_url
    }

    return image_info


parser = argparse.ArgumentParser()
parser.add_argument('-data', '--path_to_data_dir', default='/media/external/2018-12-05-subset', help='path to data directory')
parser.add_argument('-output', '--path_to_output_dir', default='/media/external', help='path to output directory')
parser.add_argument('-host', '--url_host', default='140.114.27.158', help='path to data directory')
parser.add_argument('-port', '--url_port', default='6671', help='url port')
args = parser.parse_args()
path_to_data_dir = args.path_to_data_dir
path_to_output_dir = args.path_to_output_dir
host = args.url_host
port = args.url_port

INFO = {
    "description": "Dataset",
    "url": "",
    "version": "0.1.0",
    "year": 2019,
    "contributor": "",
    "date_created": datetime.datetime.utcnow().isoformat(' ')
}

LICENSES = [
    {
        "id": 1,
        "name": "",
        "url": ""
    }
]

CATEGORIES = [
    {
        'id': 1,
        'name': 'human',
        'supercategory': 'human',
        'keypoints': ["nose","left_eye","right_eye","left_ear","right_ear","left_shoulder","right_shoulder","left_elbow","right_elbow","left_wrist","right_wrist","left_hip","right_hip","left_knee","right_knee","left_ankle","right_ankle"],
	    'skeleton': [[16,14],[14,12],[17,15],[15,13],[12,13],[6,12],[7,13],[6,7],[6,8],[7,9],[8,10],[9,11],[2,3],[1,2],[1,3],[2,4],[3,5],[4,6],[5,7]],
    }
]

coco_output = {
        "info": INFO,
        "licenses": LICENSES,
        "categories": CATEGORIES,
        "images": [],
        "annotations": []
}



image_id = 1

for root, _, files in os.walk(path_to_data_dir):
    print('s')
    image_files = filter_for_jpeg(root, files)
    # go through each image
    for image_filename in sorted(image_files):
        print(image_filename)
        image = Image.open(image_filename)
        url = 'http://' + str(host) + ':' + str(port) + '/' + os.path.basename(image_filename)
        image_info = create_image_info(
            image_id, os.path.basename(image_filename), image.size, coco_url=url)
        coco_output["images"].append(image_info)

        image_id = image_id + 1

with open('{}/keypoint.json'.format(path_to_output_dir), 'w') as output_json_file:
    json.dump(coco_output, output_json_file)
