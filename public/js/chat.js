
$(document).ready(function(){
var b=$('#userName').clone();
b.children('img').remove();
var user=b.text().trim();
var friend=null;
var socket=io();
socket.emit('username',user);
socket.on('message',function(chat){
	if(chat.from===friend)
	{
		$('#chatArea').append('<div class="bubble-container"><div class="bubble you">'+chat.message+'</div></div>');
		$("#chatWindow").animate({ scrollTop: $('#chatWindow').prop("scrollHeight")}, 1000);
	}
	else
	{
		var f="#"+chat.from;
		if($(f).find('#newMessage').html()==="")
		{
		$(f).find('#newMessage').html("new");
		$(f).prependTo('#list');
		}
	}
});
function sendMessage(message)
{
	var data={};
	data["to"]=friend;
	data["from"]=user;
	data["message"]=message;
	socket.emit('message',data);
	$('#chatArea').append('<div class="bubble-container"><div class="bubble me">'+message+'</div></div>');
	var f="#"+friend;
	$(f).prependTo('#list');
	$("#chatWindow").animate({ scrollTop: $('#chatWindow').prop("scrollHeight")}, 1000);

}
function fillChatArea(user,friend)
{
	var data={};
	data["user"]=user;
	data["friend"]=friend;
	$.ajax({
		url:"http://localhost:3000/chats",
		type:"POST",
		data:JSON.stringify(data),
		contentType:"application/json",
		success:function(res){
			for(i=0;i<res.length;i++)
			{
				if(res[i].from===friend)
				{
					$('#chatArea').append('<div class="bubble-container"><div class="bubble you">'+res[i].message+'</div></div>');
				}
				else
				{
					$('#chatArea').append('<div class="bubble-container"><div class="bubble me">'+res[i].message+'</div></div>');	
				}
			}
		},
		failure:function(){
			alert("Unable to send request, Please try after some time.");
		}
	});
}
$('.collection-item').click(function(){
      $('#friend').html('<div class="chip"><img src="'+$(this).find("img").attr("src")+'">'+$(this).find("p").text()+'</div>');
      friend=$(this).find("p").text();
      $('#chatArea').html("");
      fillChatArea(user,friend);
      $("#chatWindow").animate({ scrollTop: $('#chatWindow').prop("scrollHeight")}, 1000);
      var f="#"+friend;
      $(f).find('#newMessage').html("");
});
$('#search').keyup(function(){
	var query=$('#search').val();
	var regExp = new RegExp(query, 'i');
	$('.collection-item').each(function(i,div){
		if(regExp.test($(div).find("p").text()))
		{
			$(this).show();
		}	
		else
		{
			$(this).hide();
		}
	});
});
$('#messageButton').click(function(){
	var txt=$('#messageText').val();
	if(txt==="") return;
	sendMessage(txt);
	$('#messageText').val("");
	$('#messageText').focus();
});
$('#messageText').keypress(function(e){
	if(e.which==13)
	{
	var txt=$('#messageText').val();
	if(txt==="") return;
	sendMessage(txt);
	$('#messageText').val("");
	$('#messageText').focus();
	}
});
});