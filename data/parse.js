const fs = require('fs');
const xml2js = require('xml2js');

const parser = new xml2js.Parser();
fs.readFile(__dirname + '/full-database.xml', (err, data) => {
  if (err) {
    console.log(err);
  }
  parser.parseString(data, (err, result) => {
    console.dir(result);
    console.log('done');
  });
});
