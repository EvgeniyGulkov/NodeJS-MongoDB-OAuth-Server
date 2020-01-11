const express = require ('express');
const config = require('./config');
const app = express();
const bodyParser = require('body-parser');
const passport = require('passport');
const server = require('http').createServer(app);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(passport.initialize());

require('./app/routes/order_routes')(app);
require('./app/routes/company_routes')(app);
require('./app/routes/user_routes')(app);
require('./app/routes/recommendation_routes')(app);
require('./app/routes/reason_routes')(app);
require('./app/routes/wsocket_routes')(server);

app.use(function (req, res) {
    res.status(404);
    res.send({error: 'Page not found'});
});

app.use(function (err,req,res) {
    res.status(err.status || 500);
    res.send({error: err.message});
});



server.listen(config,function () {
    console.log("listen on port " + config.port)
});