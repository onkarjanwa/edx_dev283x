const fs = require('fs');
const path = require('path');
const async = require('async');
const mongoose = require('mongoose');
const dbUrl = 'mongodb://localhost:27017/integration_tests';

mongoose.connect(dbUrl, { useMongoClient: true });
mongoose.Promise = global.Promise;

var UserProfile = mongoose.model('UserProfile', { 
    id: String,
    first_name: String,
    last_name: String,
    email: String,
    gender: String,
    ip_address: String,
    ssn: String,
    credit_card: String,
    bitcoin: String,
    street_address: String,
    country: String,
    city: String,
    state: String
});

//GetMongoDbInstance( () => {} );

const fileOne = 'm3-customer-data.json';
const fileTwo = 'm3-customer-address-data.json';

var firstFileData = JSON.parse(fs.readFileSync(path.join(__dirname, fileOne),'utf8'));
var secondFileData = JSON.parse(fs.readFileSync(path.join(__dirname, fileTwo),'utf8'));

const numOfQueries = parseInt(process.argv[2]) || 1000;
console.log(`Number of queries: ${numOfQueries}`)
var singalPartLength =  parseInt(firstFileData.length/numOfQueries);
console.log(`Total queries: ${singalPartLength}`)
function mergeAray(array1, array2, message, callback) {
    let mergeD = [];
    let l = array1.length;
    for (let i = 0; i <= l-1; i++) {
        mergeD.push(Object.assign({}, array1[i], array2[i]));        

        if(i === l-1) {
            UserProfile.create(mergeD, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('meow');
                }
            });
            console.log(`Inserted ${array1.length}`)
            callback(null, 'done');            
        }
    };
}

var tasks = [];
var ll = firstFileData.length;
console.log(`Total records ${ll}`)
var j = 0;
var startTime = (new Date()).getTime();
while(j < ll) {
    let partL = (ll - j) > singalPartLength ? singalPartLength : ll - j;
    let p1 = firstFileData.slice(j, j+partL);
    let p2 = secondFileData.slice(j, j+partL);
    let m = `Inserting from ${j} - ${j+partL}`;
    console.log(m)
    tasks.push( callback => {
        mergeAray(p1, p2, m, callback);
    } );
    j = j + partL;
    console.log(`Postion ${j} ${ll}`)
    if(j >= ll) {
        console.log(`Postion ${j} ${ll}`)
        async.parallel(tasks, (error, results) => { 
            var time = startTime - (new Date()).getTime();
            console.log(`Insertion done withing ${time}`);
            process.exit(1);
        });
    }
}