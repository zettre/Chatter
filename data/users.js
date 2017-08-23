var Users=module.exports={
	users:{},
	addUser:function(username,socket){
		Users.users[username]=socket;
	},
	removeUser:function(username){
		if(Users.users[username])
		delete Users.users[username];
	},
	getUser:function(username,callback){
		if(Users.users[username])
			callback(Users.users[username]);
		else
			callback(null);
	},
	getAllUser:function(callback){
		callback(Users.users);
	}

}