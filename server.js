var express=require('express');
var app=express();
var server=require('http').Server(app);
var io=require('socket.io')(server);
var ejs=require('ejs');
var engine=require('ejs-mate');
var morgan=require('morgan');
var mongoose=require('mongoose');
var bodyParser=require('body-parser');
var session=require('express-session');
var flash=require('express-flash');

var socket=require('./socket/sockets')(io);
var secret=require('./config/conf');
var User=require('./models/user');

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
app.use(session({
	resave:true,
	saveUninitialized:true,
	secret:secret.secretKey,
}));
app.use(flash());
app.engine('ejs',engine);
app.set('view engine','ejs');


var userRoutes=require('./routes/user');
app.use(userRoutes);
var chatRoutes=require('./routes/chat');
app.use(chatRoutes);




app.get('/',function(req,res,next){
	
	if(!req.session.user_id)
		res.render('main/home');
	else
		User.findOne({_id:req.session.user_id},function(error,user){
			if(error) next(error);
			return res.redirect('/chat-window/'+user.username);		
		});
});

app.get('*', function(req, res){
  res.status(404).send('<h1 align="center">Looks like you are in wrong place!</h1><hr><h1 align="center">Error 404</h1>');
});

server.listen(secret.port,function(){
	console.log("Server Listening on Port 3000...");
});