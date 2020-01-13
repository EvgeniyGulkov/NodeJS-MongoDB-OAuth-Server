const BasicStrategy = require('passport-http').BasicStrategy;
const ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy;
const BearerStrategy = require('passport-http-bearer').Strategy;
const passport = require('passport');
const ClientModel = require('../libs/mongoose').ClientModel;
const UserModel = require('../libs/mongoose').UserModel;
const AccessTokenModel    = require('../libs/mongoose').AccessTokenModel;
const config = require('../libs/config');

passport.use(new BasicStrategy(
    function (username, password, done) {
        ClientModel.findOne({ clientId: username }, function (err, client) {
            if (err) {
                return done(err);
            }
            if (!client) {
                return done(null, false);
            }
            if (client.clientSecret !== password) {
                return done(null, false);
            }
            return done(null, client);
        });
    }
));

passport.use(new ClientPasswordStrategy(
    function(clientId, clientSecret, done) {
        ClientModel.findOne({ clientId: clientId }, function(err, client) {
            if (err) {
                return done(err);
            }
            if (!client) {
                return done(null, false);
            }
            if (client.clientSecret !== clientSecret) {
                return done(null, false);
            }
            return done(null, client);
        });
    }
));

const checkStrategy = function accessTokenStrategy(accessToken, done) {
    AccessTokenModel.findOne({token: accessToken}, function (err, token) {
        if (err) {
            console.log(err);
            return done(err);
        }
        if (!token) {
            console.log("Token not found");
            return done(null, false);
        }

        const tokenTime = Math.round((Date.now() - token.created) / 1000);
        if (tokenTime > config.get('security:tokenLife')) {
            AccessTokenModel.deleteOne({token: accessToken}, function (err) {
                if (err) {
                    console.log(err);
                    return done(err);
                }
            });
            return done(null, false, {message: 'Token expired'});
        }

        UserModel.findById(token.userId, function (err, user) {
            if (err) {
                return done(err);
            }
            if (!user) {
                return done(null, false, {message: 'Unknown user'});
            }

            var info = {scope: '*'};
            done(null, user, info);
        });
    });
};

passport.use(new BearerStrategy(checkStrategy));

module.exports.checkStrategy = checkStrategy;
