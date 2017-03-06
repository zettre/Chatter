var express=require('express');
var app=express();
var server=require('http').Server(app);
var io=require('socket.io')(server);
var ejs=require('ejs');
var engine=require('ejs-mate');
var morgan=require('morgan');
var mongoose=require('mongoose');
var faker=require('faker');
var bodyParser=require('body-parser');

var secret=require('./config/conf');
var User=require('./models/user');
var Chat=require('./models/chat');

mongoose.connect(secret.db,function(error){
	if(error)
	{
		console.log(error);
	}
	else
	{
		console.log("Connected To Database...");
	}
});

app.use(express.static(__dirname+"/public"));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.engine('ejs',engine);
app.set('view engine','ejs');


var users={};

io.on('connection', function(socket){
	
	var user=null;

  	socket.on('username',function(u){
  		user=u;
  		users[user]=socket;
  		for(var key in users)
  		{
  			if(key!==user)
  			{
  				users[key].emit('newUserOnline',user);
  				socket.emit('newUserOnline',key);
  			}
  		}
  		console.log(user+" connected!");
  	});

  	socket.on('message',function(data){
  		var chat=new Chat();
  		chat.to=data.to;
  		chat.from=data.from;
  		chat.message=data.message;
  		chat.time=new Date().getTime();
  		chat.save(function(error,newChat){
  			if(error) console.log(error);
  			if(users[chat.to])
  			users[chat.to].emit('message',newChat);
  		});
	});
  	
  	socket.on('disconnect', function () {
  		delete users.user;
  		for(var key in users)
  		{
  			if(key!==user)
  			{
  				users[key].emit('userOffline',user);
  			}
  		}
    	console.log(user+' disconnected');
  	});

});

app.get('/chat-window/:username',function(req,res,next){
	User.find({},function(error,users){
		if(error) return next(error);
		User.findOne({username:req.params.username},function(err,user){
			if(err) return next(err);
			res.render('chat/chat-window',{user:user,users:users});	
		});
	});
});

app.post('/chats',function(req,res,next){
	Chat.find({$and:[{$or:[{from:req.body.user},{from:req.body.friend}]},{$or:[{to:req.body.user},{to:req.body.friend}]}]},function(error,chats){
			res.json(chats);		
	});
});

app.get('/',function(req,res,next){
	res.render('main/home');
});

server.listen(3000,function(){
	console.log("Server Listening on Port 3000...");
});
