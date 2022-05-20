console.log('--06--');

const path = require('path');
const {mkdir, readdir, readFile, writeFile, copyFile } = require('fs/promises');


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



const getFiles = async (folder)=> {
  console.log('getFiles');

  
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


const makeBundle = async ()=> {
  await makeDir(distDir);
  //css 
  const cssFiles = await getFilesOnExt(cssSourceFolder, 'css');
  const arrOfCssData = await getArrOfDada(cssFiles);
  writeArrOfDadaInFile(distDir, cssBundleName, arrOfCssData);
  
  //html components
  const htmlFiles = await getFilesOnExt(htmlSourceFolder, 'html');
  const objOfHtmlData = await getSeparateDataFromFiles(htmlFiles);
 
  // template
  const objTemplate = await getSeparateDataFromFiles([path.join(__dirname, templateName)]);
  const templateInArr = objTemplate[getOnlyName(templateName)].split('\n');



  const bundledTemplateInArr = templateInArr.map(line=> {

    if (line.substring(line.length-2) === '}}') {
      let component = line.trim();
      component = component.substring(2, component.length-2);
      return objOfHtmlData[component];
    }

    return line;  
  });

  writeArrOfDadaInFile(distDir, htmlBundleName, bundledTemplateInArr);

  // const assetsFiles = await getFiles(assetsDir);
  // console.log('-->', assetObj.files);

  
};

// go
makeBundle();