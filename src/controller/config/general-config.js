document.addEventListener("DOMContentLoaded", async ()=> {
    //----------------------------------DOM------------------------------------------//
    const sidebarGeneralEl = document.getElementById("sidebar-general");
    const sidebarModeEl = document.getElementById("sidebar-mode");
    const sidebarSerialEl = document.getElementById("sidebar-serial");
    const sidebarNetworkEl = document.getElementById("sidebar-network");
    const configContentDiv = document.querySelector('.config-content');
    const h2Element = configContentDiv.querySelector('h2');
    const deviceIdlabel = document.getElementById("device-id");
    const namelabel = document.getElementById("name");
    const statuslabel = document.getElementById("status");
    const facReslabel = document.getElementById("fac-res");
    const cancelBtn = document.getElementById("cancel-button");
    const nextBtn = document.getElementById("next-button");
    const factoryResetBtn = document.getElementById("factory-reset-button");
    const deviceIdEl = document.getElementById("input1");
    const nameEl = document.getElementById("input2");

    //----------------------------Variables----------------------------------//
    let deviceMacAddress, deviceName;
    let selectedLanguage = defaultLanguage;

    //----------------------------Settings------------------------------------//
    const storedSettings = JSON.parse(localStorage.getItem("settings"));
    if(storedSettings)
        selectedLanguage = storedSettings.language;

    setLanguage(selectedLanguage); 

    //set language on setting change
    window.mainAPI.getSignal(selectedLanguage => {
        setLanguage(selectedLanguage);
    })

    //---------------------------------Logic------------------------------------//
    //get and apply stored device config if any
    let deviceId = await getConfigDeviceId();
    let storedDevices = JSON.parse(localStorage.getItem('devices')) || [];
    const existingDeviceIndex = storedDevices.findIndex(device => device.id === deviceId);
    if (existingDeviceIndex !== -1) {
        deviceMacAddress = storedDevices[existingDeviceIndex].macAddress;
        deviceName = storedDevices[existingDeviceIndex].name;
        nameEl.value = deviceName;
    } 

    deviceIdEl.value = deviceId;

    nextBtn.addEventListener("click", () => {
        saveDeviceConfig();
        window.location.href = "mode-config.html"
    });

    cancelBtn.addEventListener("click", () => {
        window.mainAPI.closeWindow(1); //config window index = 1
    })
  
    factoryResetBtn.addEventListener("click", () => {
        //open factory reset dialog window
        window.mainAPI.openWindow(2); //factory reset window index = 2
    })

    //------------------------------Functions------------------------------//
    function saveDeviceConfig(){
        console.log("saveDeviceConfig")

        let deviceName = document.getElementById("input2").value;
        const existingDeviceIndex = storedDevices.findIndex(device => device.id === deviceId);

        if (existingDeviceIndex !== -1) {
            storedDevices[existingDeviceIndex].name = deviceName;
            console.log("storedDevices", storedDevices);
        } else {
            console.log("saveDeviceConfig new")
            storedDevices.push({ 
                id: deviceId, 
                manufId: defaultDeviceConfig.manufId, 
                name: deviceName || defaultDeviceConfig.name, 
                mode: defaultDeviceConfig.mode,
                baudrate: "9600",
                parity: "None",
                stopBits: "1",
                dataSize: "8",
                macAddress: deviceMacAddress || defaultDeviceConfig.macAddress,
                slaveID: defaultDeviceConfig.slaveID,
                networkIP: defaultDeviceConfig.networkIP,
                networkMask: defaultDeviceConfig.networkMask,
                networkGateway: defaultDeviceConfig.networkGateway,
                remoteIP: defaultDeviceConfig.remoteIP,
            });       
        }
        localStorage.setItem('devices', JSON.stringify(storedDevices));
    }

    function setLanguage(selectedLanguage){

        sidebarGeneralEl.textContent = languages[selectedLanguage].config.general;
        sidebarModeEl.textContent    = languages[selectedLanguage].config.mode;
        sidebarSerialEl.textContent  = languages[selectedLanguage].config.serial;
        sidebarNetworkEl.textContent = languages[selectedLanguage].config.network;
        h2Element.textContent        = languages[selectedLanguage].config.generalConfig
        deviceIdlabel.textContent    = languages[selectedLanguage].config.deviceID;
        namelabel.textContent        = languages[selectedLanguage].config.name;
        statuslabel.textContent      = languages[selectedLanguage].config.status;
        facReslabel.textContent      = languages[selectedLanguage].factoryReset.factoryReset;
        nextBtn.textContent          = languages[selectedLanguage].button.next;
        cancelBtn.textContent        = languages[selectedLanguage].button.cancel;
    }
    
});
