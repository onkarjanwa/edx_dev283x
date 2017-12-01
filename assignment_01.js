'use strict';

const fs = require('fs');
const path = require('path');

fs.readFile(path.join(__dirname,'/customer-data.csv'), (err, data) => {

    if(!err) {

        let csvRows = data.toString('utf8').split('\r\n');
        let headers = csvRows[0].split(',');
        headers[headers.length-1] = headers[headers.length-1];

        let outputData = [];

        for (var i = 1; i <= csvRows.length-1; i++) {
            
            let rowData = csvRows[i].split(',');
            if(rowData[0] != undefined && rowData[0] != "") {
                let jsonItem = {};
                for (var j = 0; j <= rowData.length-1; j++) {
                    if(headers[j] != undefined) {
                        jsonItem[headers[j]] = rowData[j] == undefined ? '' : rowData[j];
                    }
                };

                outputData.push(jsonItem);
            }
        };

        fs.writeFile(path.join(__dirname,'/customer-data.json'), JSON.stringify(outputData), 'utf8', (err) => {

            if(!err) {
                console.log(`CSV to JSON Conversion done.`)
            } else {
                console.log(`Error in writing json file. Error code: ${err.code}`)
            }

        });
        
    } else {
        console.log(`Error in reading csv file. Error code: ${err.code}`)
    }

})