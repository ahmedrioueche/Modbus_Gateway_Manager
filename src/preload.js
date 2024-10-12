const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('mainAPI', {

    openWindow: (windowIndex, param = null) => 
        ipcRenderer.send('openWindow', windowIndex, param),

    closeWindow: (windowIndex, param = null) => 
        ipcRenderer.send('closeWindow', windowIndex, param),

    resizeWindow: (windowIndex, width, height) =>
        ipcRenderer.send("resizeWindow", windowIndex, width, height),

    getUserData: () => 
        ipcRenderer.invoke("getUserData"),

    saveUserData: (userData) => 
        ipcRenderer.send("saveUserData", userData),

    validateUserData: (username, password) => 
        ipcRenderer.invoke("validateUserData", username, password),

    sendSignalToWindow: (windowIndex = null, signal) => 
        ipcRenderer.send("sendSignalToWindow", windowIndex, signal),

    getSignal: (callback) =>
        ipcRenderer.on("getSignal", (event, signal) => callback(signal)),
    
    getDevStatus: () => 
        ipcRenderer.invoke("getDevStatus"),
      
});

contextBridge.exposeInMainWorld('serialAPI', {
    sendConfigData: (configBuffer) =>
        ipcRenderer.send('sendConfigData', configBuffer),

    usbDeviceAttached: (callback) =>
        ipcRenderer.on('usbDeviceAttached', (event, device) => callback(device)),

    usbDeviceDetached: (callback) =>
        ipcRenderer.on('usbDeviceDetached', (event, device) => callback(device)),

    serialPortsUpdate: (callback) =>
       ipcRenderer.on('serialPortsUpdate', (event, addedDevices, removedDevices) => callback(addedDevices, removedDevices)),
 
    getConnectedDevices: () => 
        ipcRenderer.invoke('getConnectedDevices'),

    saveOpenedDevice: (selectedDevice) => 
        ipcRenderer.send("saveOpenedDevice", (event, selectedDevice)),

    initializeSerialPort: (selectedDevice) => 
        ipcRenderer.send("initializeSerialPort", (event, selectedDevice)),
        
    getOpenedDevice : () => 
        ipcRenderer.invoke("getOpenDevice"),

    savePacketData: (packet) => 
        ipcRenderer.send("savePacketData", (event, packet)),

    getOpenedPacketData: () => 
        ipcRenderer.invoke("getOpenedPacketData"),

    sendStartSignal: () => 
        ipcRenderer.send("sendStartSignal"),
    
    sendStopSignal: () => 
        ipcRenderer.send("sendStopSignal"),

    getPacketData: (callback) =>
        ipcRenderer.on("getPacketData", (event, packet) => callback(packet)),
  
    sendPackets: (packets) => 
        ipcRenderer.send("sendPacketsToSave", packets),
    
    sendAdminConfigData: (configData) => 
        ipcRenderer.send('sendAdminConfigData', configData),

    sendFactoryResetSignal: () => 
        ipcRenderer.send('sendFactoryResetSignal'),
});

contextBridge.exposeInMainWorld('settingsAPI', {
  requestVariable: () => {
    return ipcRenderer.invoke('requestVariable');
  },
})