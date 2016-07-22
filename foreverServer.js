var forever = require('forever-monitor');

var child = new(forever.Monitor)('server.js');

child.on('watch:restart', function(info) {
    console.log('Restaring script because ' + info.file + ' changed');
});

child.on('restart', function() {
    console.log('Forever restarting script for ' + child.times + ' time');
});

child.on('exit:code', function(code) {
    console.log('Forever detected script exited with code ' + code);
});

child.start();