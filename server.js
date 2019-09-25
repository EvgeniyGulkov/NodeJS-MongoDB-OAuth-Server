const express = require ('express');
const config = require('./config');
const db = require("./app/libs/mongoose");
const app = express();
const bodyParser = require('body-parser');
require('./app/routes/car_routes')(app,db);

app.use(bodyParser.urlencoded({ extended: true }));

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