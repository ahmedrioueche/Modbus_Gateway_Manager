/*========================Brief================================
This file handles: 
    -Packet structuring
    -Packet UI display  

===============================================================*/
let networkIP, remoteIP, mbMode, slaveID;
let packetsBuffer = []; let startTime; 
function handleReceivedPacket(recPacket) {
    if (!startTime) startTime = Date.now();
    const relativeArrivalTime = ((Date.now() - startTime) / 1000).toFixed(6);

    const packetType = recPacket[0];
    let functionCode = recPacket[2];
    const recPacketLength = recPacket.length;

    if (packetType === 0xE) {
        handleError(recPacket[1], relativeArrivalTime);
    } else {
        let packetDataObj = {
            "packetSource": "",
            "packetDestination": "",
            "Function Code": formatField(functionCode),
        };

        const setBaseData = (source, destination, functionCode) => {
            packetDataObj.packetSource = source;
            packetDataObj.packetDestination = destination;
            packetDataObj["Function Code"] = formatField(functionCode);
        };

        const setTcpData = (recPacket) => {
            packetDataObj = {
                ...packetDataObj,
                "Transaction ID": formatTwoByteValue(recPacket[1], recPacket[2]),
                "Protocol ID": formatTwoByteValue(recPacket[3], recPacket[4]),
                "Message Length": formatTwoByteValue(recPacket[5], recPacket[6]),
                "Unit ID": formatField(recPacket[7]),
                "Function Code": formatField(recPacket[8]),
            };
        };

        const setRtuData = (recPacket, offset = 0) => {
            packetDataObj = {
                ...packetDataObj,
                "Slave ID": formatField(recPacket[1]),
                "Bytes To Follow": formatField(recPacket[3]),
                "Data": formatData(recPacket.slice(4, recPacketLength - 2 - offset)),
                "CRC": formatTwoByteValue(recPacket[recPacketLength - 2], recPacket[recPacketLength - 1]),
            };
        };

        switch (packetType) {
            case 1: // SIG_TCP_SERVER_RX
                const tcpServerRxSource = "Remote TCP Client";
                const tcpServerRxDest = `Gateway TCP Server IP = ${networkIP}`;
                functionCode = recPacket[8];
                setBaseData(tcpServerRxSource, tcpServerRxDest, functionCode);
                functionCode < 0x80 ? setTcpData(recPacket) : packetDataObj["Exception Code"] = formatField(recPacket[9]);
                break;

            case 2: // SIG_RTU_CLIENT_TX
                const rtuClientTxSource = `Gateway RTU Client`;
                const rtuClientTxDest = mbMode === 'TCP Server Mode'? `Remote RTU Server ID = ${slaveID}` :  `Remote RTU Server ID = ${slaveID}`;
                setBaseData(rtuClientTxSource, rtuClientTxDest, functionCode);
                console.log("recPacket[3] = ", recPacket[3])
                console.log("recPacket[4] = ", recPacket[4])
                functionCode < 0x80 ? setRtuData(recPacket) : packetDataObj["Exception Code"] = formatField(recPacket[3]);
                break;

            case 3: // SIG_RTU_CLIENT_RX
                const rtuClientRxSource = mbMode === "RTU Server Mode" ? `Remote RTU Server ID = ${recPacket[1]}` : `Remote RTU Server ID = ${slaveID}`;
                const rtuClientRxDest = `Gateway RTU Client`;
                setBaseData(rtuClientRxSource, rtuClientRxDest, functionCode);
                functionCode < 0x80 ? setRtuData(recPacket, 2) : packetDataObj["Exception Code"] = formatField(recPacket[3]);
                break;

            case 4: // SIG_TCP_SERVER_TX
                const tcpServerTxSource = mbMode === "RTU Server Mode" ? `Gateway TCP Server IP = ${remoteIP}` : `Gateway TCP Server IP = ${networkIP}`;
                const tcpServerTxDest = mbMode === "RTU Server Mode" ?  `Remote TCP Client IP = ${networkIP}` : "Remote TCP Client";
                functionCode = recPacket[8];
                setBaseData(tcpServerTxSource, tcpServerTxDest, functionCode);
                functionCode < 0x80 ? setTcpData(recPacket) : packetDataObj["Exception Code"] = formatField(recPacket[9]);
                break;

            case 5: // SIG_RTU_SERVER_RX
                const rtuServerRxSource = "Remote RTU Client";
                const rtuServerRxDest = `Gateway RTU Server ID = ${slaveID}`;
                setBaseData(rtuServerRxSource, rtuServerRxDest, functionCode);
                functionCode < 0x80 ? setRtuData(recPacket, 2) : packetDataObj["Exception Code"] = formatField(recPacket[3]);
                break;

            case 6: // SIG_TCP_CLIENT_TX
                const tcpClientTxSource = `Gateway TCP Client IP = ${networkIP}`;
                const tcpClientTxDest = `Remote TCP Server IP = ${remoteIP}`;
                functionCode = recPacket[8];
                setBaseData(tcpClientTxSource, tcpClientTxDest, functionCode);
                functionCode < 0x80 ? setTcpData(recPacket) : packetDataObj["Exception Code"] = formatField(recPacket[8]);
                break;

            case 7: // SIG_TCP_CLIENT_RX
                const tcpClientRxSource = `Remote TCP Server IP = ${remoteIP}`;
                const tcpClientRxDest = `Gateway TCP Client IP = ${networkIP}`;
                functionCode = recPacket[8];
                setBaseData(tcpClientRxSource, tcpClientRxDest, functionCode);
                functionCode < 0x80 ? setTcpData(recPacket) : packetDataObj["Exception Code"] = formatField(recPacket[8]);
                break;

            case 8: // SIG_RTU_SERVER_TX
                const rtuServerTxSource = `Gateway RTU Server ID = ${slaveID}`;
                const rtuServerTxDest = "Remote RTU Client";
                setBaseData(rtuServerTxSource, rtuServerTxDest, functionCode);
                functionCode < 0x80 ? setRtuData(recPacket) : packetDataObj["Exception Code"] = formatField(recPacket[3]);
                break;
        }

        const rawData = recPacket.slice(1).map(byte => (byte < 16 ? '0' : '') + byte.toString(16).toUpperCase()).join(' ');
        const packet = {
            type: packetType,
            number: packetsBuffer.length + 1,
            time: relativeArrivalTime,
            source: packetDataObj.packetSource,
            destination: packetDataObj.packetDestination,
            length: recPacketLength - 1,
            functionCode: packetDataObj["Function Code"],
            rawData: functionCode > 128 ? rawData + " Exception!" : rawData,
            packetData: packetDataObj,
        };

        packetsBuffer.push(packet);
        createPacketUI(packet);
    }
}


function createPacketUI(packet){
    const packetContainer = document.getElementById("packet-container");
    const packetEl = document.createElement("div");
    const numberEl = document.createElement("div");
    const timeEl = document.createElement("div");
    const sourceEl = document.createElement("div");
    const destinationEl = document.createElement("div");
    const lengthEl = document.createElement("div");
    const infoEl = document.createElement("div");

    packetEl.setAttribute("class", "packet-row");
    packetEl.setAttribute("id", "packet");
    
    colorPacketRow(packet, packetEl);
    
    packetEl.addEventListener("click", ()=>{
        window.serialAPI.savePacketData(packet);
        window.mainAPI.openWindow(4); //open packet details window
    })

    const packetElements = [numberEl, timeEl, sourceEl, destinationEl, lengthEl, infoEl];
    packetElements.forEach((element, index) => {
        element.setAttribute("class", "column");
        element.setAttribute("id", `column-${index+1}`);
    });
    packetContainer.appendChild(packetEl); 
    packetEl.scrollIntoView({ behavior: 'auto', block: 'start' });
    packetElements.forEach((element, index) => {
        const propertyName = Object.keys(packet)[index+1]; // Get property name from object
        let propertyValue = packet[propertyName]; // Access property value by name
        if (propertyName === "source" || propertyName === "destination") {
            propertyValue = propertyValue.replace(/(IP = |ID = )/g, '<br>$1'); //write the IP or ID on the next line
        }
        if(propertyName === "functionCode"){
            console.log("functionCode", propertyValue);
            propertyValue += getFunctionCodeString(propertyValue);
        }
        element.innerHTML = propertyValue; 
        packetEl.appendChild(element);
    })
    const columns = document.querySelectorAll(".column");
    columns.forEach(column => {
        column.style.fontSize = "0.8rem"; 
    });
}

function colorPacketRow(packet, packetEl){
    if(packet.length > 2 && packet.packetData && packet.packetData["Exception Code"]){
        packetEl.classList.add('type-5');
        return;
    }
    switch(packet.type){
        case 1:
        case 5:
            packetEl.classList.add('type-1');
            break;  
        case 2:
        case 6:
            packetEl.classList.add('type-2');
            break;
        case 3:
        case 7:
            packetEl.classList.add('type-3');
            break;
        case 4:
        case 8:
            packetEl.classList.add('type-4');
            break;
        default:
            packetEl.classList.add('default');
    }
}

function handleError(errorType, arrivalTime){
    let error = "ERROR: Gateway Failed to communicate with ";
    switch(errorType){
        case 225: //0xE1 RTU_CLIENT_ERROR
            error += "RTU Client"
            break;
        case 226: //0xE1 RTU_SERVER_ERROR
            error += "RTU Server"
            break;
        case 227: //0xE1 TCP_CLIENT_ERROR
            error += "TCP Client"
            break;
        case 228: //0xE1 TCP_SERVER_ERROR
           error += "TCP Server"
            break;
    }

    const packet =  {
        number: packetsBuffer.length + 1,
        time: arrivalTime,
        error: error,
    }

    packetsBuffer.push(packet);
    createErrorPacketUI(packet);
}

function createErrorPacketUI(packet){
    const packetContainer = document.getElementById("packet-container");
    const packetEl = document.createElement("div");
    const packetErrorText = document.createElement("span");
    const numberEl = document.createElement("div");
    const timeEl = document.createElement("div");

    packetEl.setAttribute("class", "packet-row");
    packetEl.classList.add("packet-error");

    numberEl.setAttribute("class", "column");
    numberEl.setAttribute("id", "column-1");

    timeEl.setAttribute("class", "column");
    timeEl.setAttribute("id", "column-2");

    packetErrorText.setAttribute("class", "packet-error-span");
    packetErrorText.textContent = packet.error;
    packetEl.style.backgroundColor = "rgb(246, 42, 42)";
    packetEl.style.color = "white";

    numberEl.innerHTML = packet.number;   
    timeEl.innerHTML = packet.time;

    packetEl.appendChild(numberEl);
    packetEl.appendChild(timeEl);
    packetEl.appendChild(packetErrorText);
    packetContainer.appendChild(packetEl);
}
