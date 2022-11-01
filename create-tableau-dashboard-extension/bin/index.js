#! /usr/bin/env node

//  Dependencies
const chalk = require('chalk');
const {execSync} = require('child_process');
const fs = require('fs')
const setPath = require('object-path-set');
const xml2js = require('xml2js');
const axios = require('axios').default;

/********************************************************************/
/*  Step 1: Make sure we have a name for our Dashboard Extension    */
/********************************************************************/

//  Remove the first 2 arguments (since they will always be 'npx' and 'create-tableau-dashboard-extension')
const args = process.argv.slice(2);

//  Function to gracefully-ish quit
const showError = (msg) => {
    //  Print the error msg in red
    console.error(chalk.red(msg));
    //  Quit the process
    process.exit(1);
}

//  Verify additional arguments were passed
if (args.length < 1) showError('Please enter the name of your dashboard extension');

//  Get the name of the new dashboard extension
const extName = args[0];
console.log(chalk.blue(`1. Creating new dashboard extension named ${extName}`));

/********************************************************************/
/*  Step 2: Clone from github template                              */
/********************************************************************/

//  Define a function to download an archive from github
//  Stolen from: https://bonsaiilabs.com/create-npx-starter-command/
const runCommand = command => {
    try {
        execSync(`${command}`, {stdio: 'inherit'});
    } catch (e) {
        console.error(`Failed to execute ${command}`,e);
        return false;
    }
    return true;
}

// Command to clone from this template in Github
const githubRepoName = 'create-tableau-dashboard-extension';
const gitCheckoutCOmmand = `git clone --depth 1 https://github.com/takashibinns/${githubRepoName} ${githubRepoName}`;
console.log(chalk.blue(`2. Cloning the repository with name ${githubRepoName}/${extName}`));
const checkedOut = runCommand(gitCheckoutCOmmand);
if (!checkedOut) showError('Error while running `git clone`, make sure you have git installed.');
fs.renameSync(`${githubRepoName}/${githubRepoName}`, `${githubRepoName}/${extName}`)

/********************************************************************/
/*  Step 3: Create application-specific files                       */
/********************************************************************/

//  Function to update JSON files
const updateFile = (updates, path, filetype) => {

    //  Read the file at a given path
    let rawdata = fs.readFileSync(path);

    if (filetype === 'json') {

        //  Parse the file contents as JSON
        let newFileContents = JSON.parse(rawdata);

        //  Overwrite any keys in the JSON
        for (let key in updates) {
            setPath(newFileContents, key, updates[key])
        }

        //  Overwrite the file with updated JSON
        fs.writeFileSync(path, JSON.stringify(newFileContents,null,2));

    } else if (filetype === 'xml') {

        //  Conver from XML to JSON
        xml2js.parseString(rawdata, function (err, newFileContents) {
        
            //  Overwrite any keys in the JSON
            for (let key in updates) {
                setPath(newFileContents, key, updates[key])
            }

            //  Convert from JSON to XML
            let builder = new xml2js.Builder();
            let xml = builder.buildObject(newFileContents);

            //  Overwrite the file with updated JSON
            fs.writeFileSync(path, xml);
        });
    }
    return true
}

//  3.1 package.json
console.log(chalk.blue('3a. Creating updated package.json'));
const update1 = updateFile( {
        'name': extName
    }, `${githubRepoName}/${extName}/package.json`
    , 'json' 
);
if (!update1) showError('Error while updating package.json');

//  3.2 public/manifest.json
console.log(chalk.blue('3b. Creating updated public/manifest.json'));
const update2 = updateFile( {
        'short_name': extName, 
        'name': `Tableau Dashboard Extension: ${extName}` 
    }, `${githubRepoName}/${extName}/public/manifest.json`
    , 'json' 
);
if (!update2) showError('Error while updating public/manifest.json');

//  3.3 ${extName}.trex
console.log(chalk.blue('3c. Creating updated trex file'));
const update3 = updateFile( {
        'manifest.dashboard-extension.0.$.id': `com.tableau.extensions.${extName}`
    }, `${githubRepoName}/myDashExt.trex`
    , 'xml'
)
if (!update3) showError('Error while updating trex file');
fs.renameSync(`${githubRepoName}/myDashExt.trex`, `${githubRepoName}/${extName}.trex`);

/********************************************************************/
/*  Step 4: Download tableau dashboard extension api from CDN       */
/********************************************************************/

//  URI for the Tableau Dashboard Extension API library
const tableauDashboardExtensionLib = 'https://cdn.jsdelivr.net/gh/tableau/extensions-api/lib/tableau.extensions.1.latest.min.js';

//  Function to download the javascript lib, and save to disk
//  Stolen from here: https://stackoverflow.com/questions/55374755/node-js-axios-download-file-stream-and-writefile
const getTableauDashboardExtensionAPI = async (filepath) => {

    const writer = createWriteStream(filepath);

    //  Make the API call
    return axios({
        url: tableauDashboardExtensionLib,
        method: 'GET',
        responseType: 'stream'
    }).then( response => {
        return new Promise((resolve,reject) => {
            response.data.pipe(writer);
            let error = null;
            writer.on('error', err => {
                error = err;
                writer.close();
                reject(err);
            });
            writer.on('close', () => {
                if (!error) {
                    resolve(true);
                }
            });
        });
    });
}

//  Execute the API call to download from Tableau CDN
console.log(chalk.blue(`4. Downloading Tableau Dashboard Extension API from CDN`))
const downloadApi = getTableauDashboardExtensionAPI(`${githubRepoName}/public/tableau.extensions.1.latest.min.js`);
if (!downloadApi) showError('Error while downloading the Tableau API');

/********************************************************************/
/*  Step 5: run npm init, & let the user know how to get started    */
/********************************************************************/

//  Run NPM install to install all dependencies
const installDepsCommand = `cd ${githubRepoName}/${extName} && npm install`;
console.log(chalk.blue('5. Building the dashboard extension app'));
const installDeps = runCommand(installDepsCommand);
if (!installDeps) showError('Error while running `npm build`');

//  Processs complete!
console.log(chalk.green("Dashboard Extension is ready, run the following commands to start"));
console.log(chalk.inverse(`cd ${githubRepoName}/${extName} && npm start`));
process.exit(0); //no errors occurred