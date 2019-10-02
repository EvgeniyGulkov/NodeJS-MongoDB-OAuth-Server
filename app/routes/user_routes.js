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
            res.json({user_id: req.user.userId, name: req.user.username, scope: req.authInfo.scope})
        });

    app.post('/admin/addadmin', passport.authenticate('bearer', {session: false}),
        function (req, res) {
            if (req.user.username === config.get('adminname')) {
                const user = new UserModel({
                    username: req.body.username,
                    password: req.body.password,
                    companyName: req.body.companyName
                });
                user.save(function (err, user) {
                    if (err) return console.log(err);
                    else {
                        const admin = new AdminModel({
                            userName: user.userName,
                        });
                        admin.save(function (err, admin) {
                            if (err) return console.log(err);
                            else {
                                const str = "New admin added";
                                res.json({str});
                            }
                        })
                    }
                });
            } else {
                const error = "Access denied";
                res.json({error});
            }
        });

    app.post('/admin/adduser', passport.authenticate('bearer', {session: false}),
        function (req, res) {
            return AdminModel.findOne({userName: req.user.username}, function (err, admin) {
                if (!admin) {
                    return res.send({error: 'Access Denied'});
                }
                if (!admin.err) {
                    return UserModel.findOne({username: req.body.username}, function (err, user) {
                        if (!user) {
                            const user = new UserModel({
                                firstName: req.body.firstName,
                                lastName: req.body.lastName,
                                username: req.body.username,
                                password: req.body.password,
                                companyName: req.user.companyName
                            });
                            user.save();
                            return res.send({status: 'User added'});
                        }
                        if(!err) {
                            return res.send({error: 'User exist'});
                        }
                      else {
                            res.statusCode = 500;
                            return res.send({error: 'Internal error'});
                        }
                    })
                }
                else {
                    res.statusCode = 500;
                    return res.send({error: 'Server error'});
                }
            });
        });
};