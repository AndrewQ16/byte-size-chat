require('dotenv').config({path: './.env.test'});
const chai = require('chai');
const chaiHttp = require('chai-http');
const http = require('../index')
const MongoClient = require('mongodb').MongoClient;
const bcrypt = require('bcrypt');
const fetch = require('node-fetch')

const assert = chai.assert;
chai.use(chaiHttp);


suite('Test Express sample endpoint', ()=>{
    test('Test end point', (done)=>{
        chai.request(http)
            .get('/test')
            .end((err, res)=>{
                if(err) throw err;
                
                assert.equal(res.status, 200);
                assert.isAtLeast(res.text.length, 0);
                done();
            });
    });
});

suite('Test registration ', ()=>{
    test('Test valid registration', (done)=>{
        chai    
            .request(http)
            .post('/auth/register')
            .send({'username':'fakeuser1',
            'email':'sample@gmail.com',
            'password':'notyethashed'})
            .end((err, res)=>{
                if(err) throw err;

                assert.equal(res.status, 201);
                assert.equal(res.text,'User created!');
                done();
            });
        
    });

    test('Test unavailable username', (done)=>{
        chai    
            .request(http)
            .post('/auth/register')
            .send({'username':'fakeuser1',
            'email':'random@gmail.com',
            'password':'notyethashed'})
            .end((err, res)=>{
                if(err) throw err;

                assert.equal(res.status, 500);
                assert.equal(res.text,'User exists!');
                done();
            });
        
    });

    test('Test unavailable email', (done)=>{

        chai    
            .request(http)
            .post('/auth/register')
            .send({'username':'fakeuser2',
            'email':'sample@gmail.com',
            'password':'notyethashed'})
            .end((err, res)=>{
                if(err) throw err;

                assert.equal(res.status, 500);
                assert.equal(res.text,'Email registered!');
                done();
            });
        
    });

    test('Test empty payload', (done)=>{
        chai    
            .request(http)
            .post('/auth/register')
            .send()
            .end((err, res)=>{
                if(err) throw err;

                assert.equal(res.status, 400);
                assert.equal(res.text,'Fields are empty');
                done();
            });
    });

    suiteTeardown('Delete sample user',()=>{
        // delete the 'fakeuser1' from the test db
        let client = new MongoClient(process.env.MONGO_URL, { useUnifiedTopology: true });
        client.connect()
            .then(()=>{
                let db = client.db(process.env.DB);
                db.collection(process.env.USERS).deleteOne({'username':'fakeuser1',
                'email':'sample@gmail.com'});
            })
            .catch((err) =>{
                throw err;
            })
    });
});

suite('Test login functionality', ()=>{

    // Register a sample
    suiteSetup('Register test user' ,async ()=>{

        try {
            let client = new MongoClient(process.env.MONGO_URL, { useUnifiedTopology: true });
            client = await client.connect();
            let db = client.db(process.env.DB);
            let collection = db.collection(process.env.USERS);
            let salt = await bcrypt.genSalt(5);
            let hashedPassword = await bcrypt.hash('123456', salt);
            result = await collection.insertOne({'username': 'Big Pops', 'email': 'ex@sample.com', 'password': hashedPassword});
            
            // This will work if I allows CORS I think:

            // const data = {
            //     'username': 'Big Pops',
            //     'email': 'ex@sample.com',
            //     'password': '123456'
            // }
        
            // const response = await fetch('http://localhost:3000/auth/register', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json'
            //     },
            //     body: JSON.stringify(data)
            // });
        } catch (err){
            console.log(err);
        }
        
    });

    test('Login with username user', (done)=>{
        chai    
            .request(http)
            .post('/auth/login')
            .send({'username':'Big Pops',
            'password':'123456'})
            .end((err, res)=>{
                if(err) throw err;

                assert.equal(res.status, 304);

                // Doesn't show Set-Cookie
                // assert.isNotEmpty(res.headers)



                done();
            });
    });

    test('Login with non-existent username', (done)=>{
        chai    
            .request(http)
            .post('/auth/login')
            .send({'username':'Dont exist',
            'password':'123456'})
            .end((err, res)=>{
                if(err) throw err;

                assert.equal(res.status, 400);
                assert.isEmpty(res.body);
                done();
            });
    });

    test('Login with non-existent email', (done)=>{
        chai    
            .request(http)
            .post('/auth/login')
            .send({'username':'Dont@exist.co',
            'password':'123456'})
            .end((err, res)=>{
                if(err) throw err;

                assert.equal(res.status, 400);
                assert.isEmpty(res.body);
                done();
            });
    });

    test('Login without username field (and password field)', (done)=>{
        chai    
            .request(http)
            .post('/auth/login')
            .send({})
            .end((err, res)=>{
                if(err) throw err;

                assert.equal(res.status, 400);
                assert.isEmpty(res.body);
                done();
            });
    });

    suiteTeardown('Delete sample user', ()=>{
        let client = new MongoClient(process.env.MONGO_URL, { useUnifiedTopology: true });
        client.connect()
            .then(()=>{
                let db = client.db(process.env.DB);
                db.collection(process.env.USERS).deleteOne({'username':'Big Pops',
                'email':'ex@sample.com'});
            })
            .catch((err) =>{
                throw err;
            })
    })
});