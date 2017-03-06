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
  		users[chat.to].emit('message',newChat);
  	});
  });
  socket.on('disconnect', function () {
    console.log(user+' disconnected');
  });

});

app.get('/chat-window/:username',function(req,res,next){
	User.find({},function(error,users){
		if(error) return next(error);
		User.findOne({username:req.params.username},function(err,user){
			if(err) return next(err);
			res.render('chat-window',{user:user,users:users});	
		});
	});
});

app.post('/chats',function(req,res,next){
	console.log(req.body);
	Chat.find({$and:[{$or:[{from:req.body.user},{from:req.body.friend}]},{$or:[{to:req.body.user},{to:req.body.friend}]}]},function(error,chats){
			res.json(chats);		
	});
});

app.get('/',function(req,res,next){
	var chat=new Chat();
	chat.from="maximo15";
	chat.to="dora93";
	chat.message=faker.lorem.word();
	chat.time=new Date().getTime();
	chat.save(function(error){
		res.send("done");		
	});
});

server.listen(3000,function(){
	console.log("Server Listening on Port 3000...");
});
