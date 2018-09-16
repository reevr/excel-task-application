var socket = io('http://localhost:3000');
var uploader = new SocketIOFileClient(socket);
var form = document.getElementById('form');

$('#output-wrapper').hide();

form.onsubmit = function(ev) {
    ev.preventDefault();	
    uploader.on('complete', fileInfo => {
        console.log('Upload Complete', fileInfo);
    });
    uploader.on('error', err => {
        console.log('Error!', err);
    });
    uploader.socket.on('output', outputFileName => {
        showOutputFileLink(outputFileName);
    })
	var fileElement = document.getElementById('file');
	var uploadIds = uploader.upload(fileElement.files);
};

function showOutputFileLink(outputFileName) {
    if (!!outputFileName) {
        const wrapperElement = $('#output')
        $('#output-wrapper').show();
        wrapperElement.attr('href', `/${outputFileName}`);
    }
}