const { mkdir } = require('fs/promises');
const { copyFile } = require ('fs/promises');
const { readdir } = require('fs/promises');
const path = require('path');

const sourceDir = 'files';
const distDir = 'files-copy';

const getFiles = async (folder)=> {
  const dirPath = path.join(__dirname, folder);
  let files = await readdir(dirPath , {withFileTypes: true});
  files = files.filter(file => file.isFile());
  files = files.map(file => file.name);
  return files;
};


const copyDir = async (sourceDir, distDir) => {
  
  const distDirPath = path.join(__dirname, distDir);

  try {
    await mkdir(distDirPath, {recursive: true});
  } catch (err) {
    console.error(err);
  }

  const files = await getFiles(sourceDir);

  const promises = files.map((file) =>{
    const sourceFile = path.join(__dirname, sourceDir, file);
    const distFile = path.join(__dirname, distDir, file);
    return  copyFile(sourceFile, distFile);
  } 
  
  );

  await Promise.all(promises);
  console.log(('Done!'));
};

// Go
copyDir(sourceDir, distDir);


