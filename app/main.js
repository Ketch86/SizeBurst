const electron = require('electron')
const ipcMain = electron.ipcMain
// Module to control application life.
const app = electron.app
global.tree = { test: "test" };
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const fs = require("fs")

const Promise = require('promise');

const util = require('util');

const path = require('path')
const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let calcWindow

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({ width: 800, height: 600, autoHideMenuBar: true })
  calcWindow = new BrowserWindow({ width: 800, height: 600, autoHideMenuBar: true })

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  calcWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'calc/calc.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  mainWindow.webContents.openDevTools()
  calcWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
    calcWindow = null;
  })
}

ipcMain.on('walk', (event, arg) => {
  calcWindow.webContents.send("path", arg);
});

ipcMain.on('data', (event, arg) => {
  mainWindow.webContents.send('data', arg);
});

function calcDirSize(path) {
  var size = 0;

  var promise = new Promise(function (resolve, reject) {
    fs.readdir(path, (err, files) => {
      var returnedCount = 0;
      files.forEach(f => {
        fs.stat(path + "/" + f, (err, stats) => {
          size += stats.size
          if (++returnedCount == files.length) {
            resolve(size);
          }
        })
      })
    })
  });
  return promise;
}

var elementCount = 0;
function calcDirSize2(path) {
  var size = 0;
  //mainWindow.webContents.send('elementCount', elementCount);
  fs.readdir(path, (err, files) => {
    files.forEach(f => {
      var fullPath = path + "\\" + f;
      fs.stat(fullPath, (err, stats) => {
        elementCount++;
        size += stats.size;
        if (stats.isDirectory()) {
          calcDirSize2(fullPath);
        }
      })
    })
  });

  return;
}


ipcMain.on('synchronous-message', (event, arg) => {
  console.log(arg)  // prints "ping"
  event.returnValue = 'poioiong'
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
