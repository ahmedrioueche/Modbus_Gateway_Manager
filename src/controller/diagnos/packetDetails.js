document.addEventListener("DOMContentLoaded", async () => {
 
  //-----------------------------DOM------------------------------------------//
  const container = document.querySelector(".packet-details");
  const numberEl = document.getElementById("number");
  const timeEl = document.getElementById("time");
  const sourceEl = document.getElementById("source");
  const destinationEl = document.getElementById("destination");
  const lengthEl = document.getElementById("length");
  const dataEl = document.getElementById("data");
  const closeBtn = document.getElementById("close-button");

  //-----------------------------Variables-----------------------------------//
  let selectedLanguage = defaultLanguage;

  //----------------------------Settings------------------------------------//
  const storedSettings = JSON.parse(localStorage.getItem("settings"));
  if(storedSettings)
    selectedLanguage = storedSettings.language;

    numberEl.textContent = languages[selectedLanguage].diagnose.number;
    timeEl.textContent = languages[selectedLanguage].diagnose.time;
    sourceEl.textContent = languages[selectedLanguage].diagnose.source;
    destinationEl.textContent = languages[selectedLanguage].diagnose.destination;
    lengthEl.textContent = languages[selectedLanguage].diagnose.length;
    dataEl.textContent = languages[selectedLanguage].diagnose.data;
    closeBtn.textContent = languages[selectedLanguage].button.quit;
    
  //---------------------------Logic----------------------------------------//
  //get clicked packet data
  let packet = await window.serialAPI.getOpenedPacketData();
  
  numberEl.textContent = `${packet.number}`
  timeEl.textContent = `${packet.time}`
  sourceEl.textContent = `${packet.source}`
  destinationEl.textContent = `${packet.destination.split(" ID = ")[0]}`
  lengthEl.textContent = `${packet.length}`
  dataEl.textContent = ` ${packet.rawData}`

  const table = document.createElement('table');
  
  let counter = 0;
  for (const key in packet.packetData) {
    if (Object.hasOwnProperty.call(packet.packetData, key)) {
      if(counter > 1){
          let normalValue = 0
          const value = packet.packetData[key];
          console.log("key", key)
          console.log("value", value)
          if(value && key !== "CRC"){
            const row = document.createElement('tr');
            const labelCell = document.createElement('td');
            const valueCell = document.createElement('td');
            valueCell.textContent = value;

            labelCell.innerHTML = `<strong>${key}</strong>`;
      
            row.appendChild(labelCell);
            row.appendChild(valueCell);
            table.appendChild(row);
            //check for an exception
            if(key === "Function Code" ){
              valueCell.textContent += getFunctionCodeString(value);
            }
            if(key === "Exception Code"){
              normalValue = parseInt(value.toString(), 10); 
              valueCell.textContent += " " + modbusExceptionCodes[normalValue];            
            }
          }
        }
        counter++;
      }
  }
  //Let CRC be last
  if (packet.packetData.hasOwnProperty("CRC")) {
    const crcValue = packet.packetData["CRC"];
    if (crcValue) {
        const crcRow = document.createElement('tr');
        const crcLabelCell = document.createElement('td');
        const crcValueCell = document.createElement('td');

        crcLabelCell.innerHTML = `<strong>CRC</strong>`;
        crcValueCell.textContent = crcValue;

        crcRow.appendChild(crcLabelCell);
        crcRow.appendChild(crcValueCell);

        table.appendChild(crcRow);
    }
  }
  container.appendChild(table);

  closeBtn.addEventListener("click", ()=> {
      window.mainAPI.closeWindow(4); //window index = 4
  })    
})
