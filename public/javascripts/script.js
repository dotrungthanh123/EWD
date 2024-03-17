const dropArea = document.getElementById('drop-area')
const inputFile = document.getElementById('userfile')
const numUploaded = document.getElementById('num-uploaded')

// Save all the files uploaded
let list = new DataTransfer();

dropArea.addEventListener("dragover", (e) => {
    e.preventDefault()
})

// Check number of files uploaded in console

dropArea.addEventListener("drop", (e) => {
    e.preventDefault()

    // Add files dragged into the box
    var files = e.dataTransfer.files;

    for (var i = 0, l = files.length; i < l; i++) {
        list.items.add(files[i]);
    }

    userfile.files = list.files;
    console.log(userfile.files);
})

inputFile.addEventListener("change", (e) => {

    // Add files uploaded
    var files = e.target.files

    for (var i = 0, l = files.length; i < l; i++) {
        list.items.add(files[i]);
    }

    userfile.files = list.files;
    console.log(userfile.files);
})