require('dotenv').config()
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const MongoClient = require('mongodb').MongoClient;
const url = process.env.MONGO_URL;
const collection = process.env.DB;
console.log(`Using collection: ${collection}`);
const client = new MongoClient(url, { useUnifiedTopology: true });
var dbName = process.env.DB;
var auth;
var io;
app.use(express.static('public'));
app.use(express.json());


client.connect()
    .then((value)=>{
       auth = require('./auth')(client.db(dbName), process.env.USERS);
       const io = require('./messenger')(http, client.db(dbName));
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

// export default http;
module.exports = http;