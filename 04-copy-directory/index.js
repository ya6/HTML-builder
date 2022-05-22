
const { rm, mkdir, copyFile, readdir } = require('fs/promises');
const path = require('path');

const sourceDirPath = path.join(__dirname, 'files');
const destDirPath = path.join(__dirname, 'files-copy');


const copyDir = async (source, dest) => {
 
  try {
    await rm(dest, { recursive: true, force: true });
    
  } catch (error) {
    console.log('rm');
  }


  try {
    await mkdir(dest, {recursive: true});
  } catch (err) {
    console.log(mkdir);
  }

  let entries = await readdir(source , {withFileTypes: true});

  for(const entry of entries) {
    const srcPath = path.join(source, entry.name);
    const destPath = path.join(dest, entry.name);
    if(entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await copyFile(srcPath, destPath);
    }
  }    
};

// Go
copyDir(sourceDirPath, destDirPath);


