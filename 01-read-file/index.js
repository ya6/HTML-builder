const path = require('path');
const fs = require('fs');

const filePath =path.join(__dirname, 'text.txt');

const readable = fs.createReadStream(filePath);
readable.setEncoding('UTF8');

readable.on('readable', ()=> {
  let chunk;
  while (null !== (chunk = readable.read())) {
    console.log(chunk);
  }
});