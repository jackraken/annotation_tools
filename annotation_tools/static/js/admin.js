function verifyUser(userId, verify) {
    console.log(userId);
    console.log(verify);

    var headers = new Headers();
    headers.set('Accept', 'application/json');
    var url = 'http://140.114.27.158.xip.io:9302/user/verify?id=' + userId + "&verify=" + verify;
    var fetchOptions = {
        method: 'PUT',
        headers
    };
  
    var responsePromise = fetch(url, fetchOptions);
    responsePromise
    .then(function(response) {
        if(response.status == 200 ){
            window.location.reload(true);
        }
        else{
            alert("發生問題，請稍後再試");
        }
        return response.json();
    })
    .then(function(jsonData) {
    });
}

function checkBatch(batchId){
    console.log(batchId)
    console.log('checkBatch')

    batchId = ("00000000" + batchId).slice(-8)
    var win = window.open('http://140.114.27.158.xip.io:9302/edit_images/' + batchId, '_blank');
    if (win) {
        win.focus();
    } else {
        alert('Please allow popups for this website');
    }
}

function confirmBatch(batchId){
    console.log(batchId);
    console.log('confirmBatch');

    batchId = ("00000000" + batchId).slice(-8);

    var headers = new Headers();
    headers.set('Accept', 'application/json');
    var url = 'http://140.114.27.158.xip.io:9302/batch/confirm/' + batchId;
    var fetchOptions = {
        method: 'POST',
        headers
    };
    var responsePromise = fetch(url, fetchOptions);
    responsePromise
    .then(function(response) {
        if(response.status == 200 ){
            window.location.reload(true);
        }
        else{
            alert("發生問題，請稍後再試");
        }
        return response.json();
    })
    .then(function(jsonData) {
    });
}

function resetBatch(batchId){
    console.log(batchId);
    console.log('resetBatch');

    batchId = ("00000000" + batchId).slice(-8);

    var headers = new Headers();
    headers.set('Accept', 'application/json');
    var url = 'http://140.114.27.158.xip.io:9302/batch/reset/' + batchId;
    var fetchOptions = {
        method: 'POST',
        headers
    };
    var responsePromise = fetch(url, fetchOptions);
    responsePromise
    .then(function(response) {
        if(response.status == 200 ){
            window.location.reload(true);
        }
        else{
            alert("發生問題，請稍後再試");
        }
        return response.json();
    })
    .then(function(jsonData) {
    });
}


function loadUsers () {
    var headers = new Headers();
    headers.set('Accept', 'application/json');
    var url = 'http://140.114.27.158.xip.io:9302/users/all';
    var fetchOptions = {
        method: 'GET',
        headers
    };
  
    var responsePromise = fetch(url, fetchOptions);

    responsePromise
    .then(function(response) {
        return response.json();
    })
    .then(function(jsonData) {
        console.log(jsonData);
        for (var i=0; i<jsonData.length; i++) {
            if(jsonData[i].hasOwnProperty("verified")){
                if(jsonData[i]["verified"] == "verified"){
                    var userId = jsonData[i]["id"];
                    var userDiv = document.createElement("div");
                    userDiv.setAttribute("class", "col-10");
                    userDiv.innerHTML = 
                        `<div class="panel-heading mb-1"> \
                            <a class="btn btn-outline-dark text-left col-12 collapsed" data-toggle="collapse" href="#${userId}" role="button" aria-expanded="false" aria-controls="${userId}"> \
                            ${jsonData[i]["name"]} (${jsonData[i]["email"]})\
                            </a> \
                        </div> \
                        <div class="panel-collapse collapse" id="${userId}"> \
                            <div class="card card-body" style="word-wrap: normal"> \
                                <p>姓名：${jsonData[i]["name"]}</p> \
                                <p>電子郵件：${jsonData[i]["email"]}</p> \
                                <p>住址：${jsonData[i]["address"]}</p> \
                                <p>身分證字號：${jsonData[i]["id_number"]}</p> \
                                <p>銀行帳戶：${jsonData[i]["bank_code"]} - ${jsonData[i]["account_code"]}</p> \
                                <div style="flex-direction: row"> \
                                <button class="btn btn-outline-success"> \
                                    分派資料\
                                </button> \
                                <button class="btn btn-outline-info"> \
                                    匯款通知\
                                </button> \
                                <button class="btn btn-outline-danger"> \
                                    刪除\
                                </button> \
                            </div> \
                            </div> \
                        </div>`;
                    document.getElementById("verified-users").appendChild(userDiv);
                }else if(jsonData[i]["verified"] == "pending"){
                    var userId = jsonData[i]["id"];
                    var userDiv = document.createElement("div");
                    userDiv.setAttribute("class", "col-10");
                    userDiv.innerHTML = 
                        `<div class="panel-heading mb-1"> \
                            <a class="btn btn-outline-dark text-left col-12 collapsed" data-toggle="collapse" href="#${userId}" role="button" aria-expanded="false" aria-controls="${userId}"> \
                            ${jsonData[i]["name"]} (${jsonData[i]["email"]})\
                            </a> \
                        </div> \
                        <div class="panel-collapse collapse" id="${userId}"> \
                            <div class="card card-body" style="word-wrap: normal"> \
                            <p>姓名：${jsonData[i]["name"]}</p> \
                            <p>電子郵件：${jsonData[i]["email"]}</p> \
                            <p>住址：${jsonData[i]["address"]}</p> \
                            <p>身分證字號：${jsonData[i]["id_number"]}</p> \
                            <p>銀行帳戶：${jsonData[i]["bank_code"]} - ${jsonData[i]["account_code"]}</p> \
                            <div style="flex-direction: row"> \
                                <button class="btn btn-outline-success" onclick="verifyUser('${jsonData[i]["id"]}', 'verified')"> \
                                    確認\
                                </button> \
                                <button class="btn btn-outline-danger" onclick="verifyUser('${jsonData[i]["id"]}', 'rejected')"> \
                                    拒絕\
                                </button> \
                            </div> \
                            </div> \
                        </div>`;
                    document.getElementById("unverified-users").appendChild(userDiv);
                }
            }
        }
    });
}

function loadBatches() {
    var headers = new Headers();
    headers.set('Accept', 'application/json');
    var url = 'http://140.114.27.158.xip.io:9302/batch/all';
    var fetchOptions = {
        method: 'GET',
        headers
    };
  
    var responsePromise = fetch(url, fetchOptions);

    responsePromise
    .then(function(response) {
        return response.json();
    })
    .then(function(jsonData) {
        // console.log(jsonData);
        batch_list_by_folder = {}
        for (var i=0; i<jsonData.length; i++) {
            if(batch_list_by_folder.hasOwnProperty(jsonData[i]["folder_name"])){
                batch_list_by_folder[jsonData[i]["folder_name"]].push(jsonData[i])
            }
            else{
                batch_list_by_folder[jsonData[i]["folder_name"]] = [jsonData[i]]
            }
        }
        // console.log(batch_list_by_folder)
        for(batches in batch_list_by_folder){
            // console.log(batches)
            var batchDiv = document.createElement("div");
            batchDiv.setAttribute("class", "col-10");
            not_annotated_count = 0
            annotating_count = 0
            completed_count = 0
            checked_count = 0

            collpase_content = ``
            for(batch of batch_list_by_folder[batches]){
                // console.log(batch);
                if(batch['checked'] == true){
                    checked_count++
                    label = `<span class="badge badge-success">已檢查</span>`
                    label = label + `<button class="btn-sm btn-outline-info mx-1" onClick="checkBatch(${batch['id']})">檢查</button>`
                }
                else if(batch['progress'] == batch['end_image_id'] - batch['start_image_id'] + 1){
                    completed_count++
                    label = `<span class="badge badge-info">已完成</span>`
                    label = label + `<button class="btn-sm btn-outline-info mx-1" onClick="checkBatch(${batch['id']})">檢查</button>`
                    label = label + `<button class="btn-sm btn-outline-success mx-1" onClick="confirmBatch(${batch['id']})">確認</button>`
                }
                else if(batch['annotated'] == true){
                    annotating_count++
                    label = `<span class="badge badge-warning">標記中</span>`
                    label = label + `<button class="btn-sm btn-outline-info mx-1" onClick="checkBatch(${batch['id']})">檢查</button>`
                    label = label + `<button class="btn-sm btn-outline-warning mx-1" onClick="resetBatch(${batch['id']})">重置</button>`
                }else{
                    not_annotated_count++
                    continue
                }
                annotater = batch['annotater'].split(" ").slice(1).join(" ");
                collpase_content = collpase_content + `
                    <div class="row">
                        編號：${batch['id']}  / 標註者：${annotater}` + label + `
                    </div><hr style="margin:0.5rem"/>
                `
            }

            collpase_content = `
                    <div class="panel-collapse collapse" id="${batches}"> \
                        <div class="card card-body" style="word-wrap: normal"> ` 
                         + collpase_content + 
                       ` </div> \
                    </div> \
                `
            collapse_head = `
                <div class="panel-heading mb-1"> \
                    <a class="btn btn-outline-dark text-left col-12 collapsed" data-toggle="collapse" href="#${batches}" role="button" aria-expanded="false" aria-controls="${batches}"> \
                    <span class="mr-1"><strong>${batches}</strong></span>\
                    <span class="badge badge-danger">${not_annotated_count}</span> \
                    <span class="badge badge-warning">${annotating_count}</span> \ 
                    <span class="badge badge-info">${completed_count}</span> \
                    <span class="badge badge-success">${checked_count}</span>
                    </a> \
                </div> \
            `
            batchDiv.innerHTML = collapse_head + collpase_content
            document.getElementById("annotation-batches").appendChild(batchDiv);
        }
    });
}

window.addEventListener('load', function() {
    console.log('All assets are loaded');
    loadUsers();
    loadBatches();
})