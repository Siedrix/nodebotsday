var tessel = require('tessel');
var request = require('request');

var script = '/board/climate.js';
tessel.findTessel({}, function(err, board) {
	if (err){
		console.log('Something went wrong');
		throw err;
	}

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
			var message = buf.toString();

			request.post('http://requestb.in/1c4ech41', {
				body:JSON.stringify({message:message})
			});
		});
	});
});
