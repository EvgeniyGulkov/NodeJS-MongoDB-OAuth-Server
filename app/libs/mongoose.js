 const mongoose = require('mongoose');
 const ObjectId = mongoose.Schema.Types.ObjectId;
 const config = require('./config');
 const crypto = require('crypto');

    mongoose.connect(config.get('mongoose:uri'), {useNewUrlParser: true});

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
     date: {type: Date, required:true, default: Date.now()},
     reason: {type: String, required: true},
     status: {type: String, required: true},
     orderNum: {type: Number, required:true}
 });

    ///////////////// User scheme /////////////////

    const User = new Scheme({
        firstName: {type: String, required: false},
        lastName: {type: String, required: false},
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

/////////////////////////// Other settings /////////////////////

 CarOrder.set('versionKey', false);
 Company.set('versionKey', false);
 User.set('versionKey', false);
 Client.set('versionKey', false);
 AccessToken.set('versionKey', false);
 RefreshToken.set('versionKey', false);
 Admin.set('versionKey', false);

 AccessTokenModel = mongoose.model('AccessToken', AccessToken);
 RefreshTokenModel = mongoose.model('RefreshToken', RefreshToken);
 UserModel = mongoose.model('User',User);
 CarOrderModel = mongoose.model('CarOrder',CarOrder);
 CompanyModel = mongoose.model('Company',Company);
 ClientModel = mongoose.model('Client', Client);
 AdminModel = mongoose.model('Admin', Admin);

 module.exports.CompanyModel = CompanyModel;
    module.exports.CarOrderModel = CarOrderModel;
    module.exports.UserModel = UserModel;
    module.exports.ClientModel = ClientModel;
    module.exports.AccessTokenModel = AccessTokenModel;
    module.exports.RefreshTokenModel = RefreshTokenModel;
    module.exports.AdminModel = AdminModel;
    module.exports.mongoose = mongoose;