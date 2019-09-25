 const mongoose = require('mongoose');
 const ObjectId = mongoose.Schema.Types.ObjectId;

    mongoose.connect('mongodb://localhost:27017/carorders', {useNewUrlParser: true});

    const db = mongoose.connection;
    db.on('error', function (err) {
        console.log(err.message)
    });
    db.once('open', function () {
        console.log("Connected to DB!")
    });

    const Scheme = mongoose.Schema;

    const Company = new Scheme({
        companyName: {type: String, required: true}
    });

    const Car = new Scheme({
            companyID: {type: ObjectId,required: true},
            manufacturer: {type: String, required: true},
            model: {type: String, required: true},
            plate: {type: String, required: true},
            date: {type: Date, default: Date.now()},
            reason: {type: String, required: true},
            status: {type: String, required: true}
    });

 Car.set('versionKey', false);
 Company.set('versionKey', false);

    module.exports.CompanyModel = mongoose.model('Company',Company);
    module.exports.CarModel = mongoose.model('Car', Car);