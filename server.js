const express = require ('express');
const config = require('./config');
const db = require("./app/libs/mongoose");
const app = express();
const bodyParser = require('body-parser');
const passport = require('passport');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(passport.initialize());

require('./app/routes/order_routes')(app);
require('./app/routes/company_routes')(app);
require('./app/routes/user_routes')(app);
require('./app/routes/recommendation_routes')(app);
require('./app/routes/reason_routes')(app);



app.listen(config,function () {
    console.log("listen on port " + config.port)
});

app.use(function (req, res) {
    res.status(404);
    res.send({error: 'Page not found'});
});

app.use(function (err,req,res) {
    res.status(err.status || 500);
    res.send({error: err.message});
});
