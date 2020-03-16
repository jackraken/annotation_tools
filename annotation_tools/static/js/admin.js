function verifyUser(userId, verify) {
    console.log(userId);
    console.log(verify);

    var headers = new Headers();
    headers.set('Accept', 'application/json');
    var url = 'http://localhost:8008/user/verify?id=' + userId + "&verify=" + verify;
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

window.addEventListener('load', function() {
    console.log('All assets are loaded');

    var headers = new Headers();
    headers.set('Accept', 'application/json');
    var url = 'http://localhost:8008/users/all';
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
})