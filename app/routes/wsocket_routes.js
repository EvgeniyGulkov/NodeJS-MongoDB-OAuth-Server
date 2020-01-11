module.exports = function (server) {
    const checkStrategy = require('../authorisation/oauth').checkStrategy;

    const io = require('socket.io')(server, {
        extraHeaders: {
            Authorization: "Bearer authorization_token_here"
        }
    });

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
        console.log('user connected = ', socket.user.username);
//    console.log("session at socket.io connection:\n", socket.request.session);

        socket.on('disconnect', function () {
            console.log('user disconnected');
        });
        socket.on("message", function (data) {
            console.log(data.message);
        });
    });
};