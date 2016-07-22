var path = require('path');
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server, {pingTimeout: 5000, pingInterval: 10000});

var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

server.listen(server_port, server_ip_address, function() {
	console.log('Server started');
});

app.get('/', function(req, res, next) {
	if (req.headers.host != 'nameless.pp.ua') {
		return res.redirect(301, 'http://nameless.pp.ua');
	}
	next();
})

app.use('/', express.static(__dirname));

app.use('/favicon.ico', function(){});

app.use(function(req, res) {
	res.send(404, "Page Not Found");
});

app.use(function(err, req, res, next) {
	res.send(500);
});

var rooms = {};
var people = {};

io.on('connection', function(socket){
	console.log("Новое подключение.");

    var roomID, timer;

    socket.on("search", function() {
    	roomID = connecting(rooms, people, socket);
    	timer = setTimeout(function() {
    		disconnecting(rooms, people, roomID);
    		socket.emit("search");
    	}, 60000);

    	socket.on("entry", function() {
    	    clearTimeout(timer);
        });

	    socket.on('message', function(text, cb) {
		    socket.broadcast.to(roomID).emit('message', text);
		    cb();
	    });

	    socket.on('disconnect', function() {
		    socket.broadcast.to(roomID).emit("exit");
		    disconnecting(rooms, people, roomID);
		    console.log("Пользователь отключился.");
	    });
    });
} );

function connecting(rooms, people, socket) {
	//если есть свободный собеседник, выбрать его комнату

	for (var room in rooms) {
		if (rooms[room] == 1) {
            if (people[room].id == socket.id) return;

			rooms[room] = 2;

			people[room].join(room);
			socket.join(room);

			people[room].emit("entry");
			socket.emit("entry");
			
			return room;
		}
	}
    
    //если нет свободных собеседников, создать новую комнату
	var roomID = Math.random() + Math.random();
	for (var room in rooms) {
		if (room == roomID)
			roomID = Math.random() + Math.random();
	}

	rooms[roomID] = 1;
	people[roomID] = socket;
	return roomID;
}

function disconnecting(rooms, people, roomID) {
	if (people.roomID) {
        delete people[roomID];   
    }
    delete rooms[roomID];
}