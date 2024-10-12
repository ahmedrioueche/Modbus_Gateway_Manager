document.addEventListener('DOMContentLoaded', async () => {
    
    //----------------------------------DOM------------------------------------------//
    const sidebarGeneralEl = document.getElementById("sidebar-general");
    const sidebarModeEl = document.getElementById("sidebar-mode");
    const sidebarSerialEl = document.getElementById("sidebar-serial");
    const sidebarNetworkEl = document.getElementById("sidebar-network");
    const modeElements = document.getElementsByName("mode");
    const labels = document.querySelectorAll('.checkbox-list .radio-label');
    const nextBtn =  document.getElementById("next-button");
    const prevBtn =  document.getElementById("previous-button");
    const configContentDiv = document.querySelector('.config-content');
    const h2Element = configContentDiv.querySelector('h2');
    //---------------------------------Variables------------------------------------//
    let selectedLanguage = defaultLanguage;

    //----------------------------Settings------------------------------------//
    const dev = await window.mainAPI.getDevStatus();

    const storedSettings = JSON.parse(localStorage.getItem("settings"));
    if(storedSettings)
        selectedLanguage = storedSettings.language;

    setLanguage(selectedLanguage); 

    window.mainAPI.getSignal(selectedLanguage => {
        setLanguage(selectedLanguage);
    })

    function setLanguage(selectedLanguage){
     
        sidebarGeneralEl.textContent = languages[selectedLanguage].config.general;
        sidebarModeEl.textContent    = languages[selectedLanguage].config.mode;
        sidebarSerialEl.textContent  = languages[selectedLanguage].config.serial;
        sidebarNetworkEl.textContent = languages[selectedLanguage].config.network;
        h2Element.textContent        = languages[selectedLanguage].config.modeConfig;
        labels[0].textContent        = languages[selectedLanguage].config.rtuServerMode;
        labels[1].textContent        = languages[selectedLanguage].config.tcpServerMode;
        nextBtn.textContent          = languages[selectedLanguage].button.next;
        prevBtn.textContent          = languages[selectedLanguage].button.previous;
         
    }
    //-------------------------------Logic-----------------------------------------//
    let storedDevices = JSON.parse(localStorage.getItem('devices')) || [];
    let deviceId = await getConfigDeviceId();
    const existingDeviceIndex = storedDevices.findIndex(device => device.id === deviceId);
    if (existingDeviceIndex !== -1) {
        getSelectedMode(storedDevices[existingDeviceIndex].mode);
    } 

    nextBtn.addEventListener("click", () => {
        saveSelectedMode();
        window.location.href = "serial-config.html";
    })

    prevBtn.addEventListener("click", () => {
        saveSelectedMode();
        window.location.href = "general-config.html";
    })

    //------------------------------Functions--------------------------------------//
    function getSelectedMode(selectedModeIndex) {
        modeElements[selectedModeIndex-1].checked = true;
    }

    function saveSelectedMode() {
        let selectedMode; let selectedModeLabel;
        for (let i = 0; i < modeElements.length; i++) {
            if (modeElements[i].checked) {
                selectedMode = modeElements[i].value;
                selectedModeLabel = document.querySelector(`[for=${modeElements[i].id}]`);
                if(dev)
                    console.log("checked:", selectedModeLabel.textContent);
                storedDevices[existingDeviceIndex].mode = i + 1; //mode index: rtu => 1, tcp => 2
            }
        }
        localStorage.setItem('devices', JSON.stringify(storedDevices));
    }

    async function getConfigDeviceId(){
        const configDevice = await window.serialAPI.getOpenedDevice();
        const deviceId = `${configDevice.vendorId}-${configDevice.productId}`;
        return deviceId;
    }    
});
