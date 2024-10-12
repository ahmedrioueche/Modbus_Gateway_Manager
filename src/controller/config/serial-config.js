document.addEventListener('DOMContentLoaded', async () => {
    
    //----------------------------DOM------------------------------------//
    const selectBaud = document.getElementById("select-baud")
    const selectParity = document.getElementById("select-parity")
    const selectStopBits = document.getElementById("select-stopbits")
    const selectDataSize = document.getElementById("select-datasize")
    const slaveIdInputItem = document.querySelector('.slave-item');
    const slaveIdInputLabel = document.getElementById('slave-id-span')
    const slaveIdInputField = document.getElementById("slave-id");
    const sidebarGeneralEl = document.getElementById("sidebar-general");
    const sidebarModeEl = document.getElementById("sidebar-mode");
    const sidebarSerialEl = document.getElementById("sidebar-serial");
    const sidebarNetworkEl = document.getElementById("sidebar-network");
    const dataSizeLabel = document.getElementById("data-size-label");
    const stopBitsLabel = document.getElementById("stop-bits-label");
    const configContentDiv = document.querySelector('.config-content');
    const h2Element = configContentDiv.querySelector('h2');
    const nextBtn =  document.getElementById("next-button");
    const prevBtn =  document.getElementById("previous-button");
    
    //-----------------------------Variables-----------------------------------//

    let selectedLanguage = defaultLanguage;

    //----------------------------Settings------------------------------------//
    const storedSettings = JSON.parse(localStorage.getItem("settings"));
    if(storedSettings)
        selectedLanguage = storedSettings.language;

    setLanguage(selectedLanguage); 
    
    window.mainAPI.getSignal(recSelectedLanguage => {
        setLanguage(recSelectedLanguage);
        selectedLanguage = recSelectedLanguage;
    })

    function setLanguage(selectedLanguage){

        sidebarGeneralEl.textContent = languages[selectedLanguage].config.general;
        sidebarModeEl.textContent    = languages[selectedLanguage].config.mode;
        sidebarSerialEl.textContent  = languages[selectedLanguage].config.serial;
        sidebarNetworkEl.textContent = languages[selectedLanguage].config.network;
        h2Element.textContent        = languages[selectedLanguage].config.serialConfig;
        dataSizeLabel.textContent    = languages[selectedLanguage].config.dataSize;
        stopBitsLabel.textContent    = languages[selectedLanguage].config.stopBits;
        nextBtn.textContent          = languages[selectedLanguage].button.next;
        prevBtn.textContent          = languages[selectedLanguage].button.previous;
        
    }

    //-----------------------------Logic---------------------------------------//
    let storedDevices = JSON.parse(localStorage.getItem('devices')) || [];
    let deviceId = await getConfigDeviceId();

    let selectedMode, baudrate, parity, stopBit, dataSize, slaveId;
    const deviceIndex = storedDevices.findIndex(device => device.id === deviceId);
        console.log("storedDevices", storedDevices)

    if (deviceIndex !== -1) {
        selectedMode = storedDevices[deviceIndex].mode;
        getSerialData();
    } 
    const slaveIdLabelText = selectedMode === 1 
    ? languages[selectedLanguage].config.slaveID 
    : languages[selectedLanguage].config.remoteSlaveId;

    selectBaud.value = baudrate;
    selectParity.value = parity;
    selectStopBits.value = stopBit;
    selectDataSize.value = dataSize;
    slaveIdInputLabel.textContent = slaveIdLabelText;

    if(isValidInput(slaveId))
        slaveIdInputField.value = slaveId;

    nextBtn.addEventListener('click', () => {
        if(checkData(slaveIdInputField.value)){
            saveSerialData();
            window.location.href = "network-config.html"
        }  
    })

    prevBtn.addEventListener('click', () => {
        saveSerialData();
        window.location.href = "mode-config.html"
    })

    //-----------------------------Functions------------------------------------//
    function checkData(data){
        let dataValid = true;
        const inputField = document.querySelector(".input-field");
        const errorDiv = slaveIdInputItem.querySelector(".error");
        if (errorDiv) {
            errorDiv.remove();  
        }
        if (!data) {
            const newErrorDiv = document.createElement("div");
            newErrorDiv.classList.add("error");
            newErrorDiv.textContent = languages[selectedLanguage].error.voidErr;
            slaveIdInputItem.appendChild(newErrorDiv);
            newErrorDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
            inputField.classList.add("input-field-err");
            dataValid = false;
        } else if (!isValidInput(data)) {
            const newErrorDiv = document.createElement("div");
            newErrorDiv.classList.add("error");
            newErrorDiv.textContent = languages[selectedLanguage].error.checkData;
            slaveIdInputItem.appendChild(newErrorDiv);
            newErrorDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
            inputField.classList.add("input-field-err");
            dataValid = false;
        }
        return dataValid;
    }

    function getSerialData(){
        baudrate = storedDevices[deviceIndex].baudrate;
        parity = storedDevices[deviceIndex].parity;
        stopBit = storedDevices[deviceIndex].stopBits;
        dataSize = storedDevices[deviceIndex].dataSize;
        slaveId = storedDevices[deviceIndex].slaveID;
    }

    function saveSerialData(){

        storedDevices[deviceIndex].baudrate = document.getElementById("select-baud").value;
        storedDevices[deviceIndex].parity =  document.getElementById("select-parity").value;
        storedDevices[deviceIndex].stopBits =  document.getElementById("select-stopbits").value;
        storedDevices[deviceIndex].dataSize =  document.getElementById("select-datasize").value;

        if(slaveIdInputField.value){
            storedDevices[deviceIndex].slaveID = slaveIdInputField.value;
        }
        localStorage.setItem('devices', JSON.stringify(storedDevices));
    }

    async function getConfigDeviceId(){
        const configDevice = await window.serialAPI.getOpenedDevice();
        const deviceId = `${configDevice.vendorId}-${configDevice.productId}`;
        return deviceId;
    }

    
    function isValidInput(input){
        if(input == "undefined" || input == '[object Object]')
            return false;

        const numValue = Number(input);
        return typeof numValue === 'number' && Number.isInteger(numValue) && numValue >= 0 && numValue <= 255;
    }
});


