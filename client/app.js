import {editImage} from './views/edit_image.js';
import {editImages} from './views/edit_images.js';
import {editTask} from './views/edit_task.js';
import {bboxTask} from './views/bbox_task.js';

document.V = Object();

// Edit annotations in a dataset
document.V.editImage = editImage;
document.V.editImages = editImages;
document.V.editTask = editTask;

// Bounding box annotation task
document.V.bboxTask = bboxTask;