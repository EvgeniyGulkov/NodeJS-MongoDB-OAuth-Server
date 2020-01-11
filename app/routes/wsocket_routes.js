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
        const user = socket.user.username;
        console.log('User ' + user + ' connected on websocket');

        socket.emit('connection', String('Hello '+ user));

        socket.on('disconnect', function () {
            console.log('User '+ user +' disconnected');
        });
        socket.on('add message', function (data) {
            console.log(user + ': '+ data.orderNum + ', ' + data.message);
            addMessage(data, socket)
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
                console.log('New message added');
                socket.emit('message response', 200)
            } else {
                socket.emit('message response', 500)
            }
        })
    }
};