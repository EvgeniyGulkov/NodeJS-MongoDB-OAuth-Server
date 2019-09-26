module.exports = function (app) {

    const CompanyModel = require('../libs/mongoose').CompanyModel;
    const routerSaver = require('./route_saver');

    app.post('/companies/', function(req, res) {
        console.log(req.body);
        const company = new CompanyModel({
            companyName: req.body.companyName,
        });
       company.save(routerSaver(company,res))
    });
};