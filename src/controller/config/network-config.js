document.addEventListener('DOMContentLoaded', async () => {

    //----------------------------DOM------------------------------------//
    const sidebarGeneralEl = document.getElementById("sidebar-general");
    const sidebarModeEl = document.getElementById("sidebar-mode");
    const sidebarSerialEl = document.getElementById("sidebar-serial");
    const sidebarNetworkEl = document.getElementById("sidebar-network");
    const configContentDiv = document.querySelector('.config-content');
    const h2Element = configContentDiv.querySelector('h2');
    const networkIpEl = document.getElementById("input1");
    const networkMaskEl = document.getElementById("input2");
    const networkGatewayEl = document.getElementById("input3");
    const saveBtn = document.getElementById("save-button");
    const prevBtn = document.getElementById("previous-button");
    //-----------------------------Variables-----------------------------------//
    let configDevice;
    let selectedMode, networkIP, networkMask, networkGateway, remoteIP;
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
        h2Element.textContent        = languages[selectedLanguage].config.networkConfig;
        saveBtn.textContent          = languages[selectedLanguage].button.save;
        prevBtn.textContent          = languages[selectedLanguage].button.previous;
    }

    //-----------------------------Logic---------------------------------------//
    document.querySelectorAll('.input-item').forEach(inputItem => {
        const errorDiv = inputItem.querySelector(".error");
        if(errorDiv)
          errorDiv.remove();
    })

    let storedDevices = JSON.parse(localStorage.getItem('devices')) || [];
    let deviceId = await getConfigDeviceId();
    const deviceIndex = storedDevices.findIndex(device => device.id === deviceId);
    if (deviceIndex !== -1) {
        selectedMode = storedDevices[deviceIndex].mode;
        getNetworkData();
    } 

    if (selectedMode == 1) {
        const inputItem = document.getElementById("remote-ip-place-holder");        
        const inputlabel = document.createElement("label");
        inputlabel.textContent = languages[selectedLanguage].config.remoteIP
        inputlabel.classList.add("input-label");
        inputlabel.setAttribute("for", "input4"); 

        const inputBox = document.createElement("input");
        inputBox.classList.add("input-field");
        inputBox.setAttribute("id", "input4");
        inputBox.setAttribute("placeholder", "example:192.168.1.5");
        inputBox.value = remoteIP;
        inputItem.appendChild(inputlabel);
        inputItem.appendChild(inputBox);
      
    }

    networkIpEl.value = networkIP;
    networkMaskEl.value = networkMask;
    networkGatewayEl.value = networkGateway;

    saveBtn.addEventListener("click", () => {

        if(checkNetworkData()){
            saveNetworkData();
            sendConfigData();
            window.mainAPI.closeWindow(1); //config window index = 1
        }
    });

    prevBtn.addEventListener('click', () => {
        window.location.href = "serial-config.html"
    })

    //-----------------------Functions---------------------------------//
    async function sendConfigData(){
        
        let configBuffer = []
        configBuffer.push(storedDevices[deviceIndex].id);
        configBuffer.push(storedDevices[deviceIndex].mode);
        configBuffer.push(storedDevices[deviceIndex].baudrate);
        configBuffer.push(storedDevices[deviceIndex].parity);
        configBuffer.push(storedDevices[deviceIndex].stopBits);
        configBuffer.push(storedDevices[deviceIndex].dataSize);
        configBuffer.push(storedDevices[deviceIndex].slaveID);
        configBuffer.push(storedDevices[deviceIndex].networkIP);
        configBuffer.push(storedDevices[deviceIndex].networkMask);
        configBuffer.push(storedDevices[deviceIndex].networkGateway);
        if (selectedMode == "RTU Server Mode") 
          configBuffer.push(storedDevices[deviceIndex].remoteIP);

        window.serialAPI.sendConfigData(configBuffer);
    }

    function saveNetworkData(){
        storedDevices[deviceIndex].networkIP = document.getElementById("input1").value;
        storedDevices[deviceIndex].networkMask =  document.getElementById("input2").value;
        storedDevices[deviceIndex].networkGateway =  document.getElementById("input3").value;
        if (selectedMode == 1) 
            storedDevices[deviceIndex].remoteIP =  document.getElementById("input4").value;

        localStorage.setItem('devices', JSON.stringify(storedDevices));
    }

    function getNetworkData(){
        networkIP = storedDevices[deviceIndex].networkIP;
        networkMask = storedDevices[deviceIndex].networkMask;
        networkGateway = storedDevices[deviceIndex].networkGateway;
        remoteIP = storedDevices[deviceIndex].remoteIP;
    }

    function checkNetworkData() {
        let dataValid = true;
        let value;
        document.querySelectorAll('.input-item').forEach(inputItem => {
            const inputField = inputItem.querySelector('.input-field');
            if(inputField){
                value = inputField.value;
                inputField.classList.remove("input-field-err");
            }

            const errorDiv = inputItem.querySelector(".error");
            if (errorDiv) {
                errorDiv.remove();
            }

            if (!value && inputField) {
                const newErrorDiv = document.createElement("div");
                newErrorDiv.classList.add("error");
                newErrorDiv.textContent = languages[selectedLanguage].error.voidErr;
                inputItem.appendChild(newErrorDiv);
                newErrorDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
                inputField.classList.add("input-field-err");
                dataValid = false;
            } else if (!isValidInput(value) && inputField) {
                const newErrorDiv = document.createElement("div");
                newErrorDiv.classList.add("error");
                newErrorDiv.textContent = languages[selectedLanguage].error.checkData;
                inputItem.appendChild(newErrorDiv);
                newErrorDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
                inputField.classList.add("input-field-err");
                dataValid = false;
            }
        });

        return dataValid;
    }

    async function getConfigDeviceId(){
        configDevice = await window.serialAPI.getOpenedDevice();
        const deviceId = `${configDevice.vendorId}-${configDevice.productId}`;
        return deviceId;
    }

    function isValidInput(input){
        if(input === undefined || input === '[object Object]')
            return false;

        const IpSegments = input.split('.');
        if (IpSegments.length !== 4) {
            return false;
        }

        for (const segment of IpSegments) {
            const numSegment = Number(segment);
            if (segment === "" || isNaN(numSegment) || !Number.isInteger(numSegment) || numSegment < 0 || numSegment > 255) {
                return false;
            }
        }
        return true;
    }

});

