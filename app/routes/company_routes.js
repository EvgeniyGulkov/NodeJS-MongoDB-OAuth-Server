module.exports = function (app) {

    const CompanyModel = require('../libs/mongoose').CompanyModel;
    const passport = require('passport');
    const routerSaver = require('./route_saver');

    app.post('/api/companies/', passport.authenticate('bearer', {session: false}),
        function(req, res) {
            if (req.user.username === config.get('adminname')) {
                const company = new CompanyModel({
                    companyName: req.body.companyName,
                });
                company.save(routerSaver(company, res))
            } else {
                res.send({error : "Access Denied"});
            }
    });
};