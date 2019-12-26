module.exports = function (app) {

    const ReasonModel = require('../libs/mongoose').ReasonModel;
    const passport = require('passport');

    app.get('/api/reasons/:num', passport.authenticate('bearer', {session: false}),
        function (req, res) {
        console.log(req.params.num);
        var orderNum = req.params.num;
            return ReasonModel.find({
                companyName: req.user.companyName,
                orderNum: orderNum
            },{companyName:0, __v:0}, function (err, reason) {
                if (!reason) {
                    console.log(err);
                    res.statusCode = 404;
                    return res.send({error: 'Not found'});
                }
                if (!err) {
                    console.log("Reasons send");
                    res.statusCode = 200;
                    return res.send(JSON.stringify(reason));
                } else {
                    res.statusCode = 500;
                    console.log('Internal error: ' + res.statusCode, err.message);
                    return res.send({error: 'Server error'});
                }
            });
        });

    app.post('/api/reasons/changestatus', passport.authenticate('bearer', {session: false}),
        function (req, res) {
        console.log(req.body.id);
            return ReasonModel.findOne({
                _id: req.body.id
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
                            res.statusCode = 200;
                            return res.send({reason: reason})
                        } else {
                            console.log(err.name);
                            return res.send(err.name)
                        }
                    });

                }
            });
        });
};
