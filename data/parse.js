const fs = require('fs');

fs.readFile(__dirname + '/small.xml', 'utf-8', (err, data) => {
  console.log(data);
});
