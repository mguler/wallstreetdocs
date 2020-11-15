# Wallstreetdocs Assesment
This project contains codes of wallstreetdocs assesment application

##Getting Started
This document shows you how to get install and run the application on a local computer

### Prerequisites
Following cli tools and applications must be installed on the system
* newer version of nodejs
* npm
* grunt 
* git cli (optional)

###Download And Install
Open the console screen on your OS (maybe you will need administrator privileges) and go to your local directory then create a folder named wallstreetdocs and go inside it download the archived source code of application from git repository (https://github.com/mguler/wallstreetdocs) and decompress it into the folder you just created or use git cli for download the code here is sample;

```
$ mkdir test
$ cd test
$ git clone https://github.com/mguler/wallstreetdocs
```
After the download and decompress (or clone from github) the source code type the following   
```
$ cd wallstreetdocs/wallstreetdocs 
```
Now you must be in the folder where package.json is located. Just type the following on the console screen for restore missing npm modules.   
```
$ npm install 
```
If the process finishes with no errors application will be installed on your local system successfully

### Running the application
On the console screen you should be in the folder where package.json is located then just type the following  

```
$ npm start 
```
If you see the startup message this means application has started successfully. now open a browser and go to the page http://localhost:9999 you will see the main page 

##Technology & Dependecies

* [Nodejs] - Main runtime environment
* [Express] - Web application framework
* [Jquey] - Client side dom manipulation library
* [Linqer] - Linq(.Net) style query library 
* [Chart.js] - Javascript chart library
* [Sweetalert] - Popup library
* [Grunt] - Script runner library
* [Grunt - Browserify] - Grunt plugin for merging client side scripts 

##Author 
Murat Güler

##License 
This project is licensed under the GNU License - see the  file for details
