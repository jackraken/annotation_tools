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

window.addEventListener('load', function() {
    console.log('All assets are loaded');
    var headers = new Headers();
    headers.set('Accept', 'application/json');
    var url = hostUrl + '/salary/user';
    this.console.log(url)
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
            var userId = jsonData[i]["userId"];
            var salaryDiv = document.createElement("div");
            salaryDiv.setAttribute("class", "col-10");
            var salaryStatus = "錯誤"
            var salaryStatusStyle = "color:red;"
            var actionButtonStyle = "display: none"
            if(jsonData[i].hasOwnProperty("completed") && jsonData[i].hasOwnProperty("checked")){
                if(!jsonData[i]["completed"]){
                    salaryStatus = "待處理"
                    salaryStatusStyle = "color: goldenrod;"
                    actionButtonStyle = ""
                }
                else if(!jsonData[i]["checked"]){
                    salaryStatus = "已匯出"
                    salaryStatusStyle = "color:royalblue;"
                }
                else {
                    salaryStatus = "已確認"
                    salaryStatusStyle = "color:lightgreen;"
                }
            }
            salaryDiv.innerHTML = 
                `<div class="mb-1"> \
                    <div class="btn btn-outline-dark text-left col-12"> \
                        <div> \
                            <span class="mx-2">編號：${jsonData[i]["id"]}</span>\
                            <span class="mx-2">姓名：${jsonData[i]["userName"]}</span>\
                            <span class="mx-2">日期：${jsonData[i]["date"]}</span>\
                        </div> \
                        <div> \
                            <span class="mx-2">總額：${jsonData[i]["amount"]}</span>\
                            <span class="mx-2" style="${salaryStatusStyle}">狀態：${salaryStatus}</span> \
                            <button class="btn-sm btn-outline-success text-left" style="${actionButtonStyle}">確認匯款</button> \
                        </div> \
                    </div> \
                </div>`;
            document.getElementById("salaries").appendChild(salaryDiv);
        }
    });
})