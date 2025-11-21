const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();


// Render register form
router.get('/register', (req, res) => {
    res.render('auth/register', { error: null });
});


router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) return res.render('auth/register', { error: 'Vui lòng điền đầy đủ' });


        const existing = await User.findOne({ where: { [User.sequelize.Op.or]: [{ username }, { email }] } });
        if (existing) return res.render('auth/register', { error: 'Username hoặc email đã tồn tại' });


        const user = await User.create({ username, email, password });
        const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET);
        req.session.token = token;
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.render('auth/register', { error: 'Lỗi server' });
    }
});


// Render login form
router.get('/login', (req, res) => {
    res.render('auth/login', { error: null });
});


router.post('/login', async (req, res) => {
    try {
        const { identifier, password } = req.body; // accept username or email
        if (!identifier || !password) return res.render('auth/login', { error: 'Vui lòng điền đầy đủ' });


        const user = await User.findOne({ where: { [User.sequelize.Op.or]: [{ username: identifier }, { email: identifier }] } });
        if (!user) return res.render('auth/login', { error: 'Tài khoản không tồn tại' });


        const valid = await user.validatePassword(password);
        if (!valid) return res.render('auth/login', { error: 'Mật khẩu không đúng' });


        const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET);
        req.session.token = token;
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.render('auth/login', { error: 'Lỗi server' });
    }
});


router.post('/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/auth/login'));
});
module.exports = router;