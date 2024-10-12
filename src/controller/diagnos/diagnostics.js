/*========================Brief================================
This file handles: 
    -Packet Reception
    -Packet UI display  
    -Menu controls: packet filtering, data exporting 

===============================================================*/
document.addEventListener("DOMContentLoaded", async () => {

    //----------------------------DOM------------------------------------//
    const column2 = document.getElementById("column-2");
    const column3 = document.getElementById("column-3");
    const column4 = document.getElementById("column-4");
    const column5 = document.getElementById("column-5");
    const quitBtn = document.getElementById("close-button");
    const searchIcon = document.querySelector(".search img");
    const searchBarForm = document.querySelector(".diag-filter");
    const searchBar = document.getElementById("input");
    const startButtonEl = document.getElementById("start");
    const stopButtonEl = document.getElementById("stop");

    //-----------------------------Variables-----------------------------------//
    let selectedLanguage = defaultLanguage;
    let isFilterOn = false;
    let searchQuery;
    let filteredPacketBuffer;

    //----------------------------Settings------------------------------------//
    const storedSettings = JSON.parse(localStorage.getItem("settings"));
    if(storedSettings)
        selectedLanguage = storedSettings.language;

    setLanguage(selectedLanguage); 

    window.mainAPI.getSignal(recSelectedLanguage => {
        setLanguage(recSelectedLanguage);
        selectedLanguage = recSelectedLanguage;
    })

    //-----------------------------Logic---------------------------------------//
    //get device data
    const device = await window.serialAPI.getOpenedDevice();
    let storedDevices = JSON.parse(localStorage.getItem('devices')) || [];
    storedDevices.forEach(storedDevice => {
        const deviceId = `${device.vendorId}-${device.productId}`;
        if(storedDevice.id === deviceId){
            networkIP = storedDevice.networkIP;
            remoteIP = storedDevice.remoteIP;
            slaveID = storedDevice.slaveID;
            mbMode = storedDevice.mode;
        }
    })   

    window.serialAPI.getPacketData(recPacket => {
        handleReceivedPacket(recPacket);
    })
    
    startButtonEl.addEventListener("click", startButtonClickHandler);

    searchIcon.addEventListener("click", () => {
        searchBarForm.classList.toggle("show-search");
        if(isFilterOn){
            cleanPacketsContainer();
            packetsBuffer.forEach(packet => {
                console.log("packet", packet)
                console.log("packet length", packet.length)
                if(packet.error)
                    createErrorPacketUI(packet);
                else
                    createPacketUI(packet);
            })
            isFilterOn = false;
        }
        searchBar.value = "";
    });

    searchBarForm.addEventListener("submit", (e) => {
        e.preventDefault();
    });

    searchBar.addEventListener("input", (e) => {
        e.preventDefault();
        filteredPacketBuffer = [];
        isFilterOn = true;
        searchQuery = searchBar.value.toLowerCase().trim();    
        filteredPacketBuffer = packetsBuffer.filter(packet => {
            return Object.values(packet).some(prop => {
                return String(prop).toLowerCase().includes(searchQuery);
            });
        });
        
        cleanPacketsContainer();
        filteredPacketBuffer.forEach(packet => {
            console.log("packet", packet)
            console.log("packet length", packet.length)
            if(packet.error)
               createErrorPacketUI(packet);
            else
              createPacketUI(packet);
        })
    })

    document.getElementById("trash").addEventListener("click", ()=> {
        cleanPacketsContainer();
        packetsBuffer.length = 0;
        startTime = null;
    })

    document.getElementById("save").addEventListener("click", ()=> {
        window.serialAPI.sendPackets(packetsBuffer);
    })

    quitBtn.addEventListener("click", ()=> {
        window.mainAPI.closeWindow(3); //window index = 3
    })
    
    //--------------------------Functions-----------------------------//
    function startButtonClickHandler() {
        window.serialAPI.sendStartSignal();
    
        startButtonEl.classList.add("play-button-disabled");
        startButtonEl.removeEventListener("click", startButtonClickHandler);
    
        stopButtonEl.classList.remove("stop-button-disabled");
        stopButtonEl.addEventListener("click", stopButtonClickHandler);
    }
    
    function stopButtonClickHandler() {
        window.serialAPI.sendStopSignal();
    
        stopButtonEl.classList.add("stop-button-disabled");
        stopButtonEl.removeEventListener("click", stopButtonClickHandler);
    
        startButtonEl.classList.remove("play-button-disabled");
        startButtonEl.addEventListener("click", startButtonClickHandler);
    }

    function cleanPacketsContainer(){
        const packets = document.querySelectorAll(".packet-row");
        packets.forEach(packet => {
            packet.remove();
        })
    }

    function setLanguage(selectedLanguage){

        column2.textContent = languages[selectedLanguage].diagnose.time;
        column3.textContent = languages[selectedLanguage].diagnose.source;
        column4.textContent = languages[selectedLanguage].diagnose.destination;
        column5.textContent = languages[selectedLanguage].diagnose.length;
        quitBtn.textContent = languages[selectedLanguage].button.quit;
    }

});
