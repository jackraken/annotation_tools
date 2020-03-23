var editting_info = false

var formEl = document.getElementById('personal-info-form');

formEl.addEventListener('submit', function(event) {

  var headers = new Headers();
  headers.set('Accept', 'application/json');

  var formData = new FormData();
  var inputs = formEl.getElementsByTagName("input");
  for (var i = 0; i < inputs.length; ++i) {
    formData.append(inputs[i].name, inputs[i].value);
  }
  console.log(formData);

  var url = 'http://140.114.27.158.xip.io:9302/info/personal';
  var fetchOptions = {
    method: 'POST',
    headers,
    body: formData
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
        // document.getElementById('results').innerText = JSON.stringify(jsonData);
    });
    event.preventDefault();
    setTimeout(function () {
        location.reload()
    }, 100);
    return 
});

document.getElementById("edit-info").onclick = function(){
    editting_info = true
    if(editting_info){
        var elements = document.getElementsByClassName("info");
        Array.prototype.forEach.call(elements, function(element) {
            // console.log(element);
            element.removeAttribute("readonly");
        });
        document.getElementById("submit-info").setAttribute("class","btn btn-primary");
    }
};

document.getElementById("submit-info").onclick = function(){
    editting_info = false
    if(!editting_info){
        var elements = document.getElementsByClassName("info");
        Array.prototype.forEach.call(elements, function(element) {
            // console.log(element);
            element.setAttribute("readonly", "");
        });
        document.getElementById("submit-info").setAttribute("class","hidden btn btn-primary");
    }
}


window.addEventListener('load', function() {
    console.log('All assets are loaded');

    var headers = new Headers();
    headers.set('Accept', 'application/json');
    var url = 'http://140.114.27.158.xip.io:9302/info/personal';
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
                // console.log(key + " -> " + jsonData[key]);
                if(document.getElementsByName(key).length > 0){
                    document.getElementsByName(key)[0].value = jsonData[key];
                }
            }
        }
    });
})