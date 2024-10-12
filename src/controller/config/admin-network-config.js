document.addEventListener('DOMContentLoaded', async () => {
    //---------------------------------DOM----------------------------------------------//
    const networkIpEl = document.getElementById("input1");
    const networkMaskEl = document.getElementById("input2");
    const networkGatewayEl = document.getElementById("input3");
    const saveBtn = document.getElementById("save-button");
    const prevBtn = document.getElementById("previous-button");

    //--------------------------------Variables-----------------------------------------//
    let selectedLanguage = defaultLanguage;

    //-------------------------------Settings--------------------------------------------//
    const storedSettings = JSON.parse(localStorage.getItem("settings"));
    if(storedSettings)
        selectedLanguage = storedSettings.language;

    //---------------------------------Logic---------------------------------------------//
    //get opened device id
    const deviceId = await getConfigDeviceId();
    //get stored devices
    let storedDevices = JSON.parse(localStorage.getItem('devices')) || [];
    const existingDeviceIndex = storedDevices.findIndex(device => device.id === deviceId);

    if (existingDeviceIndex !== -1) {
        networkIpEl.value = storedDevices[existingDeviceIndex].networkIP;
        networkMaskEl.value = storedDevices[existingDeviceIndex].networkMask; 
        networkGatewayEl.value = storedDevices[existingDeviceIndex].networkGateway; 
    } 

    saveBtn.addEventListener("click", () => {
        const configData = {
            networkIP: networkIpEl.value,
            networkMask: networkMaskEl.value,
            networkGateway: networkGatewayEl.value,
        }

        let result = checkUserData(configData);
        console.log("result", result)
        if(result === configStatus.VALID){
            saveAdminData(configData); //save admin config data
            sendAdminData(configData); //send data via usb
            window.mainAPI.closeWindow(1); //config window index = 1
        }
    });

    prevBtn.addEventListener("click", () => {
        window.location.href = "admin-config.html"
    })

    //--------------------------------Functions------------------------------------------//
    function checkUserData(){
        let result = configStatus.VALID;
        document.querySelectorAll('.input-item').forEach(inputItem => {
            const value = inputItem.querySelector('.input-field').value;            
            const errorDiv = inputItem.querySelector(".error");
            if (errorDiv) {
                errorDiv.remove();
            }

            if (!value) {
                const newErrorDiv = document.createElement("div");
                newErrorDiv.classList.add("error");
                newErrorDiv.textContent = "Please fill in this field";
                inputItem.appendChild(newErrorDiv);
                newErrorDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
                result = configStatus.VOID;
                return;                
            } else if (!isValidInput(value)) {
                const newErrorDiv = document.createElement("div");
                newErrorDiv.classList.add("error");
                newErrorDiv.textContent = "Please check the integrity of the data";
                inputItem.appendChild(newErrorDiv);
                result = configStatus.INVALID
                return;                
            }
        });

        return result;
    }

    function sendAdminData(configData){
        const index = storedDevices.findIndex(device => device.id === deviceId)
        const device = storedDevices[index];
        configData.macAddress = device.macAddress;
        console.log("configData", configData);
        window.serialAPI.sendAdminConfigData(configData);
        // window.serialAPI.sendDeviceName(deviceName);
    }

    function saveAdminData(networkData){
        
        if (existingDeviceIndex !== -1) {
            storedDevices[existingDeviceIndex].networkIP = networkData.networkIP;
            storedDevices[existingDeviceIndex].networkMask = networkData.networkMask;
            storedDevices[existingDeviceIndex].networkGateway = networkData.networkGateway;
        }
          
        localStorage.setItem('devices', JSON.stringify(storedDevices));
    }
    
    async function getConfigDeviceId(){
        const configDevice = await window.serialAPI.getOpenedDevice();
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
})