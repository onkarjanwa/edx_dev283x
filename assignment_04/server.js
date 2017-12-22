const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const morgan = require('morgan');
const express = require('express');
const bodyParser = require('body-parser');

mongoose.Promise = global.Promise;
let accountSchema = mongoose.Schema({
    balance: Number,
    name: String
});
var Account = mongoose.model('Account', accountSchema, 'cln_account');

function connect() {
    mongoose.connect('mongodb://localhost/module_4_assignment_01', {useMongoClient: true});
}

var app = express();

app.use(morgan('combined', {stream: fs.createWriteStream(path.join(__dirname, 'access.log'), {flags: 'a'})}))
app.use(bodyParser.json())
app.use(function(req, res, next){
    connect();
    next();
});

// curl "http://localhost:3000/accounts"
app.get('/accounts', function(req, res) {
    Account.find( (err, results) => {
        if(err) {
            res.sendStatus(500);            
        } else {
            res.send({accounts: results});
        }
    });
})

// curl -H "Content-Type: application/json" -X POST -d '{"balance": "1000", "name": "savings"}' "http://localhost:3000/accounts"
app.post('/accounts', function(req, res) {
    console.log(req);
    let userAccount = new Account(req.body);
    userAccount.save( (err, result) => {
        if(err) {
            res.sendStatus(500);            
        } else {
            res.send({saved: true});
        }
    });
})

//curl -H "Content-Type: application/json" -X PUT -d '{"balance": "1500"}' "http://localhost:3000/accounts/id"
app.put('/accounts/:id', function(req, res) {
    Account.findById(req.params.id, (err, result) => {
        if(err) {
            res.sendStatus(404);            
        } else {
            if(result) {
                result.name = req.body.name;
                result.balance = req.body.balance;
                result.save( (innerErr, innerResult) => {
                    if(innerErr) res.sendStatus(500)
                    res.send({saved: true});
                } );        
            } else {
                next(new Error('Account not found :-('));
            }    
        }
    });
})

// curl -X DELETE "http://localhost:3000/accounts/id"
app.delete('/accounts/:id', function(req, res, next) {
    Account.findById(req.params.id, (err, result) => {
        if(err) {
            res.sendStatus(404);            
        } else {
            if(result) {
                result.remove();
                res.sendStatus(200);
            } else {
                next(new Error('Account not found :-('));
            }
        }
    });
})

app.use((error, req, res, next)=>{
    console.log(`Error: ${error.message}`)
    res.status(500).send({msg: error.message})
})

app.listen(3000, () => {
    console.log('http://localhost:3000')
});