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
  if (line ==='exit') {
    rl.output.write('\nBye!');
    exit();
  }
  writer.write(line+'\n');
});
process.on('beforeExit', ()=> {rl.output.write('\nBye!');});
// rl.on('SIGINT', () => {
//   rl.close();
// });
// rl.on('close', () => {
//   rl.output.write('\nBye!')
// });