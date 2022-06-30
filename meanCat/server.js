const express = require('express');
const server = express()

server.get("/cat", (req, res) => {
    res.render('cat.html.twig')
})

server.listen(5000, () => console.log('listening on localhost port 5000'))