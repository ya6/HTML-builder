console.log('--02--');
const path = require('path');
const fs = require('fs');

const readline = require('readline');
const { exit } = require('process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const fn = path.join(__dirname, 'test.txt');
let writer = fs.createWriteStream(fn, {
  flags: 'w'
});
rl.output.write('\nHi!\nTo finish, input: exit or press Ctrl+C\n\nInput data:\n');
// rl.input.pipe(writer);
rl.on('line', (line)=>{
  writer.write(line+'\n');
  if (line ==='exit') {
    rl.output.write('\nBye!');
    exit();
  }
});
// process.on('exit',()=> {rl.output.write('\nBye!');});
process.on('beforeExit', ()=> {rl.output.write('\nBye!');});