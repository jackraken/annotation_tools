import os
import argparse
import threading

parser = argparse.ArgumentParser()
parser.add_argument('-data', '--path_to_data_dir', default='/home/wynn/victor_1028_rgb_label_v2', help='path to data directory')
parser.add_argument('-output', '--path_to_output_dir', default='/home/wynn/', help='path to output directory')
parser.add_argument('-url_in_host', '--url_in_host', default='192.168.0.135', help='image server interal host ip')
parser.add_argument('-url_in_port', '--url_in_port', default='8007', help='image server interal host port')
parser.add_argument('-url_out_host', '--url_out_host', default='140.114.27.158', help='image server exteral host ip')
parser.add_argument('-url_out_port', '--url_out_port', default='6678', help='image server exteral host port')
parser.add_argument('-label_in_host', '--label_in_host', default='192.168.0.135', help='label tool interal host ip')
parser.add_argument('-label_in_port', '--label_in_port', default='8008', help='label tool interal port')
parser.add_argument('-label_out_host', '--label_out_host', default='140.114.27.158', help='label tool exteral host ip')
parser.add_argument('-label_out_port', '--label_out_port', default='8008', help='label tool exteral port')
args = parser.parse_args()

anno_dir = os.getcwd()
if not os.path.exists(os.path.join(args.path_to_output_dir, 'keypoint.json')):
    os.system('python create_coco_keypoint_json.py --path_to_data_dir={} --path_to_output_dir={} --url_host={} --url_port={}'
              .format(args.path_to_data_dir, args.path_to_output_dir, args.url_out_host, args.url_out_port))

os.chdir(args.path_to_data_dir)


def thread_1():
    os.system('python -m http.server {} --bind={}'.format(args.url_in_port, args.url_in_host))


def thread_2():
    os.chdir(anno_dir)
    os.system('python -m annotation_tools.db_dataset_utils --action load --dataset {} --normalize'
              .format(os.path.join(args.path_to_output_dir, 'keypoint.json')))

    os.system('python run.py --port {} --host={}'.format(args.label_in_port, args.label_in_host))


thread1 = threading.Thread(target=thread_1, name='T1')
thread1.start()

thread2 = threading.Thread(target=thread_2, name='T2')
thread2.start()
thread2.join()
thread1.join()
os.system('python -m annotation_tools.db_dataset_utils --action export --output {} --denormalize'
          .format(os.path.join(args.path_to_output_dir, 'keypoint.json')))
os.system('python -m annotation_tools.db_dataset_utils --action drop')
print('all done')
