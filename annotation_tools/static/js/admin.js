function verifyUser(userId, verify) {
    console.log(userId);
    console.log(verify);

    var headers = new Headers();
    headers.set('Accept', 'application/json');
    var url = hostUrl + '/user/verify?id=' + userId + "&verify=" + verify;
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

function getBatchSize(){
    var headers = new Headers();
    headers.set('Accept', 'application/json');
    var url = hostUrl + '/batch/size';
    var fetchOptions = {
        method: 'GET',
        headers
    };
    var responsePromise = fetch(url, fetchOptions);
    responsePromise
    .then(function(response) {
        if(response.status != 200 ){
            alert("發生問題，請稍後再試");
        }
        return response.json();
    })
    .then(function(jsonData) {
        document.getElementById("batch_size").textContent = jsonData['batch_size']
    });
}

function editBatchSize(){
    var new_batch_size = prompt("輸入新批次大小","")
    new_batch_size = parseInt(new_batch_size)
    if(new_batch_size > 0 && new_batch_size <= 100){
        var headers = new Headers();
        headers.set('Accept', 'application/json');
        var url = hostUrl + '/batch/size/' + new_batch_size;
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
    else{
        alert('輸入錯誤，請再試一次')
    }
}

function checkUserStat(userId){
    var win = window.open(hostUrl + '/user_stat/' + userId, '_blank');
    if (win) {
        win.focus();
    } else {
        alert('Please allow popups for this website');
    }
}

function checkBatch(batchId){
    console.log('checkBatch')
    console.log(batchId)

    // batchId = ("00000000" + batchId).slice(-8)
    var win = window.open(hostUrl + '/edit_images/' + batchId, '_blank');
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
    var url = hostUrl + '/batch/confirm/' + batchId;
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
    console.log('resetBatch')
    // batchId = ("00000000" + batchId).slice(-8);
    // console.log(batchId);
    var headers = new Headers();
    headers.set('Accept', 'application/json');
    var url = hostUrl + '/batch/reset/' + batchId;
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

function assignBatchToUser(batchId, userEmail){
    console.log("assign " + batchId + " to " + userEmail)
    var headers = new Headers();
    headers.set('Accept', 'application/json');
    var formData = new FormData();
    formData.append("batchId", batchId);
    formData.append("userEmail", userEmail);

    var url = hostUrl + '/batch/assign';
    var fetchOptions = {
        method: 'POST',
        headers,
        body: formData
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

function getFolderBatches(type, provider_name, folder_name){
    var headers = new Headers();
    headers.set('Accept', 'application/json');
    var url = hostUrl + '/batch/' + type + '/' + provider_name + '/' + folder_name;
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
        let batchDiv = document.getElementById(type+provider_name+folder_name)
        console.log(jsonData)
        console.log(batchDiv)
        console.log(batchDiv.firstChild)
        count = 0
        for(var i=0; i<batchDiv.firstChild.childNodes.length; i++){
            element = batchDiv.firstChild.childNodes[i]
            if(element.tagName == "DIV"){
                batch = jsonData['annotated_batches'][count]
                count++
                console.log(batch)
                if(typeof batch == ('undefined'))break;
                if(!batch.hasOwnProperty('checked'))break;
                if(!batch.hasOwnProperty('completed'))break;
                if(!batch.hasOwnProperty('annotated'))break;
                if(!batch.hasOwnProperty('annotater'))break;
                if(batch['checked'] == true){
                    label = `<span class="badge badge-success">已檢查</span>`
                    label = label + `<button class="btn-sm btn-outline-info mx-1" onClick="checkBatch('${batch['id']}')">檢查</button>`
                }
                else if(batch['completed'] == true){
                    label = `<span class="badge badge-info">已完成</span>`
                    label = label + `<button class="btn-sm btn-outline-info mx-1" onClick="checkBatch('${batch['id']}')">檢查</button>`
                    label = label + `<button class="btn-sm btn-outline-success mx-1" onClick="confirmBatch('${batch['id']}')">確認</button>`
                }
                else if(batch['annotated'] == true){
                    label = `<span class="badge badge-warning">標記中</span>`
                    label = label + `<button class="btn-sm btn-outline-info mx-1" onClick="checkBatch('${batch['id']}')">檢查</button>`
                    label = label + `<button class="btn-sm btn-outline-warning mx-1" onClick="resetBatch('${batch['id']}')">重置</button>`
                }
                annotater = batch['annotater'].split(" ").slice(1).join(" ");
                element.innerHTML =
                    `編號：${batch['id']}  / 標註者：${annotater}` + label
            }
        }
        let assignBatchDiv = document.createElement("div")
        let batchDropdownDiv = document.createElement("div")
        let userDropdownDiv = document.createElement("div")
        assignBatchDiv.setAttribute("class", "d-flex align-items-center")
        batchDropdownDiv.setAttribute("class", "dropdown mx-1")
        userDropdownDiv.setAttribute("class", "dropdown mx-1")
        batch_dropdown_content = ``
        for(batch of jsonData['not_annotated_batches']){
            batch_dropdown_content = batch_dropdown_content + 
                `<a class="dropdown-item"><small>批次編號:${batch["id"]}</small></a>`
        }
        batchDropdownDiv.innerHTML =
            `<button class="btn btn-sm btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton${provider_name + folder_name}" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                選擇批次
            </button>
            <div class="dropdown-menu" aria-labelledby="dropdownMenuButton${provider_name + folder_name}">`
                + batch_dropdown_content +
            `</div>`
        assignBatchDiv.appendChild(batchDropdownDiv)

        textDiv = document.createElement("span")
        textDiv.innerHTML = "<small>分配給</small>"
        assignBatchDiv.appendChild(textDiv)

        verified_user_btns = document.querySelectorAll(".btn-verified-user")
        user_dropdown_content = ``
        for(verified_user_btn of verified_user_btns){
            // console.log(verified_user_btn)
            // console.log(verified_user_btn.text)
            // console.log(verified_user_btn.textContext)
            user_dropdown_content = user_dropdown_content + 
                `<a class="dropdown-item"><small>${verified_user_btn.text}</small></a>`
            console.log(user_dropdown_content)
        }
        userDropdownDiv.innerHTML =
            `<button class="btn btn-sm btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton${provider_name + folder_name}2" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                選擇使用者
            </button>
            <div class="dropdown-menu" aria-labelledby="dropdownMenuButton${provider_name + folder_name}2">`
                + user_dropdown_content +
            `</div>`
        assignBatchDiv.appendChild(userDropdownDiv)

        submitDiv = document.createElement("button")
        submitDiv.setAttribute("class", "btn btn-sm btn-outline-secondary")
        submitDiv.addEventListener('click', (e)=>{
            console.log('submit batch assignment')
            batchId = e.target.previousElementSibling.previousElementSibling.previousElementSibling.firstChild.textContent.split(':').pop().trim()
            console.log(batchId)
            if(batchId.length != 8){
                console.log("batchId wrong")
                return
            }
            userEmail = e.target.previousElementSibling.firstChild.textContent
            userEmail = userEmail.split('(').pop().trim().slice(0, -1); 
            console.log(userEmail)
            assignBatchToUser(batchId, userEmail)
        })
        submitDiv.textContent = "確定"
        assignBatchDiv.appendChild(submitDiv)

        batchDiv.firstChild.appendChild(assignBatchDiv)

        $(".dropdown-menu a").click(function(){
            console.log('click')
            $(this).parents(".dropdown").find('.btn').html($(this).text() + ' <span class="caret"></span>');
            $(this).parents(".dropdown").find('.btn').val($(this).data('value'));
        });
    });
}

function reloadFolders () {
    var headers = new Headers();
    headers.set('Accept', 'application/json');
    var url = hostUrl + '/reload' ;
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
    var url = hostUrl + '/users/all';
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
                            <a class="btn btn-outline-dark text-left col-12 collapsed btn-verified-user" data-toggle="collapse" href="#${userId}" role="button" aria-expanded="false" aria-controls="${userId}"> \
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
                                <button class="btn btn-outline-info" onclick="checkUserStat('${userId}')"> \
                                    數據統計\
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
    var url = hostUrl + '/batch/all';
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
                else if(batch['completed'] == true){
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

            collpase_content = 
                `<div class="panel-collapse collapse" id="${batches}"><div class="card card-body" style="word-wrap: normal">` 
                    + collpase_content + 
                `</div></div>`
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

function showProviders(type, jsonData){
    folder_list_by_provider = {}
    for (var i=0; i<jsonData.length; i++) {
        folder_list_by_provider[jsonData[i]['provider_name']] = jsonData[i]['folders']
    }
    for(provider in folder_list_by_provider){
        folders = folder_list_by_provider[provider]
        console.log(provider)
        console.log(folders)
        var providerDiv = document.createElement("div");
        providerDiv.setAttribute("class", "col-10");
        not_annotated_count = 0
        annotating_count = 0
        completed_count = 0
        checked_count = 0

        providerDiv.innerHTML = `<p class="my-2">${provider}</p>`
        for(idx in folders){
            folder = folders[idx]
            if(folder.hasOwnProperty('deleted')){
                if(folder['deleted']){
                    continue
                }
            }
            console.log(folder)
            not_annotated_count = folder['batch_count'] - folder['annotated']
            annotating_count = folder['annotated'] - folder['completed']
            completed_count = folder['completed'] - folder['checked']
            checked_count = folder['checked']
            collapse_head = `
                <div class="panel-heading mb-1"> \
                    <a class="btn btn-outline-dark text-left col-12 collapsed" data-toggle="collapse" 
                        href="#${type + provider + folder['folder_name']}" role="button" 
                        aria-expanded="false" aria-controls="${type + provider + folder['folder_name']}"
                        onClick="getFolderBatches('${type}', '${provider}', '${folder['folder_name']}')"> \
                    <span class="mr-1"><strong>${folder['folder_name']}</strong></span>\
                    <span class="badge badge-danger">${not_annotated_count}</span> \
                    <span class="badge badge-warning">${annotating_count}</span> \ 
                    <span class="badge badge-info">${completed_count}</span> \
                    <span class="badge badge-success">${checked_count}</span>
                    </a> \
                </div> \
            `
            // providerDiv.appendChild(collapse_head)
            let collpase_content = ``
            for(var i=0; i<folder['annotated']; i++){
                collpase_content = collpase_content + 
                    `<div class="row">
                    </div><hr style="margin:0.5rem"/>`
            }
            collpase_content = 
                `<div class="panel-collapse collapse" id="${type + provider + folder['folder_name']}"><div class="card card-body" style="word-wrap: normal">`
                    + collpase_content +
                `</div></div>`
            providerDiv.innerHTML += collapse_head + collpase_content
        }
    //     batchDiv.innerHTML = collapse_head + collpase_content
        document.getElementById("annotation-batches-" + type).appendChild(providerDiv);
    }
}

function loadProviders() {
    var headers = new Headers();
    headers.set('Accept', 'application/json');
    var url = hostUrl + '/providers';
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
        showProviders('outsourcing', jsonData['outsourcing'])
        showProviders('internal', jsonData['internal'])
    });
}

window.addEventListener('load', function() {
    console.log('All assets are loaded');
    loadUsers();
    // loadBatches();
    loadProviders();
    getBatchSize();
})