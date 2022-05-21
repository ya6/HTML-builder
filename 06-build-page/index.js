const path = require('path');
const {mkdir, readdir, readFile, writeFile, copyFile, rmdir } = require('fs/promises');

const templateName = 'template.html';

const htmlSourceFolder = 'components';
const cssSourceFolder = 'styles';

const distDir = 'project-dist';
const assetsDir = 'assets';

const cssBundleName = 'style.css';
const htmlBundleName = 'index.html';


const makeDir = async (distDir) => {
 
  const distDirPath = path.join(__dirname, distDir);
  try {
    await mkdir(distDirPath, {recursive: true});
  } catch (err) {
    console.error(err);
  }
};

const getFilesOnExt = async (folder, extFilter)=> {

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

const getOnlyName = (url)=> {

  const baseName = path.basename(url);
  const name = baseName.slice(0, baseName.length - path.extname(baseName).length);
  return name;
};

const getSeparateDataFromFiles = async (arrOfFiles) =>{
  
  const files = {};
  for  (const file of arrOfFiles) {
    const fileData = await readFile(file, { encoding: 'UTF8'});
    files[getOnlyName(file)] = fileData ;
  }
  return files;
};

const getArrOfDada = async (arrOfFiles)=> { 
  const promises = arrOfFiles.map((file) => readFile(file, { encoding: 'UTF8'}));
  const arrOfData = await Promise.all(promises);
  return arrOfData;
};

const writeArrOfDadaInFile = async (distDir, bundleName, arrOfData) => {
  
  const bundleFullName = path.join(__dirname, distDir,  bundleName);

  try {
    await writeFile(bundleFullName, arrOfData.join('\n'), {  encoding: 'UTF8',  flags: 'w' });
  } catch (error) {
    console.log(error);
  }
  return;
};

const copyDir = async (src, dest) => {

  let entries = null;
  try {  
    entries = await readdir(src, {withFileTypes:true});
  } catch (error) {
    console.log('no assets?');
    return;
  }
  
  if (entries) {
    await mkdir(dest, {recursive: true});
    for(let entry of entries) {
      const srcPath = path.join(src,entry.name);
      const destPath = path.join(dest,entry.name);
      if(entry.isDirectory()) {
        await copyDir(srcPath, destPath);
      } else {
        await copyFile(srcPath, destPath);
      }
    }
    
  }

};

const makeBundle = async ()=> {
  
  try {
    await rmdir( path.join(__dirname, distDir), {recursive: true});  
  } catch (error) {
    true; //trick
  }

  await makeDir(distDir);
  
  //css 
  let cssFiles = null;
  try {
    cssFiles = await getFilesOnExt(cssSourceFolder, 'css');
    if (cssFiles) {
      const arrOfCssData = await getArrOfDada(cssFiles);
      writeArrOfDadaInFile(distDir, cssBundleName, arrOfCssData);
    }
  
  } catch (error) {
    console.log('no styles?');
  }


  
  
  //html components
  let htmlFiles = null;
  let objOfHtmlData = {};
  try {
    htmlFiles = await getFilesOnExt(htmlSourceFolder, 'html');
    if (htmlFiles) {
      objOfHtmlData = await getSeparateDataFromFiles(htmlFiles);
     
    }
  
  } catch (error) {
    console.log('no components?');
  }

 
  // template
  let objTemplate = null;

  try {
    objTemplate = await getSeparateDataFromFiles([path.join(__dirname, templateName)]);
    const templateInArr = objTemplate[getOnlyName(templateName)].split('\n');
  
    const bundledTemplateInArr = templateInArr.map(line=> {
    
      if (line.substring(line.length-2) === '}}') {
        let component = line.trim();
        component = component.substring(2, component.length-2);  
        return objOfHtmlData[component] || line;
      }
      return line;  
    });
  
    writeArrOfDadaInFile(distDir, htmlBundleName, bundledTemplateInArr);  
    
  } catch (error) {
    console.log('no template?');  
  }
  
  
  //assets
  await copyDir(path.join(__dirname, assetsDir), path.join(__dirname, distDir, assetsDir));
  
  console.log('Done!');
};

// go
makeBundle();