const mongoose = require('mongoose');
const config = require('./config');
const crypto = require('crypto');

mongoose.connect(config.get('mongoose:uri'), {useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false});

const db = mongoose.connection;
db.on('error', function (err) {
    console.log(err.message)
});
db.once('open', function () {
    console.log("Connected to DB!")
});

const Scheme = mongoose.Schema;

////////////////// Company scheme ////////////

const Company = new Scheme({
    companyName: {type: String, required: true,unique: true}
});

//////////////// carOrder scheme /////////////////////////////////

const CarOrder = new Scheme({
    companyName: {type: String,required: true},
    manufacturer: {type: String, required: true},
    model: {type: String, required: true},
    plate: {type: String, required: true},
    createDate: {type: Date, required:true},
    updateDate: {type: Date, required: true},
    vinNumber: {type: String, required: true},
    status: {type: String, required: true},
    orderNum: {type: Number, required:true}
});

///////////////// User scheme /////////////////

const User = new Scheme({
    chatName: {type: String, required: false},
    username: { type: String, require: true,unique: true},
    hashedPassword: {type: String, required: true, },
    salt: {type:String, required: true},
    companyName: {type: String, required: true},
    created:{type: Date, default: Date.now()}
});

User.path('hashedPassword').validate(function (pass) {
    return pass.length > 6;
});

User.methods.encryptPassword = function (password){
    return crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
};

User.virtual('userId').get(function () {
    return this.id
});

User.virtual('password').set(function (password) {
    if(password) {
        this._plainPassword = password;
        this.salt = crypto.randomBytes(128).toString('hex');
        this.hashedPassword = this.encryptPassword(password);
    } else {
        this.hashedPassword = null;
    }
})
    .get(function () {
        return this._plainPassword;
    });
User.methods.checkPassword = function(password) {
    return this.encryptPassword(password) === this.hashedPassword;
};

////////////////////////// Client scheme ////////////////////////
const Client = Scheme({
    name: {type: String, unique: true, required: true},
    clientId: {type: String, unique: true, required: true},
    clientSecret: {type: String, required: true}
});

///////////////////////// Admin scheme //////////////////////////////

const Admin = Scheme({
    userName: {type: String, required: true,unique: true}
});

///////////////////////// Access token scheme ////////////////////
const AccessToken = Scheme({
    userId: {type: String, required: true},
    clientId: {type:String, required: true},
    token: {type:String, unique: true, required: true},
    created: {type:Date, default:Date.now()}
});

/////////////////////////// Refresh token scheme /////////////////////
const RefreshToken = Scheme({
    userId: {type: String, required: true},
    clientId: {type:String, required: true},
    token: {type:String, unique: true, required: true},
    created: {type:Date, default:Date.now()}
});

const Recommendation = Scheme({
    orderNum: {type: Number, required: true},
    username: {type: String, required: true},
    companyName: {type:String, required: true},
    isMy: {type: Boolean, required: true, default: false},
    message: {type:String, required: true},
    created: {type:Date, default:Date.now()}
});

const Reason = Scheme({
    orderNum: {type: Number, required: true},
    companyName: {type:String, required: true},
    reasonStatus: {type:Boolean, required: true},
    reasonText: {type:String, required: true},
});

/////////////////////////// Exports /////////////////////
module.exports.ReasonModel = mongoose.model('Reason',Reason);
module.exports.CompanyModel = mongoose.model('Company',Company);
module.exports.CarOrderModel = mongoose.model('CarOrder',CarOrder);
module.exports.UserModel =  mongoose.model('User',User);
module.exports.ClientModel = mongoose.model('Client', Client);
module.exports.AccessTokenModel = mongoose.model('AccessToken', AccessToken);
module.exports.RefreshTokenModel = mongoose.model('RefreshToken', RefreshToken);
module.exports.AdminModel = mongoose.model('Admin', Admin);
module.exports.RecommendationModel = mongoose.model('Recommendation', Recommendation);
module.exports.mongoose = mongoose;
