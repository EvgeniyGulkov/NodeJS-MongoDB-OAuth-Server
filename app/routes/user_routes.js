module.exports = function (app) {

    const oauth2 = require('../authorisation/oauth2');
    const passport = require('passport');
    const AdminModel = require('../libs/mongoose').AdminModel;
    const UserModel = require('../libs/mongoose').UserModel;
    const config = require('../libs/config');

    require('../authorisation/oauth');


    app.post('/oauth/token', oauth2.token);

    app.get('/api/userinfo', passport.authenticate('bearer', {session: false}),
        function (req, res) {
            res.json({name: req.user.username})
        });

    app.post('/admin/addadmin', passport.authenticate('bearer', {session: false}),
        function (req, res) {
            addAdmin(req, res)
        });
    app.post('/admin/adduser', passport.authenticate('bearer', {session: false}), function (req, res) {
        addUser(req, res)
    });

    function addUser(req, res) {
        AdminModel.findOne({userName: req.user.username}, function (err, admin) {
            if (admin) {
                const user = new UserModel({
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    username: req.body.username,
                    password: req.body.password,
                    companyName: req.user.companyName
                });
                user.save(function (err, user) {
                    if (!user) {
                        res.statusCode = 404;
                        return res.send(err.message)
                    }
                    if (!err) {
                        console.log("new user " + user.username);
                        res.statusCode = 500;
                        return res.send("user created");
                    } else {
                        console.log(err.name);
                        return res.send(err.name)
                    }
                });
            } else {
                res.send({error: "Access denied"});
            }
        });
    }

    function addAdmin(req, res) {
        if (req.user.username === config.get('default:user:username')) {
            UserModel.findOne({username: req.body.username}, function (err, user) {
                if (user) {
                    console.log("Set " + user.username + " as admin");
                    const admin = new AdminModel({
                        userName: user.username
                    });
                    admin.save(function (err, admin) {
                        if (!admin) {
                            return res.send(err.message)
                        }
                        if (!err) {
                            return res.send("new admin " + admin.userName)
                        } else {
                            return res.send(err.name)
                        }
                    })
                } else {
                    res.send("User not found")
                }
            });
        } else {
            res.send({error: "Access denied"});
        }
    }
};