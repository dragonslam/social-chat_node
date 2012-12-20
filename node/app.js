var express = require('express');
var app = express()
  , http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server);

server.listen(8080);

// routing
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

// 채팅에 참여하고 있는 사용자 이름
var usernames = {};

io.sockets.on('connection', function (socket) {

    // 사용자가 sendchat 명령을 내렸을 때 실행됨
	socket.on('sendchat', function (data) {
		// we tell the client to execute 'updatechat' with 2 parameters
		io.sockets.emit('updatechat', socket.username + " >&nbsp;&nbsp;" + data);
	});

	// 사용자가 adduser 명령을 내렸을 때 실행됨
	socket.on('adduser', function(username){
    usernames[username] = socket.username = username;
    io.sockets.emit('updateusers', usernames);
    socket.broadcast.emit('updatechat', socket.username + ' is join.');
	});

	// 사용자가 disconnect 명령을 내렸을 떄 실행됨
	socket.on('disconnect', function(){
		// remove the username from global usernames list
		delete usernames[socket.username];
		// update list of users in chat, client-side
		io.sockets.emit('updateusers', usernames);
		// echo globally that this client has left
		socket.broadcast.emit('updatechat', socket.username + ' has disconnected');
	});
});