document.addEventListener("DOMContentLoaded", async ()=> {

    //----------------------------------DOM------------------------------------------//
    const configContentDiv = document.querySelector('.dialog-container');
    const h2Element = configContentDiv.querySelector('h3');
    const factoryResetBtn = document.getElementById("factory-reset-button");
    const cancelBtn =  document.getElementById("cancel-button");
    //---------------------------------Variables------------------------------------//
    let selectedLanguage = defaultLanguage;

    //----------------------------------Settings------------------------------------//
    const dev = await window.mainAPI.getDevStatus();
 
    const storedSettings = JSON.parse(localStorage.getItem("settings"));
    if(storedSettings)
        selectedLanguage = storedSettings.language;

    h2Element.textContent = languages[selectedLanguage].factoryReset.mainText;
    factoryResetBtn.textContent = languages[selectedLanguage].button.confirm;
    cancelBtn.textContent = languages[selectedLanguage].button.cancel;

    //------------------------------Logic--------------------------------------------//
    let deviceId = await getConfigDeviceId();
    let storedDevices = JSON.parse(localStorage.getItem('devices')) || [];

    factoryResetBtn.addEventListener("click", () => {
        //send factory reset signal via usb
        window.serialAPI.sendFactoryResetSignal();
        //reassign config data via localStorage
        resetStoredConfigData();
        console.log("storedDevices", storedDevices);
        //quit config window    
        if(!dev)  
            window.mainAPI.closeWindow(2);
            window.mainAPI.closeWindow(1);
    })


    function resetStoredConfigData(){
        const deviceIndex = storedDevices.findIndex(device => device.id === deviceId);
        const device = storedDevices[deviceIndex];
        for (const key in device) {
            if (device.hasOwnProperty(key) && key !== "id") {
                device[key] = defaultDeviceConfig[key];
            }
        }
        storedDevices[deviceIndex] = device;
        localStorage.setItem('devices', JSON.stringify(storedDevices));
    }

    async function getConfigDeviceId(){
        const configDevice = await window.serialAPI.getOpenedDevice();
        const deviceId = `${configDevice.vendorId}-${configDevice.productId}`;
        return deviceId;
    }

    cancelBtn.addEventListener("click", () => {
        window.mainAPI.closeWindow(2); //factory reset window index = 2
    })
})
 