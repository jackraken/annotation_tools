const input = document.getElementById('fileinput');

function uploadPDF() {
    // var input = document.querySelector('input[type="file"]')
    var data = new FormData()
    data.append('file', input.files[0])

    fetch('/upload', {
        method: 'POST',
        body: data
    }).then(function(response) {
        if(response.status == 302) {
            alert("上傳成功");
        }
        return;
    })
}

input.addEventListener('change', uploadPDF, false);