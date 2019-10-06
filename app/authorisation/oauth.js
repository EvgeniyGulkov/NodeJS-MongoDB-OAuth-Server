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
        console.log(username + password);
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
        console.log(clientId);
        console.log(clientSecret);
        ClientModel.findOne({ clientId: clientId }, function(err, client) {
            if (err) {
                console.log(err);
                return done(err);
            }
            if (!client) {
                console.log("ClientPassword strategy. User not found!");
                return done(null, false);
            }
            if (client.clientSecret !== clientSecret) {
                console.log("Secret incorrect");
                return done(null, false);
            }
            console.log("ClientID " + client.clientId);
            return done(null, client);
        });
    }
));

passport.use(new BearerStrategy(
    function(accessToken, done) {
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
            console.log(tokenTime);
            if (tokenTime > config.get('security:tokenLife')) {
                AccessTokenModel.remove({token: accessToken}, function (err) {
                    if (err) {
                        console.log(err);
                        return done(err);
                    }
                });
                console.log('Token expired');
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
    }));
