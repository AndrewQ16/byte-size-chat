require('dotenv').config()
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const MongoClient = require('mongodb').MongoClient;
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const url = process.env.MONGO_URL;
const collection = process.env.DB;
const client = new MongoClient(url, { useUnifiedTopology: true });
var dbName = process.env.DB;
var auth;
var io;
app.use(express.static('public'));
app.use(express.json());
app.use('/chat', cookieParser(),authenticateToken,express.static('private'));
client.connect()
    .then((value)=>{
        auth = require('./auth')(client.db(dbName), process.env.USERS);
        io = require('./messenger')(http, client.db(dbName));
        app.use("/auth",auth);
    })
    .catch(res => {
     throw res;   
    });


app.get('/test', (req, res) =>{
    res.status(200).send('helllooooo!');
});

/**
 * Starts up the http server
 */
const port = 3000;
http.listen(port, () => {
    console.log(`listening on *:${port}`);
});

function authenticateToken(req, res, next){
    // if(token == null) return res.sendStatus(401);
    // jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    //     if (err) return res.sendStatus(403);
    //     req.user = user
    //     next()
    // });
    jwt.verify(req.cookies['accessToken'], process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) throw err;
        req.user = user;
        next();
    });
}

// export default http;
module.exports = http;