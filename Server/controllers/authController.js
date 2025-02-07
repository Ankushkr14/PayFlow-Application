const bcrypt = require('bcrypt');
const { createUser, findUserByEmail } = require('../models/User');
const { ValidationError, AuthenticationError } = require('../utils/error');
const { generateToken } = require('../services/authService');

const register = async(req,res,next)=>{
    try{
        const {name, email, password, pin} = req.body;

        const existingUser = await findUserByEmail(email);
        if(existingUser){
            throw new ValidationError('Email already registered.');
        }

        const user = await createUser({name, email, password, pin});
        const token = generateToken(user);

        res.status(200).json({
            success: true,
            message: "User registered successfully.",
            data: {
                token,
                userId: user.user_id,
                name: user.name
            }
        });
    }catch(error){
        next(error);
    }
};

const login = async(req, res, next)=>{
    try{
        const { email, password } = req.body;
        const user = await findUserByEmail(email);
        if(!user) throw new AuthenticationError('Incorrect email address.');
        const isValid = await bcrypt.compare(password, user.passwordHash);
        if(!isValid){
            throw new AuthenticationError('Password Incorrect.');
        }
        const token = generateToken(user);

        res.status(200).json({
            success: true,
            message: "Login successfully.",
            data: {
                token,
                userId: user.user_id,
            }
        });
    }catch(error){
        next(error);
    }
}

module.exports = {
    register,
    login
}
