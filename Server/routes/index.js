const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const adminRoutes = require('./adminRoutes');
const userRoutes = require('./userRoutes');
const transactionRoutes = require('./transactionRoutes');

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/user',userRoutes);
router.use('/transactions', transactionRoutes);

router.get('/health', (req,res)=>{
    return res.status(200).json({
        success: true,
        message: "Server is active.",
        timestamp: new Date()
    });
});

module.exports = router;
