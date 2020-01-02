module.exports = function (app) {

    const RecommendationModel = require('../libs/mongoose').RecommendationModel;
    const passport = require('passport');

    app.get('/api/recommendations/', passport.authenticate('bearer', { session: false }),
        function(req, res) {
            var orderNum = req.query.ordernumber;
            return RecommendationModel.find({companyName: req.user.companyName,orderNum: orderNum},{_id:0, __v:0, companyName:0, orderNum:0}, function (err, recommendation) {
                if (!recommendation) {
                    res.statusCode = 404;
                    return res.send({error: 'Not found'});
                }
                if (!err) {
                    res.statusCode = 200;
                    recommendation.map(message => {
                        if (message.username === req.user.username) {
                        message.isMy = true}}
                        );
                    return res.json(recommendation);
                } else {
                    res.statusCode = 500;
                    return res.send({error: 'Server error'});
                }
            });
        });

    app.post('/api/recommendations/add',passport.authenticate('bearer', { session: false }),
        function(req, res) {
                const recommendation = new RecommendationModel ({
                companyName: req.user.companyName,
                orderNum : req.body.orderNum,
                username : req.user.username,
                message : req.body.message
                });
            recommendation.save(function (err, recommendation) {
                if (!recommendation) {
                    res.statusCode = 404;
                    return res.send(err.message)
                }
                if (!err) {
                    res.statusCode = 200;
                    return res.sendStatus(res.statusCode)
                } else {
                    res.statusCode = 500;
                    return res.send(err.name)
                }
            })
            });

};