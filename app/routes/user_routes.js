module.exports = function (app) {

    const UserModel = require('../libs/mongoose').UserModel;
    const routerSaver = require('./route_saver');

    app.post('/users/', function(req, res) {
        console.log(req.body);
        const user = new UserModel({
            firstName: req.body.firstName,
            secondName: req.body.secondName,
            userLogin: req.body.userLogin,
            password: req.body.password,
            companyID: req.body.companyID,
            accessLevel: req.body.accessLevel
        });
        user.save(routerSaver(user,res))
    });

    app.get('/users/:companyId', (req, res) => {
        return UserModel.find({companyID: req.params.companyid}, function (err,user) {
            if (!user) {
                res.statusCode = 404;
                return res.send({error: 'Not found'});
            }
            if (!err) {
                console.log("Car request ok");
                return res.send({status: 'OK', car: user});
            } else {
                res.statusCode = 500;
                console.log('Internal error: ' +  res.statusCode, err.message);
                return res.send({error: 'Server error'});
            }
        });
    });
};