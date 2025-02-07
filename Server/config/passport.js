const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const User = require('../models/User');

const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
}

const jwtAuth = new JwtStrategy(jwtOptions, async(jwtPayLoad, done)=>{
    try{
        const user = await User.findUserById(jwtPayLoad.userId);
        return user ? done(null,user) : done(null,false);
    }catch(error){
        return done(error,false);
    }
})

const configurePassport = ()=>{
    passport.use(jwtAuth);
}

module.exports = configurePassport;