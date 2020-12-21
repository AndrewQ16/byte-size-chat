require('dotenv').config({path: './.env.test'});
var chai = require('chai');
var chaiHttp = require('chai-http');
var http = require('../index')
var MongoClient = require('mongodb').MongoClient;

var assert = chai.assert;
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
                assert.equal(res.status, 400);
                assert.equal(res.text,'Fields are empty');
                done();
            });
    });

    suiteTeardown(()=>{
        // delete the 'fakeuser1' from the test db
        let client = new MongoClient(process.env.MONGO_URL, { useUnifiedTopology: true });
        client.connect()
            .then(()=>{
                let db = client.db(process.env.DB);
                db.collection(process.env.USERS).deleteOne({'username':'fakeuser1',
                'email':'sample@gmail.com',
                'password':'notyethashed'});
            })
            .catch((err) =>{
                throw err;
            })
    });
});

