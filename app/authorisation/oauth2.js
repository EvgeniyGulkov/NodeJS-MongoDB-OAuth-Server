const oauth2orize         = require('oauth2orize');
const passport            = require('passport');
const crypto              = require('crypto');
const config              = require('../libs/config');
const User           = require('../libs/mongoose').UserModel;
const AccessToken    = require('../libs/mongoose').AccessTokenModel;
const RefreshToken   = require('../libs/mongoose').RefreshTokenModel;

var aserver = oauth2orize.createServer();

// Generic error handler
var errFn = function (cb, err) {
    if (err) {
        return cb(err);
    }
};

// Destroy any old tokens and generates a new access and refresh token
var generateTokens = function (data, done) {

    // Curries in `done` callback so we don't need to pass it
    var errorHandler = errFn.bind(undefined, done),
        refreshToken,
        refreshTokenValue,
        token,
        tokenValue;

    RefreshToken.remove(data, errorHandler);
    AccessToken.remove(data, errorHandler);

    tokenValue = crypto.randomBytes(32).toString('hex');
    refreshTokenValue = crypto.randomBytes(32).toString('hex');

    data.token = tokenValue;
    token = new AccessToken(data);

    data.token = refreshTokenValue;
    refreshToken = new RefreshToken(data);

    refreshToken.save(errorHandler);

    token.save(function (err) {
        if (err) {
            return done(err);
        }
        done(null, tokenValue, refreshTokenValue, {
            'expires_in': config.get('security:tokenLife')
        });
    });
};

// Exchange username & password for access token
aserver.exchange(oauth2orize.exchange.password(function (client, username, password, scope, done) {

    User.findOne({ username: username }, function (err, user) {
        if (err) {
            console.log(err);
            return done(err);
        }

        if (!user || !user.checkPassword(password)) {
            console.log("User or password incorrect");
            return done(null, false);
        }
        console.log("exchange user and password for userId" + user.userId);
        var model = {
            userId: user.userId,
            clientId: client.clientId
        };

        generateTokens(model, done);
    });

}));

// Exchange refreshToken for access token
aserver.exchange(oauth2orize.exchange.refreshToken(function (client, refreshToken, scope, done) {

    RefreshToken.findOne({ token: refreshToken, clientId: client.clientId }, function (err, token) {
        if (err) {
            console.log(err);
            return done(err);
        }

        if (!token) {
            console.log("No token");
            return done(null, false);
        }

        User.findById(token.userId, function (err, user) {
            if (err) {
                console.log(err);
                return done(err);
            }
            if (!user) {
                console.log("user not found");
                return done(null, false);
            }
            console.log("Exchange  refreshtoken for userId " + user.userId);
            var model = {
                userId: user.userId,
                clientId: client.clientId
            };

            generateTokens(model, done);
        });
    });
}));

// token endpoint
//
// `token` middleware handles client requests to exchange authorization grants
// for access tokens. Based on the grant type being exchanged, the above
// exchange middleware will be invoked to handle the request. Clients must
// authenticate when making requests to this endpoint.
//'oauth2-client-password'
exports.token = [
    passport.authenticate(['basic', 'oauth2-client-password'], { session: false}),
    aserver.token(),
    aserver.errorHandler()
];