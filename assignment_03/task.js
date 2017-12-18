const fs = require('fs');
const path = require('path');
const mongoClient = require('mongodb').MongoClient;
const dbUrl = 'mongodb://localhost:27017/edx-course-db';


function GetMongoDbInstance(callback) {
    mongoClient.connect(dbUrl, {}, function(err, client) {
        if(err) return process.exit(1);
        callback(client.db("integration_tests"));
    });
}

const fileOne = 'm3-customer-data.json';
const fileTwo = 'm3-customer-address-data.json';

var firstFileData = JSON.parse(fs.readFileSync(path.join(__dirname, fileOne),'utf8'));
var secondFileData = JSON.parse(fs.readFileSync(path.join(__dirname, fileTwo),'utf8'));

const numOfQueries = parseInt(process.argv[2]);
console.log(numOfQueries)
var singalPartLength =  parseInt(firstFileData.length/numOfQueries);

function mergeAray(array1, array2) {
    return new Promise(function(resolve, reject) {
        let mergeD = [];
        let l = array1.length;

        var dbInsertMethod = function(i) {
            let dataObject = Object.assign({}, array1[i], array2[i]);
            GetMongoDbInstance(function(connection){
                connection.collection('user_data').insert(dataObject, (err, obj) => {
                    if(i < l-1) {
                        i = i+1;
                        dbInsertMethod(i);
                    } else {
                        resolve();
                    }
                });
            });
        }

        dbInsertMethod(0);
    });
}

var tasks = [];
var ll = firstFileData.length;
var j = 0;
while(j < ll) {
    let partL = (ll - j) > singalPartLength ? singalPartLength : ll - j;
    let p1 = firstFileData.slice(j, j+partL);
    let p2 = secondFileData.slice(j, j+partL);
    j = j + partL;
    tasks.push(mergeAray(p1, p2));

    if(j >= ll) {
        Promise.all(tasks).then((v) => { 
            console.log("Mongo insert complete");
            process.exit(1);
        });
    }
}