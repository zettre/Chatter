var router=require('express').Router();
var multer=require('multer');
var fs=require('fs');
var path=require('path');
var User=require('../models/user');
var Chat=require('../models/chat');
var users=require('../data/users');
var support=require('../utility/support');

var storage =   multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './public/uploads');
  },
  filename: function (req, file, callback) {
    callback(null, file.fieldname + '-' + Date.now()+'.'+file.mimetype.split('/')[1]);
  }
});
var upload = multer({ storage : storage}).single('file');

router.get('/login',function(req,res,next){
	if(!req.session.user_id)
		res.render('user/login',{message:req.flash('message')});
	else
		User.findOne({_id:req.session.user_id},function(error,user){
			if(error) next(error);
			return res.redirect('/chat-window/'+user.username);		
		});
});

router.post('/login',function(req,res,next){
	var username=req.body.username;
	var password=req.body.password;
	if(username===null || username==="")
	{
		req.flash('message','Invalid Username!');
		return res.redirect('/login');
	}
	if(password===null || password==="")
	{
		req.flash('message','Password Required!');
		return res.redirect('/login');
	}
	User.findOne({username:username},function(error,existingUser){
		if(error)
		{
			req.flash('message','Username Doesn\'t Exist!');
			return res.redirect('/login');
		}
		var user=new User();
		user.password=existingUser.password;
		if(user.comparePassword(password))
		{
			if(!req.session.user_id)
			req.session.user_id=existingUser._id;
			return res.redirect('/chat-window/'+username);
		}
		else
		{
			req.flash('message','Incorrect Password!');
			return res.redirect('/login');
		}
	});
});

router.get('/signup',function(req,res){
	if(!req.session.user_id)
		res.render('user/signup',{message:req.flash('message')});
	else
		User.findOne({_id:req.session.user_id},function(error,user){
			if(error) next(error);
			return res.redirect('/chat-window/'+user.username);		
		});
});

router.post('/signup',function(req,res,next){
	var user=new User();
	user.name=req.body.name;
	user.username=req.body.username;
	user.email=req.body.email;
	user.password=req.body.password;
	user.image="/images/profile.png";
	if(!(req.body.name && req.body.username && req.body.email && req.body.password))
	{
		req.flash('message','Please Complete All The Fields!');
		return res.redirect('/signup');
	}
	User.findOne({$or:[{username:req.body.username},{email:req.body.email}]},function(error,existingUser){
		if(error) return next(error);
		if(existingUser)
		{
			req.flash('message','User Already Exists!');
			return res.redirect('/signup');
		}
		else
		{
			user.save(function(error,usr){
				if(error) return next(error);
				users.getAllUser(function(users){
				for(var u in users)
				{
					if(u!==usr.username)
					{
						users[u].emit("newUserRegistered",usr);						
					}
				}					
				});
				if(!req.session.user_id)
				req.session.user_id=usr._id;
				return res.redirect('/chat-window/'+user.username);
			});
		}
	});
});

router.get('/edit-profile/:username',support.checkAuth,function(req,res,next){
	User.findOne({username:req.params.username},function(error,user){
		if(error) return next(error);
		res.render('user/edit-profile',{user:user,message:req.flash('message')});
	});
});

router.post('/edit-profile/:username',support.checkAuth,function(req,res,next){
	upload(req,res,function(error){
		if(error) return next(error);
		var picture=null;
		if(typeof req.file!=='undefined'){ 
			picture="/uploads/"+req.file.filename;
		}

		User.findOne({username:req.params.username},function(error,user){
			if(error) return next(error);
			if(req.body.name) user.name=req.body.name;
			if(picture){
				var imagePath=path.join(__dirname,"..","public"); 
				if(fs.existsSync(imagePath+user.image) && user.image!=="/images/profile.png")
					fs.unlink(imagePath+user.image);
				user.image=picture; 
			}
			user.save(function(error,usr){
				if(error) return next(error);
				users.getAllUser(function(users){
				for(var u in users)
				{
					if(u!==usr.username)
					{
						users[u].emit("profilePicEdited",usr);						
					}
				}					
				});

				req.flash('success','Successfully Edited Profile.');
				return res.redirect('/chat-window/'+req.params.username);
			});
		});
	});
});

router.get('/logout',support.checkAuth,function(req,res,next){
	delete req.session.user_id;
	return res.redirect('/');
});

module.exports=router;