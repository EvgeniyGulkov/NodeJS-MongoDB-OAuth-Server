module.exports = function (app) {

    const RecommendationModel = require('../libs/mongoose').RecommendationModel;
    const passport = require('passport');

    app.get('/api/recommendation/', passport.authenticate('bearer', { session: false }),
        function(req, res) {
            return RecommendationModel.find({companyName: req.user.companyName,orderNum: req.body.orderNum}, function (err, recommendation) {
                if (!recommendation) {
                    res.statusCode = 404;
                    return res.send({error: 'Not found'});
                }
                if (!err) {
                    console.log("Recommendation send");
                    return res.send({recommendation: recommendation});
                } else {
                    res.statusCode = 500;
                    console.log('Internal error: ' +  res.statusCode, err.message);
                    return res.send({error: 'Server error'});
                }
            });
        });

    app.post('/api/recommendation/add',passport.authenticate('bearer', { session: false }),
        function(req, res) {
                const recommendation = new RecommendationModel ({
                companyName: req.user.companyName,
                created : new Date(),
                orderNum : req.body.orderNum,
                username : req.user.usernamenpm
                });
            recommendation.save(function (err, recommendation) {
                if (!recommendation) {
                    return res.send(err.message)
                }
                if (!err) {
                    return res.send({recommendation: recommendation})
                } else {
                    return res.send(err.name)
                }
            })
            });
};