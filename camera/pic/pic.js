var tessel = require('tessel');
var camera = require('camera-vc0706').use(tessel.port.B);

camera.on('ready', function () {
	process.send('Camera ready');

	setInterval(function(){
		camera.takePicture(function(err, image) {
			if(err){
				process.send('Couldn\'t take image');
				process.send(err);
				return;
			}

			process.send(image);
		});

	}, 1000);
});

camera.on('error', function (err) {
	process.send('Err on camera', err);
});
