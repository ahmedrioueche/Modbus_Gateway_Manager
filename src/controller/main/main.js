document.addEventListener('DOMContentLoaded', async () => {   
    //--------------------------DOM-----------------------------------//
    const refreshButton =  document.getElementById("refresh-button");
    const configureButton = document.getElementById("configure-button");
    const diagnosisButton = document.getElementById("diagnose-button");
    const helpButton =  document.getElementById("help-button");
    const settingsButton =  document.getElementById("settings-button");
    const exitButton =  document.getElementById("exit-button");
    const col1 = document.getElementById("column-1");
    const col2 = document.getElementById("column-2");
    const col3 = document.getElementById("column-3");

    //----------------------------Variables-------------------------------//
    let listedDevices = [];
    let selectedLanguage = defaultLanguage;

    //----------------------------Settings------------------------------------//
    const storedSettings = JSON.parse(localStorage.getItem("settings"));
    if(storedSettings)
        selectedLanguage = storedSettings.language;

    setLanguage(selectedLanguage); 

    window.mainAPI.getSignal(recSelectedLanguage => {
        selectedLanguage = recSelectedLanguage;
        window.location.reload();
    })

    function setLanguage(selectedLanguage){

        refreshButton.textContent   = languages[selectedLanguage].main.refresh; 
        configureButton.textContent = languages[selectedLanguage].main.configure;
        diagnosisButton.textContent = languages[selectedLanguage].main.diagnose;
        helpButton.textContent      = languages[selectedLanguage].main.help;
        settingsButton.textContent  = languages[selectedLanguage].main.settings;
        exitButton.textContent      = languages[selectedLanguage].button.exit
        col1.textContent            = languages[selectedLanguage].main.id;
        col2.textContent            = languages[selectedLanguage].main.name;
        col3.textContent            = languages[selectedLanguage].main.status       

    }

    //--------------------------------Logic----------------------------------//
    const userData = await window.mainAPI.getUserData();
    console.log("userData", userData)

    window.onload = getDisplayConnectedDevices();
    let storedDevices = JSON.parse(localStorage.getItem('devices')) || [];
    window.serialAPI.serialPortsUpdate((connectedDevices, removedDevices) => {
        removedDevices.forEach(device => {
            const deviceId = `${device.vendorId}-${device.productId}`;
            removeUsbDeviceUI(deviceId);
        });
        
        displayConnectedDevices(connectedDevices);
    })

    function displayConnectedDevices(connectedDevices){
        connectedDevices.forEach(usbDevice => {
            const deviceId = `${usbDevice.vendorId}-${usbDevice.productId}`;
            if(isDeviceMbGateway(usbDevice) && !isDeviceListed(deviceId)){   
                createUsbDeviceUI(usbDevice);
            }
        });
    }

    async function getDisplayConnectedDevices(){
        const connectedDevices = await window.serialAPI.getConnectedDevices();
        displayConnectedDevices(connectedDevices);
    }
    
    function isDeviceMbGateway(usbDevice){
        return usbDevice.productId.toString(16).toLowerCase() == GATEWAY_ID.toString(16).toLowerCase();
    }

    function isDeviceListed(deviceId){
        return document.getElementById(deviceId) !== null;
    }

    let selectedDevice;
    function createUsbDeviceUI(usbDevice){
        const deviceId = `${usbDevice.vendorId}-${usbDevice.productId}`;
        listedDevices.push(deviceId);
        const deviceDetailsContainer = document.getElementById('device-container');
        const deviceDetails = document.createElement("div");
        deviceDetails.setAttribute("class", "device-row");
        deviceDetails.setAttribute("id", deviceId);
        deviceDetailsContainer.appendChild(deviceDetails);
        const col1 = document.createElement("div");
        const col2 = document.createElement("div");
        const col3 = document.createElement("div");
        col1.setAttribute("class", "column");
        col2.setAttribute("class", "column");
        col3.setAttribute("class", "column");

        col1.setAttribute("id", "column-1");
        col2.setAttribute("id", "column-2");
        col3.setAttribute("id", "column-3");

        deviceDetails.appendChild(col1);
        deviceDetails.appendChild(col2);
        deviceDetails.appendChild(col3);

        col1.textContent = deviceId;
        col2.textContent = "Unknown";
        const existingDeviceIndex = storedDevices.findIndex(device => device.id === deviceId);
        if(storedDevices && storedDevices !== undefined && storedDevices !== "[object Object]")
        if (existingDeviceIndex !== -1) {
            if(storedDevices[existingDeviceIndex].name !== "")
                col2.textContent = storedDevices[existingDeviceIndex].name;
        } 
        
        col3.textContent = languages[selectedLanguage].main.connected;

        deviceDetails.addEventListener('click', () => {
            const devices = document.querySelectorAll(".device-row");
            devices.forEach(device => {
                if(device.id === deviceId){
                    device.classList.add('selected-row');
                    configureButton.disabled = false;  
                    diagnosisButton.disabled = false;
                    selectedDevice = usbDevice;
                }
                else {
                    device.classList.remove('selected-row');
                }
            })
        });
    }

    function removeUsbDeviceUI(deviceId){
        const deviceDetails = document.getElementById(deviceId);
        if(deviceDetails)
           deviceDetails.remove();
    }

    configureButton.addEventListener("click", () => {
        if(userData){
            switch(userData.userType){
                case "admin": 
                    window.mainAPI.openWindow(1, false); //config window index = 1 //not admin config = false
                case "manufacturer":
                    window.mainAPI.openWindow(1, true); //config window index = 1 //admin config = true
            }
        }
        else    
           window.mainAPI.openWindow(1, false); 

        window.serialAPI.saveOpenedDevice(selectedDevice); //save the device that's opened for configuration
        window.serialAPI.initializeSerialPort(selectedDevice); //initialize device's port that's opened for configuration
    });
    
    diagnosisButton.addEventListener("click", () => {
        window.mainAPI.openWindow(3); //diagnosis window index = 3
        window.serialAPI.saveOpenedDevice(selectedDevice); //save the device thats being diagnosed
        window.serialAPI.initializeSerialPort(selectedDevice); //initialize device's port that's opened for configuration
    })

    settingsButton.addEventListener("click", () => {
        window.mainAPI.openWindow(5); //settings window index = 5
    })

    refreshButton.addEventListener("click", async () => {
        const connectedDevices = await window.serialAPI.getConnectedDevices();
        displayConnectedDevices(connectedDevices); 
        window.location.reload();
    })

    helpButton.addEventListener("click", () => {
        window.mainAPI.openWindow(6);
    })

    exitButton.addEventListener("click", () => {
        window.mainAPI.closeWindow(0); //main window index = 0
    })

  
});
