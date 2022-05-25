const path = require('path');
const {mkdir, readdir, readFile, writeFile, copyFile, rm} = require('fs/promises');

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
    console.log(err);
  }
};
const delDir = async(distDir) => {
  try {
    await rm(path.join(__dirname, distDir), {recursive: true, force: true});
  } catch (err) {
    true; // if del not empty dir
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
  files.sort((a, b)=>a.charCodeAt(2) - b.charCodeAt(2)); // for css order
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
  for (const file of arrOfFiles) {
    const fileData = await readFile(file, { encoding: 'UTF8'});
    files[getOnlyName(file)] = fileData ;
  }
  return files;
};

const getArrOfDadaFromFiles = async (arrOfFiles)=> { 
  const promises = arrOfFiles.map((file) => readFile(file, { encoding: 'UTF8'}));
  const arrOfData = await Promise.all(promises);
  return arrOfData;
};

const writeArrOfDadaInFile = async (distDir, bundleName, arrOfData) => {
  
  const bundleFullName = path.join(__dirname, distDir,  bundleName);

  try {
    await writeFile(bundleFullName, arrOfData.join('\n'), {  encoding: 'UTF8',  flags: 'w' });
  } catch (err) {
    console.log(err);
  }
  return;
};

const copyDir = async (source, dest) => {

  let entries = null;
  try {  
    entries = await readdir(source, {withFileTypes:true});
    if(entries.length === 0) throw new Error ;
  } catch (err) {
    console.log('no assets?');
    return;
  }
  
  if (entries) {
    await mkdir(dest, {recursive: true});
    for(const entry of entries) {
      const srcPath = path.join(source, entry.name);
      const destPath = path.join(dest, entry.name);
      if(entry.isDirectory()) {
        await copyDir(srcPath, destPath);
      } else {
        await copyFile(srcPath, destPath);
      }
    }    
  }
};

const makeBundle = async ()=> {
  
  await delDir(distDir);

  await makeDir(distDir);
  
  //css 
  let cssFiles = null;

  try {
    cssFiles = await getFilesOnExt(cssSourceFolder, 'css');
    if(cssFiles.length === 0) throw new Error ;
    if (cssFiles && cssFiles.length) {
      const arrOfCssData = await getArrOfDadaFromFiles(cssFiles);
      writeArrOfDadaInFile(distDir, cssBundleName, arrOfCssData);
    }

  } catch (err) {
    console.log('no styles?');
  }
  
  //html components
  let htmlFiles = null;
  let objOfHtmlData = {};
  try {
    htmlFiles = await getFilesOnExt(htmlSourceFolder, 'html');
    if(!htmlFiles || htmlFiles.length === 0) throw new Error ;
   
    objOfHtmlData = await getSeparateDataFromFiles(htmlFiles);
   

    let arrTemplate = await getArrOfDadaFromFiles([path.join(__dirname, templateName)]);
    if(!arrTemplate || arrTemplate.length === 0) throw new Error ;
    
    let _template = arrTemplate[0];
      
    for (const key in objOfHtmlData) {
      _template = _template.replace(`{{${key}}}`, objOfHtmlData[key]);
    } 
    const reg = /\{\{\w+\}\}/gi;
    _template = _template.replace(reg, '');

    const bundledTemplateInArr = [_template];
      
    writeArrOfDadaInFile(distDir, htmlBundleName, bundledTemplateInArr);  
    
  
  } catch (err) {
    console.log('no components or template?');
  }

  // template
  // let arrTemplate = null;
 

  // try {
  // objTemplate = await getSeparateDataFromFiles([path.join(__dirname, templateName)]);
  // arrTemplate = await getArrOfDadaFromFiles([path.join(__dirname, templateName)]);
  // console.log('==> ', arrTemplate);
    
  // if (arrTemplate) {
  //   let _template = arrTemplate[0];
      
  //   for (const key in objOfHtmlData) {
  //     _template = _template.replace(`{{${key}}}`, objOfHtmlData[key]);
  //   }
      
  // const templateInArr = _template.split('\n');
  // console.log(templateInArr);
  // let bundledTemplateInArr = templateInArr.map(line=> {
  //   // if (line.substring(line.length-2) === '}}') {
  //   if (line.indexOf('{{') != -1 && line.indexOf('}}') != -1) {

  //     let component = line.trim();
  //     component = component.substring(2, component.length-2);
  //     // add spaces and insert component
  //     if (objOfHtmlData[component]) {
  //       const offset = ' '.repeat(line.split(' ').length - 1);
  //       let arrComponent = objOfHtmlData[component].split('\n');
  //       arrComponent = arrComponent.map(el => offset + el);
  //       const strComponent = arrComponent.join('\n');
  //       return strComponent;
  //     }
  //     return;
  //   }
  //   return line;  
  // });

  // bundledTemplateInArr = bundledTemplateInArr.filter(Boolean);
  // const reg = /\{\{\w+\}\}/;
  // _template = _template.replace(reg, '');
  // const bundledTemplateInArr = [_template];
  
  // writeArrOfDadaInFile(distDir, htmlBundleName, bundledTemplateInArr);  
  // writeArrOfDadaInFile(distDir, htmlBundleName, bundledTemplateInArr);  
  // }

  // } catch (err) {
  // console.log('no template?');  
  // }
  
  //assets
  
  await copyDir(path.join(__dirname, assetsDir), path.join(__dirname, distDir, assetsDir));
  
  console.log('Done!');
};

// go
makeBundle();