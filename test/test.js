if(process.env.NODE_ENV == 'dev'){
    require('dotenv').config({path: './.env'});
} else if (process.env.NODE_ENV == 'test'){
    require('dotenv').config({path: './.env.test'});
}

var chai = require('chai');
var assert = chai.assert;
var chaiHttp = require('chai-http');
var http = require('../index')
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

/**
 * Not sure how to make Mocha end the program once the tests are done.
 */
suiteTeardown(() =>{
    http.close();
});