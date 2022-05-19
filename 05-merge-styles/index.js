const { readdir } = require('fs/promises');
const path = require('path');
const { readFile, writeFile } = require('fs/promises');

//funcs
const getFiles = async (folder, extFilter = 'css')=> {
  const dirPath = path.join(__dirname, folder);
  let files = await readdir(dirPath , {withFileTypes: true});
  files = files.filter(file => file.isFile());
  files = files.map(file => file.name);
  files = files.filter(file => {
    const ext = path.extname(file).slice(1);
    return extFilter.toLowerCase() === ext.toLowerCase();
  });
  files = files.map(file => path.join(dirPath, file));
  
  return files;
};

const getArrOfDada = async (arrOfFiles)=> { 
  const promises = arrOfFiles.map((file) => readFile(file, { encoding: 'UTF8'}));
  const arrOfData = await Promise.all(promises);
  return arrOfData;
};

const writeArrOfDada = async (distDir, bundleName, arrOfData) => {
  
  const bundleFullName = path.join(__dirname, distDir,  bundleName);

  try {
    await writeFile(bundleFullName, arrOfData.join('\n'), {  encoding: 'UTF8',  flags: 'w' });
    console.log('Done!');
  } catch (error) {
    console.log(error);
  }
};


const makeCssBundle =async ()=> {
  
  const files = await getFiles(sourceDir);
  
  const arrOfData = await getArrOfDada(files);
  
  writeArrOfDada(distDir, bundleName, arrOfData); 
};


// go
const sourceDir = 'styles';
const distDir = 'project-dist';
const bundleName = 'bundle.css';

makeCssBundle();
