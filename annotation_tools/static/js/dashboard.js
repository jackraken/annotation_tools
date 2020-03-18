const file_input = document.getElementById('fileinput');

function uploadPDF() {
    // var input = document.querySelector('input[type="file"]')
    var data = new FormData()
    data.append('file', file_input.files[0])

    fetch('/upload', {
        method: 'POST',
        body: data
    }).then(function(response) {
        if(response.status == 302 || response.status ==200) {
            alert("上傳成功");
        }
        else {
            alert("發生問題，請重新嘗試");
        }
        return;
    })
}

file_input.addEventListener('change', uploadPDF, false);