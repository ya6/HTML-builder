const   {readdir}  = require('fs/promises');
const path = require('path');
const {stat} = require('fs/promises');


const getFiles = async (folder)=> {

  const dirPath=path.join(__dirname, folder);
  
  let files  = await readdir(dirPath , {withFileTypes: true});
  
  files = files.filter(file => file.isFile());

  files = files.map((file)=> {
    return {name: file.name.slice(0, file.name.length - path.extname(file.name).length),
      ext: path.extname(file.name).slice(1),
      size: 0,
      path: path.join(__dirname, 'secret-folder', file.name)};
  });

  const promises = files.map(file => stat(file.path));

  for (let i = 0; i < files.length; i++) {
    files[i].size = (await promises[i]).size;
    console.log(`${files[i].name} - ${files[i].ext} - ${files[i].size}`);
  }
  
};

getFiles('secret-folder');


