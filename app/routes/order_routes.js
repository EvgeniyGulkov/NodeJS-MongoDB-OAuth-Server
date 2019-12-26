module.exports = function (app) {

    const CarOrderModel = require('../libs/mongoose').CarOrderModel;
    const ReasonModel = require('../libs/mongoose').ReasonModel;
    const passport = require('passport');
    require('querystring');

    app.get('/api/carorders/:limit/:offset', passport.authenticate('bearer', {session: false}),
        function (req, res) {
            return CarOrderModel.find({companyName: req.user.companyName},{_id:0, companyName:0, reason: 0, __v:0}, function (err, carOrder) {
                if (!carOrder) {
                    res.statusCode = 404;
                    return res.send({error: 'Not found'});
                }
                if (!err) {
                    console.log("Order request ok");
                    return res.json(carOrder);
                } else {
                    res.statusCode = 500;
                    console.log('Internal error: ' + res.statusCode, err.message);
                    return res.send({error: 'Server error'});
                }
            }).limit(Number(req.params.limit)).skip(Number(req.params.offset));
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
                        return res.send({result: "order added"})
                    } else {
                        return res.send(err.name)
                    }
                });
                addReasons(req, res)
            });
        });

    function addReasons(req, res) {
        let reasonsString = req.body.reason.replace(", ",',');
        reasonsString = reasonsString.toLowerCase();
        let reasonRow = reasonsString.split(",");

        reasonRow.forEach(function (entry) {
            entry = entry.charAt(0).toUpperCase() + entry.substr(1).toLowerCase();
            return ReasonModel.findOne({
                orderNum: req.body.orderNum,
                companyName: req.user.companyName,
                reasonText: entry
            }, function (err, reason) {
                if (!reason) {
                    reason = new ReasonModel;
                    reason.orderNum = req.body.orderNum;
                    reason.reasonStatus = false;
                    reason.companyName = req.user.companyName;
                    reason.reasonText = entry;
                    reason.save(function (err, reason) {
                        if (!reason) {
                            return res.send(err.message)
                        }
                        if (!err) {
                            console.log("New order added or updated");
                            //return res.send("new reason added")
                        } else {
                            return res.send(err.name)
                        }
                    });
                }
            })
        })
    }
};