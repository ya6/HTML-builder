console.log('--06--');

const path = require('path');
const fs = require('fs');
const readline = require('readline');


const template = 'template.html';


const filePath =path.join(__dirname, template);


const rl = readline.createInterface({
  input: fs.createReadStream(filePath),
  // output: process.stdout
});


const bundleHTML = () => {
  return new Promise((resolve)=>{
    let data ='';
    rl.on('line', (input) => {  


      switch (input.trim()) {
      case '{{articles}}':
        data +=input+'--------\n';
        break;
      
      default:
        data +=input+'\n'; 
        break;
      }
     
    });
  
    rl.on('close' ,() => resolve(data));
  });
};

const makeBundle = async ()=> {
  const data = await bundleHTML();
  console.log(data);
};


// go
makeBundle();


