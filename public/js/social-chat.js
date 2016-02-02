function socialChat (
	w,
	panelChatMsg, panelLogMsg, panelUserName, panelCanvasView, panelPenColor, panelUserPoint,
	txtUserName, txtChatMsg, txtSelectUser, 
	btnSend, btnSelect, btnConnect, btnDisconnect,
	btnChangeColor, btnCanvasClear
	
) {
	if (!w) {
		throw new Error("argument exception.");
	}
	
	var  d = w.document
		,l = d.location
		,p = l.port
	;
	
	this.isDebug		= true;
	this.isCon			= false;
	this.defaultColor	= "#30c7be";
	this.serverUri		= l.protocol + "//" + l.hostname + (p ? ":"+p : "");
	this.socket			= undefined;
	this.currentUser	= undefined;
	this.currentX		= 0;
	this.currentY		= 0;
	this.userLists		= {};

	this.panel_ChatMsg	= this.getObject(panelChatMsg);
	this.panel_LogMsg	= this.getObject(panelLogMsg);
	this.panel_UserName	= this.getObject(panelUserName);
	this.panel_Canvas	= this.getObject(panelCanvasView);
	this.panel_PenColor	= this.getObject(panelPenColor);
	this.panel_UserPoint= this.getObject(panelUserPoint);
	this.txt_ChatMsg	= this.getObject(txtChatMsg);
	this.txt_UserName	= this.getObject(txtUserName);
	this.txt_SelectUser	= this.getObject(txtSelectUser);
	this.btn_Send		= this.getObject(btnSend);
	this.btn_Select		= this.getObject(btnSelect);
	this.btn_Connect	= this.getObject(btnConnect);
	this.btn_Disconnect	= this.getObject(btnDisconnect);
	this.btn_ChangeColor= this.getObject(btnChangeColor);
	this.btn_CanvasClear= this.getObject(btnCanvasClear);
	
	this.logging("Social Chat. initialize start.");
	this.initializeUI();

	if (typeof(io) != "object") {
		this.logging("Not Found 'Node.js' module in 'spcked.io'.");
	} else {
		this.initializeEvent();
	}

	this.logging("Social Chat. initialize complete.");
};
socialChat.prototype = {
	IIF	: function(exp, val, defaultValue) {
		return (typeof(exp) == "boolean" && exp) ? val : defaultValue;
	},
	getObject : function(obj, defaultValue) {
		return this.IIF((typeof(obj) == "object"), obj, (defaultValue ? defaultValue : null));
	},
	getString : function(str, defaultValue) {
		return this.IIF((typeof(str) == "string"), str, (defaultValue ? defaultValue : ""));
	},
	getName : function(obj) {
		if (obj instanceof jQuery)
			return obj.attr("id");
	},
	setValue : function(obj, value) {
		if (obj instanceof jQuery) {
			obj.val(value);
		}
		else {
			var o = $(obj);
			if (o.length > 0) {
				return this.getName(o);
			}
			else {
				return "";
			}
		}
	},
	showObject : function(obj, isShow) {	
		this.logging("showObject("+ this.getName(obj) +", "+ isShow +")");
		if (obj instanceof jQuery) {
			if (isShow)
				obj.show();
			else
				obj.hide();
		}
	},
	logging : function(msg) {
		if (this.isDebug && window.console) {
			window.console.log(msg);
		}
		this.append(this.panel_LogMsg, (msg ? msg : ""));
		this.panelScrolling(this.panel_LogMsg);
	},
	append : function(obj, msg) {
		if (obj instanceof jQuery) {
			obj.append(msg + "<br/>");
		}
	},
	appendMsg : function(msg, isLogging, isShowMessage) {
		if (typeof(isLogging) == "boolean" && isLogging === true){
			this.logging(msg);
			this.append(this.panel_ChatMsg, (msg ? ("<span style='color:#666669;'>"+msg+"</span>") : ""));
		} else {
			this.append(this.panel_ChatMsg, (msg ? msg : ""));
		}
		if (typeof(isShowMessage) == "boolean" && isShowMessage === true) {
			alert(msg);
		}
		this.panelScrolling(this.panel_ChatMsg);
	},
	panelScrolling : function(obj) {
		var panel = document.getElementById(obj.attr("id"));
		if (panel)	
			panel.scrollTop = panel.scrollHeight;
	},
		
	
	/**
	 * 
	 */
	initializeUI : function() {
		this.showObject(this.btn_Connect, true);
		this.showObject(this.btn_Disconnect, false);
	
		this.logging("Social Chat. initializeUI complete.");
	},
	/**
	 * 
	 */
	initializeEvent : function() {
		var THIS = this;
	
		this.btn_Connect.click(function(e) {
			THIS.connectServer();
		});
		this.btn_Disconnect.click(function(e) {	
			THIS.disconnectServer();
		});
		this.txt_UserName.keypress(function(e) {				
			if(e.which == 13 && $(this).val() != "") {
				THIS.connectServer();
			}
		});
		this.btn_Send.click(function(e) {
			if (THIS.txt_ChatMsg && THIS.txt_ChatMsg.val() != "") {
				THIS.send("send_chat", THIS.txt_ChatMsg.val());
				THIS.txt_ChatMsg.val("");
			}	
		});
		this.txt_ChatMsg.keypress(function(e) {	
			if(e.which == 13 && $(this).val() != "") {
				THIS.btn_Send.click();
			}
		});
		this.btn_Select.click(function(e) {	
			var selectUser	= "";
			var targrtUser	= "";
	
			if (THIS.txt_SelectUser) 
				selectUser = THIS.txt_SelectUser.val();
			
			if (THIS.txt_UserName) {
				targrtUser = THIS.txt_UserName.val();
			}
			THIS.send("secret_chat", selectUser, targrtUser);
		});
		
		this.logging("Social Chat. initializeEvent complete.");
	},
	
	/**
	 * 
	 */
	initializeCanvers : function() {
		var THIS	= this,
			canvas	= (this.panel_Canvas[0] || undefined);
			
		// Canvas Drawing ..
		// panel_Canvas panel_PenColor btn_ChangeColor btn_CanvasClear
		
		// Set ColorPicker.
		this.setColorPicker(this.panel_PenColor);
		
		this.btn_ChangeColor.click(function() {
	    	if (THIS.currentUser) {
	    		THIS.panel_PenColor.colorpicker("show");
	    	}
	    });
	    
	    if (canvas) {
	    	var oPen	= new GraphicPen( canvas );
	    	var oBoard	= new DrawBoard(canvas, {
	    		onDrowStart : function(point) {
	    			if (THIS.currentUser) {
	    				oPen.option.lineColor = THIS.currentUser.color;
	    				oPen.moveTo( point );
	    				
	    				THIS.send("drow_start", THIS.currentUser);
	    			}
	    		},
	    		onDrowing : function(point) {
	    			if (THIS.currentUser) {
	    				oPen.draw( point );
	    				
	    				THIS.send("drow_line", THIS.currentUser);
	    			}
	    		},
	    		onDrowEnd : function(point) {
	    			
	    		}
	    	});
	    	oBoard.initBoard();
	    
	    	// share mouse point.
	   		THIS.panel_Canvas.mousemove(function(e){
				var point = oBoard.getMousePoint(e);
				
				if (THIS.currentX != point.x || THIS.currentY != point.y) {
					//THIS.logging("point chker : "+ e.pageX +"/"+ e.pageY +"?"+ point.x +"/"+ point.y);
					THIS.currentX = point.x;
					THIS.currentY = point.y;
					if (THIS.currentUser) {
						THIS.currentUser.point_x = point.x;
						THIS.currentUser.point_y = point.y;
						THIS.send("sync_point", THIS.currentUser);
					}
				}
			});	
			
			// clear canvas
			THIS.btn_CanvasClear.click(function(e) {
				if (oBoard && oBoard.cleanCanvas) {
					oBoard.cleanCanvas();
				}
			});
	    }
	},



	/**
	 * connect chat server.
	 * use by node.js, socket.io
	 */
	connectServer : function() {
		var THIS = this;
		
		if (String(THIS.txt_UserName.val()).trim() == "") {
			THIS.appendMsg( "Name is empty.!!", true, true);	
			return false;
		}
	
		if (typeof(THIS.socket) == "object") {
			THIS.logging("Is already connected. socket is "+ typeof(THIS.socket) +".");
			return false;
		}
	
		THIS.logging("Try connecting.");
		THIS.socket = io.connect(THIS.serverUri, {'force new connection': true } );
		
		// 서버에 연결되면 연결 메시지 보여줌
		THIS.socket.on('connect', function(){
			THIS.isCon = true;
			THIS.appendMsg( "connected server.", true);	
			THIS.socket.emit("connectuser", THIS.txt_UserName.val() );
			THIS.txt_UserName.attr("readonly", true);
		});
	
		THIS.socket.on('checkvalidation', function (result) {		
			if(result == "-1") 
				THIS.logging( "'socket.io' event on 'checkvalidation'. Already Exists server.");	
	
			THIS.showObject(THIS.btn_Disconnect, false);
			THIS.showObject(THIS.btn_Connect, true);
			
			THIS.socket.removeAllListeners();			
			THIS.socket.disconnect();
		});
		
		THIS.socket.on('update_users', function (data) {					
			THIS.logging("update_users - " + data.peers[data.peers.length-1].name);
	
			THIS.panel_UserName.html("");		
			for(var i=0; i<data.peers.length; i++){ 
				var user = data.peers[i];
				if (user && user.id) {
					if (!THIS.userLists["u_"+ user.id]) {
						THIS.userLists["u_"+ user.id] = user;
					}
					THIS.showUserList(user);
				}
			}
			THIS.bindUserEvent();
		});
		
		THIS.socket.on('update_points', function (data) {
			for(var i=0; i<data.peers.length; i++){ 
				var user = data.peers[i];
				if (user && user.id) {
					THIS.drowUserMousePoint(user);
				}
			}
		});
		
		THIS.socket.on('update_chat', function (data) {	
			THIS.logging("update_chat :" +  data);	
			THIS.appendMsg(data);
			THIS.txt_ChatMsg.focus();
		});		
		
		THIS.socket.on('update_drowStart', function (data) {
			if (data && data.id) {
				var user = THIS.userLists["u_"+ data.id];
				if (user && user.id) {
					user.point_x = data.point_x;
					user.point_y = data.point_y;
					
					if (THIS.currentUser.id != user.id) {
						if (!user.pen) {
							user.pen = new GraphicPen( THIS.panel_Canvas[0] );
						}
						
						user.pen.option.lineColor = data.color
	    				user.pen.moveTo( {x:user.point_x, y:user.point_y} );
					}
				}
			}
		});
		THIS.socket.on('update_drowLine', function (data) {
			if (data && data.id) {
				var user = THIS.userLists["u_"+ data.id];
				if (user && user.id) {
					user.point_x = data.point_x;
					user.point_y = data.point_y;
					
					if (THIS.currentUser.id != user.id) {
						if (user.pen) {
							user.pen.draw( {x:user.point_x, y:user.point_y} );
						}
					}
				}
			}
		});
		
		THIS.socket.on("disconnect" , function () {	
			THIS.logging( "disconnected server." );
			THIS.panel_UserName.html("");		
			THIS.txt_UserName.attr("readonly", false);
			THIS.socket = undefined;
			THIS.isCon = false;
		});
	
		THIS.showObject(THIS.btn_Connect, false);
		THIS.showObject(THIS.btn_Disconnect, true);
		
		// 사용자가 Canva를 사용할 수 있도록 설정함.
		THIS.initializeCanvers();
	},
	/** 
	 * disconnect chat server
	*/
	disconnectServer : function() {
		this.appendMsg( "disconnected server.", true);	
		this.showObject(this.btn_Disconnect, false);
		this.showObject(this.btn_Connect, true);
	
		if (this.socket)
			this.socket.disconnect();
	},
	
	isConnect : function() {
		return (this.socket && this.isCon) ? true : false;
	},
	send : function(cmd, arg1, arg2) {
		if (this.isConnect()) {
			this.socket.emit(cmd, arg1, arg2);
		}
	},
	
	showUserList : function(user) {
		if (user && user.id) {
			if (user.color == "") {
				user.color = this.defaultColor;
			}
			
			var isCurrentUser = false;
			if (this.txt_UserName.val() == user.name) {
				this.currentUser = user;
				isCurrentUser = true;
			}
			
			var userPanel = "<li id='u"+ user.id +"' sessionName='"+ user.name +"'class='list-group-item"+ (isCurrentUser ? " active" : "") +"'>"
				+"<span class='color-picker' style='display:inline-block;width:20px;height:20px;background-color:"+ user.color +";border:1px solid #000;margin-right:7px;'>&nbsp;</span>"
				+"<span class='badge'>"+ user.count +"</span>"+ user.name 
				+"</li>";
			this.panel_UserName.append(userPanel);
			this.drowUserMousePoint(user);
			
			if (isCurrentUser) {
				this.panel_PenColor[0].style.backgroundColor = user.color;
			}
		}
	},
	bindUserEvent : function() {
		var THIS = this,
			items= this.panel_UserName.find("li"),
			item = this.panel_UserName.find("li[sessionName='"+ THIS.currentUser.name +"'] span.color-picker");
		
		if (items && items.length > 0)	{
			items.find("li").click(function(e) {
				if (e && e.currentTarget) {
					var o = $(e.currentTarget),
						n = o.attr("sessionName");
					if (n && n != "" && THIS.currentUser && THIS.currentUser.name != n) {
						THIS.txt_SelectUser.val(o.attr("sessionName"));
					}
				}
			});
		}
		
		if (item && item.length > 0) {
			// Set ColorPicker.
			this.setColorPicker(item);
		}
	},
	drowUserMousePoint : function(user) {
		if (user && user.id) {
			if (user.point_x > 0 || user.point_y > 0) {
				//this.panel_Canvas.append("["+user.name+"]["+user.point_x+"/"+user.point_y+"]<br/>");
				
				var userLabId = "uLab_"+ user.id,
					userLable = $("#uLab_"+ user.id);
				if (userLable.length > 0) {
					userLable.css('top', (user.point_y + 38))
							 .css('left',(user.point_x + 18))
							 .find('span')
							 .css('background', user.color);
				}
				else {
					var lable = '<div '
					+ 'id="'+ userLabId +'" '
					+ 'style="position:absolute;top:-100px;left:-100px;z-index:100;">'
					+ '<span class="label" style="background-color:'+ user.color +';border:1px solid #fff;">'+ user.name +'</span>'
					+ '</div>';	
					this.panel_UserPoint.append(lable);
				}
			}
		}
	},
	
	setColorPicker : function(o) {
		var THIS	= this,
			oStyle	= o[0].style,
			oColor	= "";
			
		o.colorpicker({
	      	  color: oStyle.backgroundColor
	      	, align: 'left'
	      	, format: 'rgba' // force this format
      		, horizontal: false
	    })
	    .on('changeColor', function(ev) {
	    	if (THIS.currentUser) {
	    		oStyle.backgroundColor	= ev.color.toHex();
	    		THIS.currentUser.color= ev.color.toHex();
	    		THIS.logging("selectColor - " + ev.color.toHex());
	    	}
	    })
	    .on('showPicker', function(ev){
	    	if (THIS.currentUser) {
	    		oColor = oStyle.backgroundColor;
	    		ev.color.setColor(oColor);
	    	}
	    	else {
	    		$(this).colorpicker('hide');
	    	}
	    })
	    .on('hidePicker', function(ev){
	    	if (oColor != oStyle.backgroundColor) {
	    		THIS.send("sync_color", THIS.currentUser);
	    	}
	    });
	}
};
