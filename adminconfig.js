    const mongoose = require('./app/libs/mongoose').mongoose;
    const CompanyModel = require('./app/libs/mongoose').CompanyModel;
    const AdminModel = require('./app/libs/mongoose').AdminModel;
    const UserModel = require('./app/libs/mongoose').UserModel;
    const ClientModel = require('./app/libs/mongoose').ClientModel;
    const config = require('./app/libs/config');

    addCompany();
    addUser();
    addAdmin();
    addClient();

    function addCompany() {
        const company = new CompanyModel({
            companyName: config.get('default:company:companyName')
        });
        company.save(function (err, company) {
            if (!err) {
                console.log("Company " + company.companyName + " created");
            } else {
                if (err.name === 'ValidationError') {
                    console.log("company validation " + err.message)
                } else {
                    console.log("internal error")
                }
            }
        });
    }

    function addUser() {
       const user = new UserModel({
            username: config.get('default:user:username'),
            password: config.get('default:user:password'),
            companyName: config.get('default:company:companyName'),
        });
        user.save(function (err, user) {
            if (!err) {
                console.log("New user -" + user.username + " created!")
            } else {
                if (err.name === 'ValidationError') {
                    console.log("client validation " + err.message)
                } else {
                    console.log("internal error")
                }
            }
        });
    }

    function addClient() {
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
    }

        function addAdmin() {
            const admin = new AdminModel({
                userName: config.get('default:user:username'),
            });
            admin.save(function (err, admin) {
                if (!err) {
                    console.log("New admin -" + admin.userName + " created!")
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
