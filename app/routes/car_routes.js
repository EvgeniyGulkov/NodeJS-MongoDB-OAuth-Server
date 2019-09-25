module.exports = function (app,db) {

    const CarModel = require('../libs/mongoose').CarModel;
    const CompanyModel = require('../libs/mongoose').CompanyModel;

    //////////carOrder routes////////////////////
    app.post('/carorders/', function(req, res) {
        console.log(req.body);
        const car = new CarModel({
            companyID: req.body.companyID,
            manufacturer: req.body.manufacturer,
            model: req.body.model,
            plate: req.body.plate,
            date: req.body.date,
            reason: req.body.reason,
            status: req.body.status
        });
        car.save(checkPost(car.err, res, car));
    });

    app.get('/carorders/:companyid', (req, res) => {
        return CarModel.find({companyID: req.params.companyid}, function (err, car) {
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

    ////company routes/////////////////
    app.post('/companies/', function(req, res) {
        console.log(req.body);
        const company = new CompanyModel({
            companyName: req.body.companyName,
        });
        company.save(checkPost(company.err,res,company));
    });

    const checkPost = function (err,res,model) {
        if (!err) {
            console.log("car created");
            return res.send({ status: 'OK', model:model });
        } else {
            console.log(err);
            if(err.name === 'ValidationError') {
                res.statusCode = 400;
                res.send({ error: 'Validation error' });
            } else {
                res.statusCode = 500;
                res.send({ error: 'Server error' });
            }
            console.log('Internal error ' + err.message);
        }
    }
};