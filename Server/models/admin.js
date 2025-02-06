const db = require('../config/database');
const { ValidationError, DatabaseError } = require('../utils/error');
const { findUserById } = require('./User');

const getAllUsers = async(page=1 , limit=10)=>{
    try{
        const offset = (page-1)*limit;
        const [users] = await db.execute(
            `SELECT user_id AS id,
            name, email, balance, is_admin AS isAdmin, created_at AS createdAt FROM user
            LIMIT ? OFFSET ?`, [limit,offset]
        );
        if(!users){
            throw new ValidationError('No user detail.');
        }
        const [[{total}]] = await db.execute('SELECT COUNT(*) AS TOTAL FROM user');
        return {
            users,
            pagination: {
                page,
                limit,
                total,
                totalPage: Math.ceil(total/limit)
            }
        };
    }catch(error){
        logger.error('Failed to fetch users.');
        throw new DatabaseError('Failed to fetch user details.',error);
    };
};

const getUserDetails = async (userId)=>{
    try{
        const [user] = await db.execute(
            `SELECT
            user_id AS id,
            name, email, balance, is_admin AS isAdmin, created_at AS createdAt FROM user
            WHERE user_id = ?`, [userId]
        );

        if(!user)
            return false;

        const [transaction] = await db.execute(
            `SELECT 
                t.id AS transactionId,
                t.sender_id AS senderId,
                t.receiver_id AS receiverId,
                t.amount,
                t.status,
                t.timestamp,
                s.name AS senderName,
                r.name AS receiverName
             FROM transactions t
             JOIN user s ON t.sender_id = s.user_id
             JOIN user r ON t.receiver_id = r.user_id
             WHERE t.sender_id = ? OR t.receiver_id = ?
             ORDER BY t.timestamp DESC`, [userId,userId]
        );

        const [contacts] = await db.execute(
            `SELECT 
                u.user_id AS contactId,
                u.name,
                u.email
             FROM contacts c
             JOIN user u ON c.contact_id = u.user_id
             WHERE c.user_id = ?`,
             [userId]
        );
        return {user, transaction,contacts};
    }catch(error){
        logger.error("Failed to fetch user details." ,{userId, error});
        throw new DatabaseError('Failed to fetch user details',error);
    }
};

const updateUserStatus = async(userId, status)=>{
    try{
        const validStatus = ['active', 'frozen'];
        if(!validStatus.includes(status)){
            throw new ValidationError('Invalid Status');
        }
        const user = await findUserById(userId);
        if(user.status === status){
            return false;
        }

        const [result] = await db.execute(
            `UPDATE user SET status = ? WHERE user_id = ?`, [status,userId]
        );
        if(result.affectedRows===0){
            return false;
        }
        return true;
    }catch(error){
        logger.error('Failed to update the status.', error);
        throw new DatabaseError('Failed to update the status', {userId,error});
    }
};

const systemStatus = async ()=>{
    try{
        const [[totalUser]] = await db.execute('SELECT COUNT(*) AS totalUsers FROM user');
        const [[totalTransactions]] = await db.execute('SELECT COUNT(*) AS totalTransactions FROM transactions');
        const [[totalBalance]] = await db.execute('SELECT SUM(balance) AS totalBalance FROM user');

        return {
            totalUser: totalUser.totalUser,
            totalBalance: totalBalance.totalBalance,
            totalTransactions: totalTransactions.totalTransactions,
        };
    }catch(error){
        logger.error('Failed to fetch system status.', error);
        throw new DatabaseError('Failed to fetch system status',error);
    }
};

const removeUser = async(userId)=>{
    try{
        if(!await findUserById(userId)){
            throw new ValidationError('No user found.')
        }
        db.beginTransaction();
        const [transaction] = await db.execute(
            'DELETE from transactions WHERE sender_id = ? OR receiver_id = ?',[userId,userId]
        );
        if(transaction.affectedRows === 0){
            return false;
        }
        const [contact] = await db.execute(
            'DELETE from contacts WHERE user_id = ? OR contact_user_id = ?',[userId,userId]
        );
        if(contact.affectedRows === 0){
            return false;
        }
        const [userResult] = await db.execute(
            'DELETE from user WHERE user_id = ?',[userId]
        );
        if(userResult.affectedRows === 0){
            return false;
        }
        db.commit();
        return true;
    }catch(error){
        db.rollback();
        logger.error('Failed to delete user details.');
        throw new DatabaseError('Failed to delete user details.',{userId,error});
    }
};

module.exports = {
    systemStatus,
    getAllUsers,
    getUserDetails,
    updateUserStatus,
    removeUser
}