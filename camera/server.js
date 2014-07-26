var tessel = require('tessel');
var express = require('express');
var dataurl = require('dataurl');
var script = '/pic/pic.js';

var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(3000);

app.get('/', function(req, res){
	res.sendfile('./views/index.html');
});

tessel.findTessel({}, function(err, board) {
	if (err) throw err;

	board.run(__dirname + script, ['tessel', script], {}, function () {
		console.log('Running', script);

		board.stdout.pipe(process.stdout);
		board.stderr.pipe(process.stderr);

		// Stop on Ctrl+C.
		process.on('SIGINT', function() {
			setTimeout(function () {
				console.log('Script aborted');
				process.exit(131);
			}, 200);

			console.log('got SIGINT', arguments);
			board.stop();
		});

		board.once('script-stop', function (code) {
			board.close(function () {
				process.exit(code);
			});
		});

		board.on('message', function (buf) {
			var imageAsDataUrl = dataurl.format({
				data: buf,
				mimetype: 'image/jpg'
			});

			console.log('Got image');
			io.emit('image', { image: imageAsDataUrl});
		});
	});
});
