const express = require('express')
const bcrypt = require('bcryptjs')

const userModel = require('./models/userModel');
const { Mongoose } = require('mongoose');

const routeur = express.Router();

routeur.get("/", async (req, res) => {
    if (req.session.isAuth) {
        // GET all users and render them 
        let allUsers = await userModel.find({})
        res.render('main.html.twig', { users: allUsers, user: req.session.user })
    }
    else {
        res.render('noaccount.html.twig')
    }
})


routeur.get('/login/', (req, res) => {
    if (req.session.isAuth) {
        res.redirect('/')
    }
    else {
        let message = req.session.error
        req.session.error = ''
        res.render('login.html.twig', { message: message })
    }
})

routeur.get('/logout/', (req, res) => {
    req.session.destroy((err) => {
        if (err) throw err;
        res.redirect('/')
    })
})

routeur.post('/login/', async (req, res) => {
    const { email, password } = req.body
    let user = await userModel.findOne({ email })
    if (!user) {
        req.session.error = 'This user does not exist'
        res.redirect('/login')
    }
    else {
        const isMatch = await bcrypt.compare(password, user.password)
        console.log('is match ?', isMatch)
        if (!isMatch) {
            req.session.error = 'Password does not match'
            res.redirect('/login')
        }
        else {
            req.session.user = user;
            req.session.isAuth = true;
            res.redirect('/')
        }
    }
})

routeur.post('/signup/', async (req, res) => {
    const { username, email, password, info } = req.body;
    let user = await userModel.findOne({ email })
    if (username === "" || email === "" || password === "" || info === "") {
        req.session.error = 'please fill everything'
        res.redirect('/signup/')
    }
    else if (user) {
        req.session.error = 'email already taken'
        res.redirect('/signup/')
    }
    else user = await userModel.findOne({ username })
    if (user) {
        req.session.error = 'username already taken'
        res.redirect('/signup/')
    }
    else {
        const hashedPass = await bcrypt.hash(password, 12)
        let newUser = new userModel({ email: email, username: username, password: hashedPass, info: info })
        await newUser.save()
        req.session.user = newUser;
        req.session.isAuth = true;
        res.redirect('/')
    }
})

routeur.get('/signup/', (req, res) => {
    if (req.session.isAuth) {
        res.redirect('/')
    }
    else {
        res.render('signup.html.twig', { message: req.session.error })
    }
})

routeur.get('/deleteaccount', (req, res) => {
    if (!req.session.isAuth) {
        res.redirect('/')
    }
    else {
        res.render('deleteaccount.html.twig')
    }
})


routeur.post('/deleteaccount', (req, res) => {
    console.log(req.body)
    console.log(req.body)
    const { option } = req.body;
    if (option !== 'no') {
        userModel.findOneAndDelete({ email: req.session.user.email }).exec();
        req.session.isAuth = false;
    }
    res.redirect('/');
})

module.exports = routeur