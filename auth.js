/**
 * Handle all authentication and authorization
 */
require('dotenv').config()

const express = require('express');
const router = express.Router();
const url = process.env.MONGO_URL;
var db;
var accounts_collection;
router.use(function timeLog( req, res, next) {
    console.log('Time: ', Date.now());
    
    next();
});

router.post('/login', (req, res, next)=>{
    res.status(200).send("Login page")
});

router.get('/', (req,res)=>{
    res.status(200).send('hello');
});

/**
 * The req will contain: desired username, email, password
 */
router.post('/register', async (req, res)=>{

    if(!req.body.username || !req.body.email || !req.body.password)
        return res.status(400).send('Fields are empty');

    let collection = db.collection(accounts_collection)
    
    let username = await collection.findOne({'username': req.body.username});

    if(username != null) {
        return res.status(500).send('User exists!');
    }

    let email = await collection.findOne({'email': req.body.email});

    if(email != null) {
        return res.status(500).send('Email registered!');
    }
    //catch any errors thrown from the DB
    collection.insertOne({'username': req.body.username, 'email': req.body.email, 'password': req.body.password})
        .then(()=> res.status(201).send('User created!'))
        .catch(()=> res.status(500).send('Error with registration.'));

});


module.exports = function(_db, _accounts) {
    db = _db;
    accounts_collection = _accounts;
    return router;
}