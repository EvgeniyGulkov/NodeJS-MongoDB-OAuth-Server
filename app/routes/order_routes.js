module.exports = function (app) {

    const CarOrderModel = require('../libs/mongoose').CarOrderModel;
    const ReasonModel = require('../libs/mongoose').ReasonModel;
    const passport = require('passport');

    app.get('/api/carorders/', passport.authenticate('bearer', {session: false}),
        function (req, res) {
            const limit = Number(req.query.limit);
            const offset = Number(req.query.offset);
            const searchText = String(req.query.searchtext);
            return CarOrderModel.find({companyName: req.user.companyName, $or: [
                        { plate: {$regex:searchText.toUpperCase()}},
                        { vinNumber: {$regex: searchText.toUpperCase()}}
                    ]},
                {_id:0, companyName:0, reason: 0, __v:0})
                .skip(offset)
                .limit(limit)
                .exec( function (err, carOrder) {
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
                });
        });

    app.post('/api/carorders/', passport.authenticate('bearer', {session: false}),
        function (req, res) {
            return CarOrderModel.findOne({
                orderNum: req.body.orderNum,
                companyName: req.user.companyName
            }, function (err, carOrder) {
                if (!carOrder) {
                    carOrder = new CarOrderModel;
                    carOrder.createDate = Date.now();
                }
                carOrder.companyName = req.user.companyName;
                carOrder.manufacturer = req.body.manufacturer;
                carOrder.model = req.body.model;
                carOrder.updateDate = Date.now();
                carOrder.plate = String(req.body.plate).toUpperCase();
                carOrder.vinNumber = String(req.body.vinNumber).toUpperCase();
                carOrder.status = req.body.status;
                carOrder.orderNum = req.body.orderNum;
                carOrder.save(function (err, carOrder) {
                    if (!carOrder) {
                        return res.send(err.message)
                    }
                    if (!err) {
                        addReasons(req);
                        console.log("New order added or updated");
                        return res.send({result: "order added"})
                    } else {
                        return res.send(err.name)
                    }
                });
            });
        });

    function addReasons(req) {
        let reasonsString = req.body.reason.replace(', ',',');
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
                            console.log('reason not saved')
                        }
                        if (!err) {
                            console.log("New order added or updated");
                        } else {
                            console.log(err)
                        }
                    });
                }
            })
        })
    }
};
