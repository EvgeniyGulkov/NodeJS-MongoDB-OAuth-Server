module.exports = function (app) {

    const CarModel = require('../libs/mongoose').CarModel;
    const routerSaver = require('./route_saver');

    app.post('/carOrders/', function(req, res) {
        console.log(req.body);
        const car = new CarModel({
            companyID: req.body.companyID,
            manufacturer: req.body.manufacturer,
            model: req.body.model,
            plate: req.body.plate,
            date: req.body.date,
            reason: req.body.reason,
            status: req.body.status,
            orderNum: req.body.orderNum
        });
        car.save(routerSaver(car,res))
    });

    app.get('/carOrders/:companyId', (req, res) => {
        return CarModel.find({companyID: req.params.companyId}, function (err, car) {
            if (!car) {
                res.statusCode = 404;
                return res.send({error: 'Not found'});
            }
            if (!err) {
                console.log("Car request ok");
                return res.send({status: 'OK', car: car});
            } else {
                res.statusCode = 500;
                console.log('Internal error: ' +  res.statusCode, err.message);
                return res.send({error: 'Server error'});
            }
        });
    });

    app.put('/carOrders/', function(req, res) {
        return CarModel.findOne({
            orderNum: req.body.orderNum,
            companyID: req.body.companyID
        }, function (err, car) {
            if (!car) {
                res.statusCode = 404;
                return res.send({error: 'Not found'});
            }
            car.companyID = req.body.companyID;
            car.manufacturer = req.body.manufacturer;
            car.model = req.body.model;
            car.plate = req.body.plate;
            car.date = req.body.date;
            car.reason = req.body.reason;
            car.status = req.body.status;
            car.orderNum = req.body.orderNum;
            car.save(routerSaver(car,res))
        });
    });
};