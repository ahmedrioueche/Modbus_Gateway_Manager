/*----------------------Brief--------------------------
This file is the heart of the app, 
It runs the main process
it handles: creating and closing windows
            IPC with renderer processes
------------------------------------------------------*/
const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const serial = require('./model/serial.js');
const packetHandler = require('./model/packetHandler.js')
const exporter = require('./model/dataExporter.js')
const db = require('./model/db.js')
const { SerialPort } = require('serialport');
require('dotenv').config();

if (require('electron-squirrel-startup')) {
  app.quit();
}   

let dev = false;
let isPasswordSet = !dev;
let mainWidth = 800;
let mainHeight = 900;
/*---------------main window------------------*/
let mainWindow; let startPage;
const createMainWindow = () => {
  if (isPasswordSet)
    startPage = 'views/auth/login.html';
  else  
    startPage = "views/main/main.html";
    mainWindow = createWindow(mainWindow, mainWidth, mainHeight, startPage, false, false);
};

function closeMainWindow() {
   app.quit();
}

app.on('ready', createMainWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

ipcMain.on('closeMainWindow', () => {
  closeMainWindow();
});

/*--------------Window factory------------------*/
let configWindow, factoryResetWindow, diagnosticsWindow, packetWindow, settingsWindow, helpWindow, width, height;
ipcMain.on("openWindow", (event, windowIndex, param) => {
  let file;
  switch(windowIndex){
    case 1:
      if(param)
        file = 'views/config/admin-config.html';
      else
        file = 'views/config/general-config.html'

      configWindow = createWindow(configWindow, mainWidth, mainHeight, file, false, false);
      break;

    case 2:
      file = 'views/config/factory-reset.html';
      width = dev? 800 : 500;
      height = dev? 600 : 240;
      factoryResetWindow = createWindow(factoryResetWindow, width, height, file, false, false);
    break;

    case 3:
      file = 'views/diagnos/diagnostics.html';
      diagnosticsWindow = createWindow(diagnosticsWindow, mainWidth, mainHeight, file, false, false);
    break;

    case 4:
      file = 'views/diagnos/packetDetails.html';
      if(packetWindow)
        closeWindow(packetWindow);
      packetWindow = createWindow(packetWindow, 500, 650, file, false, true);
    break;

    case 5:  
      file = 'views/main/settings.html'; //450 575
      width = dev? 800 : 450;
      settingsWindow = createWindow(settingsWindow, width, 575, file, false, false);
    break;

    case 6:
      file = 'views/main/help.html';
      helpWindow = createWindow(helpWindow, 600, 575, file, false, false);
    break;
  }
})

ipcMain.on("closeWindow", (event, windowIndex, param) => {
  switch(windowIndex){
    case 0:
      app.quit();
      break;
    case 1:
      closeWindow(configWindow)
      break;

    case 2:
      closeWindow(factoryResetWindow);
    break;

    case 3:
      closeWindow(diagnosticsWindow);
      if(packetWindow)
        closeWindow(packetWindow);
    break;

    case 4:
      closeWindow(packetWindow);
    break;

    case 5:
      closeWindow(settingsWindow);
    break;

    case 6:
      closeWindow(helpWindow);
    break;
  }
})

ipcMain.on("resizeWindow", (e, windowIndex, width, height) => {

  switch(windowIndex){
    case 5:
      //both lines are needed to resize window
      settingsWindow.setMinimumSize(width, height);  
      settingsWindow.setSize(width, height);
  }
})

/*----------------------------------------------------------------------------*/
function createWindow(window, width, height, htmlFile, resizable, allowDuplicates) {
  if ((!window || window.isDestroyed()) || allowDuplicates ) {
    window = new BrowserWindow({
      width: width,
      height: height,
      resizable: resizable,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        nodeIntegration: true,
        enableRemoteModule: true,
      },
      fullscreenable: false,
      fullscreen: false,
      maximizable: false,
      minHeight: 100, 
      minWidth: 100
    });

    window.loadFile(path.join(__dirname, htmlFile));

    //open console
    if(dev)
      window.webContents.openDevTools();
    
    window.on('will-resize', () => {
      resizeHandler(window, width, height, resizable);
    });

    window.on('closed', () => {
      window = null;
    });

    if (resizable) {
      window.on('willEnterFullScreen', (event) => {
        event.preventDefault();
      });
    }

    Menu.setApplicationMenu(null);
  } else {
    window.focus();
  }

  return window;
}

function closeWindow(window) {
  try {
    if (window) {
      window.close();
      window = null;
    }
  }
  catch (error){
    console.log(error)
  }  
}

let loggedinUserId = null;
/*----------------------------User Data------------------------------*/
ipcMain.handle("getUserData", async (event) => {
  const userData = await db.getUserById(loggedinUserId);
  return userData;
});

ipcMain.on("saveUserData", async (event, updatedUserData) => {
  await db.updateUserData(updatedUserData);
})

//store the logged in user id to use it to validate later requests
ipcMain.handle("validateUserData", async (event, username, password) => {
  let result = await db.validateUserData(username, password);
  if(result === 0){
    const userData = await db.getUserByName(username);
    loggedinUserId = userData.id;
  }
  return result;
})

let userDataFileCreated = false;
app.on('ready', async () => {
  // Create the userData.json file if it hasn't been created yet
  if (!userDataFileCreated) {
      await db.createDefaultUserData(); 
      userDataFileCreated = true; 
  }
});

/*--------------------serial port-------------------------------*/
// Start monitoring for changes in COM ports
serial.checkForPortChanges();

process.on("portChange", changedPorts => {
  if(mainWindow)
    mainWindow.webContents.send("serialPortsUpdate", changedPorts.addedPorts, changedPorts.removedPorts);
})

ipcMain.handle("getConnectedDevices", async () => { 
  return await SerialPort.list(); 
});

let openedDevice;
ipcMain.on("saveOpenedDevice", (event, device) => {
  openedDevice = device;
})

//ipcMain.on("initializeSerialPort", (event, device) => {
//  console.log("device.path", device.path);
//  serial.initializeSerialPort(device.path);
//})

ipcMain.handle("getOpenDevice", () => { return openedDevice });

module.exports.openedDevice = openedDevice;

/*------------------------------------------------------------*/
ipcMain.on('sendConfigData', (event, configBuffer) => {
  packetHandler.sendConfigData(configBuffer);
});

let packetData;
ipcMain.on("savePacketData", (event, packet) => {
  packetData = packet;
})

ipcMain.handle("getOpenedPacketData", ()=> {return packetData})

ipcMain.on("sendStartSignal", (event)=> {
  serial.usbSendStartSignal();
})

ipcMain.on("sendStopSignal", (event)=> {
  serial.usbSendStopSignal();
})

process.on("data", function(packetBuffer) {
  diagnosticsWindow.webContents.send("getPacketData", packetBuffer)
})

if(diagnosticsWindow){
  diagnosticsWindow.on('closed', () => {
    //serial.usbSendStopSignal();
  });
}

ipcMain.on("sendAdminConfigData", (event) => {
  serial.usbSendAdminConfigData(openedDevice);
})

ipcMain.on("sendFactoryResetSignal", () => {
  serial.usbSendFactoryResetSignal();
})

/*------------------save window--------------------------*/
ipcMain.on("sendPacketsToSave", (event, packets)=>{
  exporter.exportData(packets);
});

//-----------------------signals--------------------------------//
ipcMain.on("sendSignalToWindow", (e, windowIndex, signal) => {

  if(!windowIndex){ //no index, send signal to all opened windows
    if(mainWindow)
      mainWindow.webContents.send("getSignal", signal);
    if(configWindow && !configWindow.isDestroyed())
      configWindow.webContents.send("getSignal", signal); 
    if(diagnosticsWindow && !diagnosticsWindow.isDestroyed())
      diagnosticsWindow.webContents.send("getSignal", signal);
  }
 
 
})

//send develpment status
ipcMain.handle("getDevStatus", () => {return dev})

