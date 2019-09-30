module.exports = function (app) {

    const oauth2 = require('../authorisation/oauth2');
    const passport = require('passport');
    var UserModel = require('../libs/mongoose').UserModel;
    var ClientModel = require('../libs/mongoose').ClientModel;
    require('../authorisation/oauth');

    app.post('/oauth/token', oauth2.token);

    app.get('/api/userinfo', passport.authenticate('bearer', { session: false }),
        function(req, res) {
            res.json({ user_id: req.user.userId, name: req.user.username, scope: req.authInfo.scope })
        });

    app.post('/createclient/', function(req, res) {
        const client = new ClientModel({ username: "OurService iOS client v1", clientId: "mobileV1", clientSecret:"abc123456" });
        client.save(function(err, client) {
            if(err) return console.log(err);
            else console.log("New client - " + client.clientId + "," + client.clientSecret);
        });
    });

    app.post('/createuser/', function(req, res) {
        var user = new UserModel({username: "andrey", password: "simplepassword", companyID: "5d8c57585ed5df1cc49add65" });
        user.save(function (err, user) {
            if (err) return console.log(err);
            else console.log("New user - " + user.username + ", " + user.password);
        });
    });
};