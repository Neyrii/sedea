const express = require('express');
const morgan = require('morgan');
const session = require('express-session')
const MongoDBSession = require('connect-mongodb-session')(session)
const mongoose = require('mongoose');

const routeur = require('./routeur')

// Initialisation of the server
const server = express()

// Connection to database
const mongoUri = 'mongodb://localhost:27017/sedea'
mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })

const store = new MongoDBSession({
    uri: mongoUri,
    collection: 'sessions'
})

server.use(express.urlencoded({ extended: true }))
server.use(morgan('dev'))
server.use(session({
    secret: 'key that will sign the cookie',
    resave: false,
    saveUninitialized: false,
    store: store
}));
server.use('/', routeur)

server.listen(3001, () => console.log('listening on localhost port 3001'))
