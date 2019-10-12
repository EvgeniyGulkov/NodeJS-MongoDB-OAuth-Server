module.exports = function (app) {

    const CarOrderModel = require('../libs/mongoose').CarOrderModel;
    const ReasonModel = require('../libs/mongoose').ReasonModel;
    const passport = require('passport');

    app.get('/api/carorders/', passport.authenticate('bearer', {session: false}),
        function (req, res) {
            return CarOrderModel.find({companyName: req.user.companyName}, function (err, carOrder) {
                if (!carOrder) {
                    res.statusCode = 404;
                    return res.send({error: 'Not found'});
                }
                if (!err) {
                    console.log("Order request ok");
                    return res.send({carorder: carOrder});
                } else {
                    res.statusCode = 500;
                    console.log('Internal error: ' + res.statusCode, err.message);
                    return res.send({error: 'Server error'});
                }
            });
        });

    app.post('/api/carOrders/', passport.authenticate('bearer', {session: false}),
        function (req, res) {
            return CarOrderModel.findOne({
                orderNum: req.body.orderNum,
                companyName: req.user.companyName
            }, function (err, carOrder) {
                if (!carOrder) {
                    carOrder = new CarOrderModel;
                }
                carOrder.companyName = req.user.companyName;
                carOrder.manufacturer = req.body.manufacturer;
                carOrder.model = req.body.model;
                carOrder.plate = req.body.plate;
                carOrder.date = new Date;
                carOrder.vinNumber = req.body.vinNumber;
                carOrder.status = req.body.status;
                carOrder.orderNum = req.body.orderNum;
                carOrder.save(function (err, carOrder) {
                    if (!carOrder) {
                        return res.send(err.message)
                    }
                    if (!err) {
                        console.log("New order added or updated");
                    } else {
                        return res.send(err.name)
                    }
                });
                addReasons(req, res)
            });
        });

    function addReasons(req, res) {
        let reasonRow = (req.body.reason).split(",");

        reasonRow.forEach(function (entry) {
            return ReasonModel.findOne({
                orderNum: req.body.orderNum,
                companyName: req.user.companyName,
                reasonText: entry
            }, function (err, reason) {
                if (!reason) {
                    reason = new ReasonModel;
                    reason.orderNum = req.body.orderNum;
                    reason.reasonStatus = "notComplete";
                    reason.companyName = req.user.companyName;
                    reason.reasonText = entry;
                    reason.save(function (err, reason) {
                        if (!reason) {
                            return res.send(err.message)
                        }
                        if (!err) {
                            console.log("New order added or updated");
                            return res.send("new reason " + entry)
                        } else {
                            return res.send(err.name)
                        }
                    });
                }
            })
        })
    }
};