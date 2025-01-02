const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:5000/auth/google/callback",
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await prisma.user.findUnique({ where: { email: profile.emails[0].value } });
        if (!user) {
            user = await prisma.user.create({
                data: {
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    image: profile.photos[0].value,
                    password: "google-oauth-user",
                },
            });
        }
        done(null, user);
    } catch (err) {
        done(err, null);
    }
}));
