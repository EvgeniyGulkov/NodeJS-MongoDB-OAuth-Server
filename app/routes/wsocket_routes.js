module.exports = function (server) {
    const checkStrategy = require('../authorisation/oauth').checkStrategy;
    const RecommendationModel = require('../libs/mongoose').RecommendationModel;
    const CarOrderModel = require('../libs/mongoose').CarOrderModel;

    const io = require('socket.io')(server);

    io.use(function (socket, next) {
        let token = socket.handshake.headers.authorization;
        checkStrategy(token,function (err, user) {
            if (!user) {
                return next(new Error(err));
            }
                if (!err){
                    socket.user = user;
                    return next()
                }
             else {
                return next(new Error('Server error'))
            }
        });
    });

    io.on('connection', function (socket) {
        socket.leaveAll();
        const user = socket.user;
        const room = String(user.companyName);
        console.log('User ' + user.username + ' connected on websocket');
        socket.join(room);
        console.log('user joined to room - ' + room);

        socket.emit('connection', String('Hello '+ user));

        socket.on('join',function () {
            console.log('user joined')
        });

        socket.on('disconnect', function () {
            console.log('User '+ user.username +' disconnected');
        });


        socket.on('add message', function (data) {
            addMessage(data, socket);
        });

        socket.on('get messages', function(data) {
            const limit = Number(data.limit);
            const offset = Number(data.offset);
            const orderNum = Number(data.orderNum);
            getMessages(socket, limit, offset, orderNum)
        })


    });

    function addMessage (data, socket) {
        const recommendation = new RecommendationModel ({
            companyName: socket.user.companyName,
            orderNum : data.orderNum,
            username : socket.user.username,
            message : data.message
        });
        recommendation.save(function (err, recommendation) {
            if (!recommendation) {
                socket.emit('message response', 404)
            }
            if (!err) {
                CarOrderModel.find({companyName: socket.user.companyName, orderNum: data.orderNum}).exec( function(err,order){
                    const newOrder = order;
                    if(err){
                        console.log(err)
                    } else
                    if(newOrder) {
                        console.log(order);
                        newOrder.updateDate = Date.now();
                        console.log(order);
                    }
                });
                socket.to(socket.user.companyName).emit('get message',
                    {
                        created: recommendation.created,
                        orderNum: recommendation.orderNum,
                        username: recommendation.username,
                        message: recommendation.message
                });
                socket.emit('message response', 200)
            } else {
                socket.emit('message response', 500)
            }
        })
    }

    function getMessages(socket, limit, offset, orderNum) {
        RecommendationModel.find({companyName: socket.user.companyName, orderNum: orderNum},{_id:0, __v:0, companyName:0, orderNum:0}).limit(limit).skip(offset).exec( function (err, recommendation) {
            if (!recommendation) {
                return socket.emit('get messages response', {error: 'Not found'});
            }
            if (!err) {
                recommendation.map(message => {
                    if (message.username === socket.user.username) {
                        message.isMy = true}}
                );
                console.log(recommendation);
                return socket.emit('get messages response', recommendation);
            } else {
                return socket.emit('get messages response', {error: 'Server error'});
            }
        });
    }
};