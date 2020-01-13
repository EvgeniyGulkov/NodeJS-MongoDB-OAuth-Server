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

    app.post('/api/user/changechatname', passport.authenticate('bearer', {session: false}), function (req, res) {
        UserModel.findOneAndUpdate({username: req.user.username},
            {chatName: req.body.chatname},{new: true},function (err, user) {
                if (!user) {
                    res.statusCode = 404;
                    return res.send('user not found')
                }
                if (!err) {
                    console.log('user '+ req.user.username + ' changed chatname to ' + user.chatName);
                    res.statusCode = 200;
                    return res.send(user.chatName)
                }
                else {
                    res.statusCode = 500;
                    return res.send(err)
                }
            });
    });

    app.post('/api/user/changepassword', passport.authenticate('bearer', {session: false}), function (req, res) {
        UserModel.findOne({username: req.user.username}, function (err, user) {
                if(!user) {
                    res.statusCode = 400;
                    return res.send('User not found')
                }
                if (!err) {
                    if(user.checkPassword(req.body.currentpassword)) {
                        user.password = req.body.newpassword;
                        user.save(function (err) {
                            if (!err) {
                                console.log('user ' + user.username + ' change password');
                                return res.send(200)
                            } else {
                                return res.send (400)
                            }
                        })
                    } else {
                        res.statusCode = 400;
                        return res.send('Entered current password is incorrect');
                    }
                }
            })
    });

    function addUser(req, res) {
        AdminModel.findOne({userName: req.user.username}, function (err, admin) {
            if (admin) {
                const user = new UserModel({
                    chatName: req.body.username,
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