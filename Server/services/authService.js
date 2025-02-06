const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { findUserByEmail, updatePassword, verifyUserPin, updatePIN } = require('../models/User');
const { AuthorizationError, DatabaseError } = require('../utils/error');


const generateToken = (user)=>{
    return jwt.sign({
        userId: user.user_id}, 
        process.env.JWT_SECRET, 
        {
            expiresIn: '1h'
        }
    );
}

const passwordReset = async(email, oldPassword, newPassword)=>{
    try{
        const user = await findUserByEmail(email);

        const isoldPassword = await bcrypt.compare(oldPassword, user.password);
        if(!isoldPassword){
            throw new AuthorizationError('Incorrect old password.');
        }
        const hashNewPassword = await bcrypt.hash(newPassword,10);
        return await updatePassword(user.user_id,hashNewPassword);

    }catch(error){
        throw new DatabaseError('Password reset failed.', error);
    }
}

const pinReset = async(email,password, pin)=>{
    try{
        const user = await findUserByEmail(email);
        const isPassword = await bcrypt.compare(password,user.password);
        if(!isPassword){
            throw new AuthorizationError('Incorrect Password');
        }
        if(!(await verifyUserPin(user.user_id,pin))){
            throw new AuthorizationError('Incorrect PIN.')
        }
        const newPin = await bcrypt.hash(pin, 12);
        return await updatePIN(user.user_id,newPin);
    }catch(error){
        throw new DatabaseError('PIN not changed.',error);
    }
}

module.exports = {
    pinReset,
    passwordReset,
    generateToken
}
