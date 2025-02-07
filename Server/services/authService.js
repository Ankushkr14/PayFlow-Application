const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { findUserByEmail, updatePassword, verifyUserPin, updatePIN } = require('../models/User');
const { AuthorizationError, DatabaseError } = require('../utils/error');


const generateToken = (user)=>{
    return jwt.sign({
        userId: user.userId}, 
        process.env.JWT_SECRET, 
        {
            expiresIn: '1h'
        }
    );
}

const passwordReset = async(email, oldPassword, newPassword)=>{
    try{
        const user = await findUserByEmail(email);

        const isoldPassword = await bcrypt.compare(oldPassword, user.passwordHash);
        if(!isoldPassword){
            throw new AuthorizationError('Incorrect old password.');
        }
        const hashNewPassword = await bcrypt.hash(newPassword,10);
        return await updatePassword(user.userId,hashNewPassword);

    }catch(error){
        throw new DatabaseError('Password reset failed.', error);
    }
}

const pinReset = async(email,password, newPin)=>{
    try{
        const user = await findUserByEmail(email);
        const isPassword = await bcrypt.compare(password,user.passwordHash);
        if(!isPassword){
            throw new AuthorizationError('Incorrect Password');
        }
        const pin = await bcrypt.hash(newPin, 12);
        return await updatePIN(user.userId,pin);
    }catch(error){
        console.log(error);
        throw new DatabaseError('PIN not changed.',error);
    }
}

module.exports = {
    pinReset,
    passwordReset,
    generateToken
}
