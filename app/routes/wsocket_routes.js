module.exports = function (server) {
    const checkStrategy = require('../authorisation/oauth').checkStrategy;
    const RecommendationModel = require('../libs/mongoose').RecommendationModel;

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
                socket.to(socket.user.companyName).emit('get message', recommendation);
                socket.emit('message response', 200)
            } else {
                socket.emit('message response', 500)
            }
        })
    }
};