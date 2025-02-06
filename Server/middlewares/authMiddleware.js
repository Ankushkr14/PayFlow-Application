const passport = require('passport');
const { AuthenticationError } = require('../utils/error');
require('../config/passport');

const authenticateJWT = (req,res,next) =>{
    passport.authenticate('jwt', { session: false}, (err,user)=>{
        if(err) return next(err);
        if(!user) return next(new AuthenticationError('Authentication required.'));
        req.user = user;
        next();
    })(req, res, next);
};


const isAdmin = (req,res,next)=>{
    if(!req.user?.is_admin){
        return next(new AuthenticationError('Only Admin can access.'));
    }
    next();
}

module.exports = {
    authenticateJWT,
    isAdmin
}