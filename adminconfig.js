    const mongoose = require('./app/libs/mongoose').mongoose;
    const CompanyModel = require('./app/libs/mongoose').CompanyModel;
    const AdminModel = require('./app/libs/mongoose').AdminModel;
    const UserModel = require('./app/libs/mongoose').UserModel;
    const ClientModel = require('./app/libs/mongoose').ClientModel;
    const config = require('./app/libs/config');

    const company = new CompanyModel({
        _id: config.get('default:company:id'),
        companyName: config.get('default:company:companyName') });

    company.save(function (err, company) {
        if (!err) {
        } else {
            if (err.name === 'ValidationError') {
                console.log("company validation " + err.message)
            } else {
                console.log("internal error")
            }
        }
    });

        user = new UserModel({
            username: config.get('default:user:username'),
            password: config.get('default:user:password'),
            companyID: config.get('default:company:id')
        });
        user.save(function async (err, client) {
            if (!err) {
                return addAdmin(user._id)
            } else {
                if (err.name === 'ValidationError') {
                    console.log("client validation " + err.message)
                } else {
                    console.log("internal error")
                }
            }
        });

        const client = new ClientModel({
            name: config.get('default:client:name'),
            clientId: config.get('default:client:clientId'),
            clientSecret: config.get('default:client:clientSecret')
        });

            client.save(function (err, client) {

                if (!err) {
                    console.log('New client - ' + client.name + ',' + client.clientSecret);
                } else {
                    if (err.name === 'ValidationError') {
                        console.log("client validation " + err.message)
                    } else {
                        console.log("internal error")
                    }
                }
        });

            function addAdmin(id) {
                console.log(id);
                const admin = new AdminModel({
                    userId: id
                });

                admin.save(function (err, admin) {
                    if (!err) {
                        console.log('New admin ' + user._id);
                    } else {
                        if (err.name === 'ValidationError') {
                            console.log("client validation " + err.message)
                        } else {
                            console.log("error " + err.message)
                        }
                    }
                });
            }

    setTimeout(function() {
        mongoose.disconnect();
    }, 3000);
