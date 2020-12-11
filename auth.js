/**
 * Handle all authentication and authorization
 */
require('dotenv').config()
const e = require('express');
const express = require('express');
const router = express.Router();
const MongoClient = require('mongodb').MongoClient;
const url = process.env.MONGO_URL;

const dbName = process.env.DB_NAME;

const client = new MongoClient(url, { useUnifiedTopology: true });


router.use(function timeLog( req, res, next) {
    console.log('Time: ', Date.now());
    
    next();
});

router.post('/login', (req, res, next)=>{
    res.status(200).send("Login page")
});

/**
 * The req will contain: desired username, email, password
 */
router.post('/register', (req, res, next)=>{
    client.connect(async function(err, client) {
        let db = client.db(dbName);
        let users = 'users';
        var status = 0;
        let collection = db.collection(users)
        
        let username = await collection.findOne({'username': req.body.username});

        if(username != null && username['username'].length > 0) {
            return res.status(500).send('User exists!');
        }

        let email = await collection.findOne({'email': req.body.email});

        if(email != null && email['email'].length > 0) {
            return res.status(500).send('Email registered!');
        }
        //catch any errors thrown from the DB
        
        await collection.insertOne(
                {'username': req.body.username, 'email': req.body.email, 'password': req.body.password});
        
        return res.status(201).send('User created!');
        

        
    });
});

function n(err, result) {
    if(err) return res.status(500).send(err);
    if(result) return res.status(500).send({message: "email used"});
}

module.exports = router;