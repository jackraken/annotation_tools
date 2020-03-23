import React from 'react';
import ReactDOM from 'react-dom';

import {FullEditListView} from './full_edit_list.js'

/**
 * Edit a single Image
 */
export let editImages = function(editData){
    console.log(editData)
    ReactDOM.render(
        <FullEditListView images={editData.images}
                      annotations={editData.annotations}
                      categories={editData.categories}/>,
        document.getElementById('app')
    );
}