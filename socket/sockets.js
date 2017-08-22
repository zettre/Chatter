var users=require('../data/users');
var Chat=require('../models/chat');

module.exports=function(io){
  io.on('connection', function(socket){
  
  var username=null;

    socket.on('username',function(u){
      username=u;
      users.addUser(username,socket);
      users.getAllUser(function(usrs){
      for(var key in usrs)
      {
        if(key!==username)
        {
          usrs[key].emit('newUserOnline',username);
          socket.emit('newUserOnline',key);
        }
      }
      });
      
      console.log(username+" connected!");
    });

    socket.on('message',function(data){
      var chat=new Chat();
      chat.to=data.to;
      chat.from=data.from;
      chat.message=data.message;
      chat.time=new Date().getTime();
        chat.isRead=false;
      chat.save(function(error,newChat){
        if(error) console.log(error);
        users.getUser(chat.to,function(user){
          if(user!==null)
            user.emit('message',newChat);
        });
      });
  });
    
    socket.on('disconnect', function () {
      users.removeUser(username);
      users.getAllUser(function(usrs){
      for(var key in usrs)
      {
        if(key!==username)
        {
          usrs[key].emit('userOffline',username);
        }
      }       
      });
      console.log(username+' disconnected');
    });

});

}