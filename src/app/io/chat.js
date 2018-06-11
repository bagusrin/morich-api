var empty = require('is-empty');
const axios = require('axios');
var cfg = require('../../../config');

module.exports.io 	= function (app, io, http, socket) {

	let socketUserId = socket.request._query['userId'];
	socket.room 	= socketUserId;
	socket.join(socket.room); // create socket room ID.

	socket.on('chatList', function (data) {

		axios.get(cfg.localhost+'chat/list?email='+data.email)
			.then(response => {
				
				if(response.data.success){
					//console.log('get chatlist success');
					//console.log(response.data);
					socket.emit('chatListResponse', response.data);
				}

			}).catch(error => {
		    	socket.emit('errors','get chat list failed');
		    });	
	});

	socket.on('sendChat', function (data) {

		axios.post(cfg.localhost+'chat/send', data)
		  .then(function (response) {
		    
		    if(response.data.success){
		    	var transactTime = response.data.data.transactTime;
		    	axios.get(cfg.localhost+'chat/list?email='+data.sender)
					.then(response => {
						
						if(response.data.success){
							io.sockets.to(data.sender).emit('chatListResponse',response.data);
							var message = data.message;

							axios.get(cfg.localhost+'chat/user-info?email='+data.sender)
								.then(response => {
									
									if(response.data.success){
										//console.log(response.data);
										var dt = {
											email: response.data.data.email,
											firstName: response.data.data.firstName,
											lastName: response.data.data.lastName,
											initialName: response.data.data.initialName,
											photoUrl: response.data.data.photoUrl,
											from: data.sender,
											to: data.receiver,
											message: message,
											transactTime: transactTime
										};

										io.sockets.to(data.sender).emit('newChat',dt);
										io.sockets.to(data.receiver).emit('newChat',dt);
									}

								}).catch(error => {
							    	io.sockets.to(data.sender).emit('errors','get chat list failed');
							    });
						}

					}).catch(error => {
				    	io.sockets.to(data.sender).emit('errors','get chat list failed');
				    });

				axios.get(cfg.localhost+'chat/list?email='+data.receiver)
					.then(response => {
						
						if(response.data.success){
							io.sockets.to(data.receiver).emit('chatListResponse',response.data);
							var message = data.message;
						}

					}).catch(error => {
				    	io.sockets.to(data.receiver).emit('errors','get chat list failed');
				    });		

		    }

		  })
		  .catch(function (error) {
		    socket.emit('errors','get chat list failed');
		  });
			
	});

}