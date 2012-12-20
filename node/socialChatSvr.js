 
/*
     http://localhost:8080	 
*/	 
var express	= require('express');
var sys		= require("sys");
var http		= require('http');

var app			= express();
var server		= http.createServer(app);
var io				= require('socket.io').listen(server);
var port			= 8080;
var sessions	= null;
var isDebug		= true;



io.set('log level',2);

server.listen(port);

// routing
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

logging("dbug", "Start Server " + port );

//connection
io.sockets.on('connection', function (socket) {	
	var session = new Session( "New" );
	
	logging("dbug", session.id+ ": Connected"   );
	
	//adduser
	socket.on('adduser', function (data) {				
		if ( sessions.findByName( data ) == null )
		{			
			session.id= socket.id;
			session.name = data;			
			sessions.add( session );						
			io.sockets.emit( 'updateusers' , {peers: sessions.list} );
			logging("dbug", "[add-user] "+ session.id +":"+ data   );
		} 
		else{
			socket.emit( 'checkvalidation', "-1" );	
		}
	});

	//sendchat
	socket.on('sendchat', function (data) {		
		logging("dbug", "[sendchat] "+ session.id   );			
		io.sockets.emit( 'updatechat' , session.name +":" + data );
	});
	
	//sendsecretchat
	socket.on('sendsecretchat', function (user, data) {		

		if ( (session.name != user) && (sessions.findByName(user) != null))
		{
			var tmp = sessions.findByName(user).id;
			logging("dbug", "id : " + tmp);
			logging("dbug", "session.name : " + session.name);
			socket.emit( 'updatechat' , session.name +":" + data );
			io.sockets.sockets[tmp].emit( 'updatechat' , session.name +":" + data );
		}

		
	});

	//disconnect
	socket.on ('disconnect' , function () {
		logging("dbug", "[disconnect]"+ session.id );	
		
		if ( sessions.find( session.id ) != null ){	
			io.sockets.emit( 'updatechat' , session.name +" is out."  );		
			sessions.delete( session );		
			io.sockets.emit( 'updateusers' , {peers: sessions.list} );			
		}
	});	
});


function Session ( name ) {
	this.id = 0;
	this.name = name;	
	return this;
}
function Sessions() {
	
	//var idGen = 1;	
	this.list = new Array();
	
	this.find = function( id ) {		
		var i;
		
		for ( i = 0 ; i < this.list.length ; i++ ) {
			if ( this.list[i].id == id ) return this.list[i];
		}		
		return null;		
	};
	
	this.findByName = function( name ) {		
		var i;
				
		for ( i = 0 ; i < this.list.length ; i++ ) {
			if ( this.list[i].name == name )  {
				return this.list[i];
				//break;
			}
		}		
		return null;		
	};	
	
	this.deleteWithID = function( id ) {		
		var i;
				
		for ( i = 0 ; i <  this.list.length ; i++ ) {
			if (  this.list[i].id == id ) {			
				 this.list.splice( i,1 );
			}
		}		
	}

	this.delete = function( obj ) {		
		var i;
		
		for ( i = 0 ; i <  this.list.length ; i++ )
		{
			if (  this.list[i] == obj ) {
			
				 this.list.splice( i,1 );
			}
		}
	}
	
	this.print = function() {
		for ( i = 0 ; i < this.list.length ; i++ )
		{
			console.log ( "#### session:" +this.list[i].id  +"," + this.list[i].name );
		}
	}
	
	this.add = function ( obj ) {	
		//obj.id = idGen;
		this.list.push( obj );			
		//idGen ++;
	}
	
	return this;		
}
sessions = new Sessions();


//unitTest();
function unitTest() 
{
	sessions.add( new Session(  "Hello" ));
	sessions.add( new Session(  "Hello2" ));
	sessions.add( new Session(  "Hello3" ));
	sessions.print();
	sessions.find( 1 ).name = "Changed" ;
	sessions.delete( sessions.find( 2 ) );
	sessions.print();
}

function printSessions() {
	for ( i = 0 ; i < sessions.length ; i++ ) {
		sys.puts("session[" +sessions[i].id  +"] " + sessions[i].name );
	}
}

function logging(title, msg) {
	if (isDebug) {
		console.log ( "   ["+ title +"] "+ msg  );
	}	
}