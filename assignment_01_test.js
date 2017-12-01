'use strict';

const jsonlint = require('jsonlint');
const fs = require('fs');
const path = require('path');

fs.readFile(path.join(__dirname,'/customer-data.json'), (err, data) => {
    if(!err) {
    
        try {
            jsonlint.parse(data.toString('utf8')); 
            console.log(`JSON file is valid.`);
        } catch(err) {
            console.log(`Invalid JSON File. Error code: ${err.code}`);
        }   

    } else {
        console.log(`Invalid JSON File. Error code: ${err.code}`);
    }
})

