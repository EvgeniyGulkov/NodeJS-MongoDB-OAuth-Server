module.exports = function (app) {

    const ReasonModel = require('../libs/mongoose').ReasonModel;
    const passport = require('passport');
    const routerSaver = require('./route_saver');

    app.get('/api/reasons/', passport.authenticate('bearer', {session: false}),
        function (req, res) {
            return ReasonModel.find({
                companyName: req.user.companyName,
                orderNum: req.body.orderNum
            }, function (err, reason) {
                if (!reason) {
                    res.statusCode = 404;
                    return res.send({error: 'Not found'});
                }
                if (!err) {
                    console.log("Reasons send");
                    return res.send({reason: reason});
                } else {
                    res.statusCode = 500;
                    console.log('Internal error: ' + res.statusCode, err.message);
                    return res.send({error: 'Server error'});
                }
            });
        });

    app.post('/api/reasons/changestatus', passport.authenticate('bearer', {session: false}),
        function (req, res) {
            return ReasonModel.findOne({
                _id: req.body.id,
            }, function (err, reason) {
                if (!reason) {
                    res.send("Not found")
                } else {
                    reason.reasonStatus = req.body.reasonStatus;
                    reason.save(function (err, reason) {
                        if (!reason) {
                            return res.send(err.message)
                        }
                        if (!err) {
                            console.log("Reason status changed");
                            return res.send("reason status changed to " + reason.reasonStatus)
                        } else {
                            return res.send(err.name)
                        }
                    });

                }
            });
        });
};
