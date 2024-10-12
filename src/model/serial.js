const { SerialPort } = require('serialport');

const START_SIGNAL = [0xFF, 0x33, 0xCC];
const STOP_SIGNAL = [0x44, 0x55, 0x66];
const FACTORY_RESET_SIGNAL = [0xF, 0xA, 0xC];
const MB_PACKET_IDENTIFIER = [0x61, 0x62, 0x63];
const ADMIN_CONFIG_HEADER = [0xA, 0xD, 0xE];
const ADMIN_CONFIG_HEADER_LENGTH = 3;
const MB_PACKET_IDENTIFIER_LENGTH = 3;

class SerialPortManager {
    constructor() {
        if (SerialPortManager.instance) {
            return SerialPortManager.instance;
        }

        this.port = null;
        this.isPollActive = false;
        this.lastPortList = [];
        this.isPortOpen = false;
        SerialPortManager.instance = this;
    }

    comparePortLists(currentList) {
        const addedPorts = currentList.filter(port => !this.lastPortList.some(p => p.path === port.path));
        const removedPorts = this.lastPortList.filter(port => !currentList.some(p => p.path === port.path));
      
        if (addedPorts.length > 0 || removedPorts.length > 0) {
            const changedPorts = {
                addedPorts: addedPorts, 
                removedPorts: removedPorts,
            };
            process.emit("portChange", changedPorts);
        }
        this.lastPortList = currentList;
    }

    getSerialPorts() {
        return SerialPort.list();
    }

    checkForPortChanges() {
        this.getSerialPorts()
            .then(this.comparePortLists.bind(this))
            .catch(err => console.error('Error:', err))
            .finally(() => setTimeout(this.checkForPortChanges.bind(this), 1000)); // Adjust the interval as needed
    }

    initializeSerialPort(portPath, baudRate = 9600) {
        this.port = new SerialPort({
            path: portPath,
            baudRate: baudRate,
        });

        this.port.on('open', () => {
            console.log(`Serial port ${portPath} opened at baud rate ${baudRate}`);
            this.isPortOpen = true;
        });

        this.port.on('error', (err) => {
            console.error('Error: ', err.message);
        });
    }

    ensurePortIsOpen() {
        return new Promise((resolve, reject) => {
            if (this.port && this.port.isOpen) {
                resolve();
            } else if (this.port) {
                this.port.open(err => {
                    if (err) {
                        reject(new Error('Error opening serial port: ' + err.message));
                    } else {
                        resolve();
                    }
                });
            } else {
                reject(new Error('Serial port is not initialized'));
            }
        });
    }

    usbSendData(data) {
        return new Promise((resolve, reject) => {
            this.ensurePortIsOpen().then(() => {
                this.port.write(data, (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            }).catch(reject);
        });
    }

    usbPoll() {
        this.port.on("data", data => {
            this.usbHandleReceivedData(Array.from(data));
        });
        this.isPollActive = true;
    }

    usbHandleReceivedData(buffer) {
        const packetBuffer = [];
        if (isDataMBPacket(buffer)) {
            for (let i = 0; i < buffer.length - MB_PACKET_IDENTIFIER_LENGTH; i++) {
                packetBuffer[i] = buffer[MB_PACKET_IDENTIFIER_LENGTH + i];
            }
        }
        console.log("packetBuffer", packetBuffer);
        if (packetBuffer.length > 0) 
            process.emit("data", packetBuffer);
    }

    usbStop(device) {
        console.log("stop");
        if (device.isOpen) device.close();
    }

    async usbSendConfigData(config) {
        try {
            await this.usbSendData(config);
            console.log('Configuration data sent');
        } catch (error) {
            console.error('Error sending configuration data:', error);
        }
    }

    async usbSendStartSignal() {
        try {
            await this.usbSendData(START_SIGNAL);
            console.log('Start signal sent');
        } catch (error) {
            console.error('Error sending start signal:', error);
        }

        if (!this.isPollActive) {
            this.usbPoll();
        }
    }

    async usbSendStopSignal() {
        try {
            await this.usbSendData(STOP_SIGNAL);
            console.log('Stop signal sent');
        } catch (error) {
            console.error('Error sending stop signal:', error);
        }
    }

    async usbSendAdminConfigData(config) {
        const dataToSend = structureAdminConfigDataPacket(config);
        try {
            await this.usbSendData(dataToSend);
            console.log('Admin configuration data sent');
        } catch (error) {
            console.error('Error sending admin configuration data:', error);
        }
    }

    async usbSendFactoryResetSignal() {
        try {
            await this.usbSendData(FACTORY_RESET_SIGNAL);
            console.log('Factory reset signal sent');
        } catch (error) {
            console.error('Error sending factory reset signal:', error);
        }
    }
}

function structureAdminConfigDataPacket(configData){
    console.log("configData", configData)

    let dataToSend = [];
    //append an identifier
    for(let i = 0; i < ADMIN_CONFIG_HEADER_LENGTH; i++){
        dataToSend[i] = ADMIN_CONFIG_HEADER[i];
    }

    const configSize = 18;
    const networkIP = configData.networkIP;
    const networkMask = configData.networkMask;
    const networkGateway = configData.networkGateway;
    const macAddress = configData.macAddress;

    dataToSend[ADMIN_CONFIG_HEADER_LENGTH] = configSize;
    insertIPIntoArray(networkIP, dataToSend, ADMIN_CONFIG_HEADER_LENGTH + 1);
    insertIPIntoArray(networkMask, dataToSend, ADMIN_CONFIG_HEADER_LENGTH + 5);
    insertIPIntoArray(networkGateway, dataToSend, ADMIN_CONFIG_HEADER_LENGTH + 9);

    for(let i = ADMIN_CONFIG_HEADER_LENGTH + 13; i < ADMIN_CONFIG_HEADER_LENGTH + 19; i++){
        dataToSend[i] = macAddress[i];
    }

    return dataToSend;
}

function isDataMBPacket(buffer){

    for(let i=0; i<MB_PACKET_IDENTIFIER_LENGTH; i++){
        if(buffer[i] !== MB_PACKET_IDENTIFIER[i])
            return false;
    }
    return true;
}

const instance = new SerialPortManager();

module.exports = instance;
