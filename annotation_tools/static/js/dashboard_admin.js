window.addEventListener('load', function() {
    var headers = new Headers();
    headers.set('Accept', 'application/json');
    var url = 'http://localhost:8008/download/info';
    var fetchOptions = {
        method: 'GET',
        headers
    };
    var responsePromise = fetch(url, fetchOptions);

    // 3. Use the response
    // ================================
    responsePromise
    // 3.1 Convert the response into JSON-JS object.
    .then(function(response) {
        return response.json();
    })
    // 3.2 Do something with the JSON data
    .then(function(jsonData) {
        console.log(jsonData);
        for (var key in jsonData) {
            if (jsonData.hasOwnProperty(key)) {
                var userDiv = document.createElement("div");
                // userDiv.setAttribute("id", key);
                userDiv.innerHTML = 
                    `<div class="panel-heading mb-1"> \
                        <a class="btn btn-outline-dark text-left col-12" id="${key}" href="http://localhost:8008/download/${key}"> \
                        下載 ${key} 的PDF\
                        </a> \
                    </div>`;
                // userDiv.addEventListener('click', function(e){
                //     console.log(e);
                //     downloadDir = e.target.id;
                //     var headers = new Headers();
                //     var url = 'http://localhost:8008/download/'+downloadDir;
                //     var fetchOptions = {
                //         method: 'GET',
                //         headers
                //     };
                //     fetch(url, fetchOptions).then(

                //     );
                // })
                document.getElementById("userPDFdiv").appendChild(userDiv);
            }
        }
    });
});