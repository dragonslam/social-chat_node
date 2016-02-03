
/**
 * Node HTTP Server for express Module Module dependencies.
 *  - Social Chat Server.
 * 
 * by dragonslam, 2016-01-05
 */

var isDebug = true;
var express = require('express')
  , routes  = require('./routes')
  , user    = require('./routes/user')
  , http    = require('http')
  , path    = require('path');

var app = express();

app.configure(function(){
  app.set('app-name',     'Chat for DragonSLAM.NET');
  app.set('app-version',  '0.0.1');
  app.set('app-company',  'DragonSLAM.NET');
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

// //////////////////////////////////////////////////////////////////////
// routing
app.get('/', routes.index);
app.get('/users', user.list);
// //////////////////////////////////////////////////////////////////////


logging("dbug", "Start Server " + app.get('port'));

var sessions= null
	,server = null
	,io		= null
	,counts	= 0
	,current= 0
	,colors	= ["#3b08cc","#cc084f","#08cc27",,"#08ccc0","#cc8908"]
	;
	
server = http.createServer(app)
  .listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
  });

// set socket io.
io = require('socket.io').listen(server);
io.set('log level',2);

//chat connection handler. 
io.sockets.on('connection', function (socket) {	
	var session = new Session( "New" );
	
	logging("dbug", "New User Connected. ("+ session.id +")"   );
	
	//connectUser
	socket.on('connectuser', function (data) {				
		if ( sessions.findByName( data ) == null ) {			
			counts++;
			current++;
			session.id= socket.id;
			session.name = data;
			session.color= colors[counts%colors.length];
			sessions.add( session );
			
			logging("dbug", "[connectUser] "+ session.id +":"+ data);
			io.sockets.emit('update_users' , {peers: sessions.list} );
		} 
		else{
			io.socket.emit('checkvalidation', "-1" );	
		}
	});

	//sendchat
	socket.on('send_chat', function (data) {		
		session.count++;
		logging("dbug", "[sendMessage]["+ session.count +"] "+ session.id   );
		io.sockets.emit('update_chat',  session.name +":" + data );
		io.sockets.emit('update_users', {peers: sessions.list} );
	});
	
	//sendsecretchat
	socket.on('secret_chat', function (user, data) {	
		if ((session.name != user) && (sessions.findByName(user) != null)) {
			var tmp = sessions.findByName(user).id;
			logging("dbug", "[secretMesge] : "+ session.name +"=>" + tmp);
			socket.emit( 'update_chat' , session.name +":" + data );
			io.sockets.sockets[tmp].emit( 'update_chat' , session.name +":" + data );
		}
	});

	//synchroniz User color from colorplcker.
	socket.on ('sync_color' , function (data) {
		logging("dbug", "[sync_color] "+ data.name +"/"+ data.color );	
		
		if (sessions.find( session.id ) != null ){
			session.color = data.color;
			io.sockets.emit('update_users' , {peers: sessions.list} );
		}
	});	
	
	//synchroniz Point
	socket.on ('sync_point' , function (data) {
		//logging("dbug", "[sync_point] "+ data.name +"/["+data.point_x+"/"+data.point_y+"]" );	
		
		if (sessions.find( data.id ) != null ){
			session.point_x = data.point_x;
			session.point_y = data.point_y;
			io.sockets.emit('update_points' , {peers: sessions.list} );
		}
	});	
	
	//drow start 
	socket.on ('drow_start' , function (data) {
		//logging("dbug", "[drow_start] "+ data.name +"/["+data.point_x+"/"+data.point_y+"]" );	
		
		if (sessions.find( data.id ) != null ){
			session.point_x = data.point_x;
			session.point_y = data.point_y;
			io.sockets.emit('update_drowStart' , session );
		}
	});	
	
	//drow line 
	socket.on ('drow_line' , function (data) {
		//logging("dbug", "[drow_line] "+ data.name +"/["+data.point_x+"/"+data.point_y+"]" );	
		
		if (sessions.find( data.id ) != null ){
			session.point_x = data.point_x;
			session.point_y = data.point_y;
			io.sockets.emit('update_drowLine' , session );
		}
	});	
	
	//disconnect
	socket.on ('disconnect' , function () {
		logging("dbug", "[discontUser] "+ session.id );	
		
		if (sessions.find( session.id ) != null ){	
			io.sockets.emit('update_chat' , session.name +" is out."  );
			sessions.delete(session);
			io.sockets.emit('update_users' , {peers: sessions.list} );
			
			current--;
		}
	});	
});






// //////////////////////////////////////////////////////////////////////
// Session Model.
function Session ( name ) {
	this.id		= 0;
	this.name	= name;
	this.count	= 0;
	this.color	= "";
	this.point_x= 0;
	this.point_y= 0;
	return this;
}
function Sessions() {
	
	this.list = new Array();
	
	this.find = function( id ) {
		for (var i = 0 ; i < this.list.length ; i++ ) {
			if (this.list[i].id == id ) return this.list[i];
		}		
		return null;		
	};
	
	this.findByName = function( name ) {		
		for (var i = 0 ; i < this.list.length ; i++ ) {
			if ( this.list[i].name == name )  {
				return this.list[i];
			}
		}
		return null;		
	};	
	
	this.deleteWithID = function( id ) {
		for (var i = 0 ; i <  this.list.length ; i++ ) {
			if (this.list[i].id == id ) {			
				this.list.splice( i,1 );
			}
		}		
	}

	this.delete = function( obj ) {		
		for (var i = 0 ; i <  this.list.length ; i++ ) {
			if (this.list[i] == obj ) {
				this.list.splice( i,1 );
			}
		}
	}
	
	this.print = function() {
		for (var i = 0 ; i < this.list.length ; i++ ) {
			console.log ( "#### session:" +this.list[i].id  +"," + this.list[i].name );
		}
	}
	
	this.add = function ( obj ) {	
		this.list.push( obj );
	}
	
	return this;		
}
sessions = new Sessions();


/**
 * Common Util..
 * 
**/
// Logging
function logging(title, msg) {
	if (isDebug) {
		console.log ( "   ["+ title +"] "+ msg  );
	}	
}

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
	for (var i = 0 ; i < sessions.length ; i++ ) {
		sys.puts("session[" +sessions[i].id  +"] " + sessions[i].name );
	}
}