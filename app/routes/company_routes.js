module.exports = function (app) {

    const CompanyModel = require('../libs/mongoose').CompanyModel;
    const passport = require('passport');
    const config = require('../libs/config');

    app.post('/api/companies/', passport.authenticate('bearer', {session: false},function (){}),
        function(req, res) {
            if (req.user.username === config.get('adminname')) {
                const company = new CompanyModel({
                    companyName: req.body.companyName,
                });
                company.save(function (err, company) {
                    if (!company) {
                        return res.send(err.message)
                    }
                    if (!err) {
                        console.log("New reason added or updated");
                        return res.send("new company added ")
                    } else {
                        return res.send(err.name)
                    }
                });
            } else {
                res.send({error : "Access Denied"});
            }
    });
};