/**
 * Handle all authentication and authorization
 */
require('dotenv').config()

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const url = process.env.MONGO_URL;
var db;
var accounts_collection;

// There is no cache right now for refresh tokens.
// One can be added later like Redis.
const refreshTokens = new Set();


router.post('/login', async (req, res)=>{
    let collection = db.collection(accounts_collection)
    let user;
    // username is either username and email
    if(req.body.username && validateEmail(req.body.username)){
        user = await collection.findOne({'email': req.body.username}); 
    } else if(req.body.username) {
        user = await collection.findOne({'username': req.body.username});
        
    } else {
        // The value is null
        return res.status(400).send('Fields were empty.');
    }

    if(user == null){
        return res.status(400).send('No user found.');
    }

    try {
        if(await bcrypt.compare(req.body.password, user.password)){
            // Essentially remove the email and password from the user
            // object that will be put in the JWT
            user = {
                'username': user.username
            }
            
            const accessToken = generateAccessToken(user);
            const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
            refreshTokens.add(refreshToken);
            res.setHeader('Set-Cookie', [`accessToken=${accessToken}; Expires=${new Date(9999,12,1).toUTCString()}; Path=/; Secure`, `refreshToken=${refreshToken}`]);
            return res.redirect(302, 'http://localhost:3000/chat.html');
            
            // Previously sent cookies as JSON but now is set a cookie
            // res.json({
            //     'accessToken': accessToken,
            //     'refreshToken': refreshToken
            // })

            // Once logged in, redirect to "/"
        } else {
            return res.status(400).send('Incorrect password.')
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send();
    }
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

    let salt = await bcrypt.genSalt(5);
    let hashedPassword = await bcrypt.hash(req.body.password, salt);

    collection.insertOne({'username': req.body.username, 'email': req.body.email, 'password': hashedPassword})
        .then(()=> res.status(201).send('User created!'))
        .catch(()=> res.status(500).send('Error with registration.'));

});

/**
 * Grabbed from: https://stackoverflow.com/questions/46155/how-to-validate-an-email-address-in-javascript
 * @param {*} email 
 */
function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1000s'});
}

module.exports = function(_db, _accounts) {
    db = _db;
    accounts_collection = _accounts;
    return router;
}