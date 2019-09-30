module.exports = function (model,res) {
    const err= model.err;
        if (!err) {
            console.log("Object added or updated");
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
            console.log('Internal error '+ res.statusCode + ", " + err.message);
        }
};