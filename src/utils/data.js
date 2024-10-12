const defaultLanguage = "english";
const GATEWAY_ID = 0xC1B0;  //USB VENDOR ID
const configStatus =  {
    VALID: "valid",
    INVALID: "invalid",
    VOID: "void",
}

const authStatus = {
  VALID: "valid",
  INVALID_USERNAME: "invalid username",
  INVALID_PASSWORD: "invalid password",
  VOID_USERNAME: "void username",
  VOID_PASSWORD: "void password",
}

const settingsStatus = {
  VALID: "valid",
  INVALID_NEW_USERNAME: "invalid username",
  INVALID_OLD_PASSWORD: "invalid old password",
  INVALID_NEW_PASSWORD: "invalid new passord",
  INVALID_CON_PASSWORD: "invalid confirm password",
  VOID_USERNAME: "void username",
  VOID_OLD_PASSWORD: "void old password",
  VOID_NEW_PASSWORD: "void new password",
  VOID_CON_PASSWORD: "void confirm password"
}

let defaultMacAddress = [0x00, 0x80, 0xE1, 0x00, 0x00, 0x55];
let defaultDeviceConfig = {
    name:"MODBUS Gateway",
    mode: 1,  //RTU Server Mode
    baudrate: "9600",
    parity: "None",
    stopBits: "1",
    dataSize: "8",
    macAddress: defaultMacAddress,
    slaveID: 5,
    networkIP: "192.168.2.60",
    networkMask: "255.255.255.0",
    networkGateway: "192.168.2.1",
    remoteIP: "192.168.2.100",
}

const modbusFunctionCodes = {
    1: "Read Coils",
    2: "Read Discrete Inputs",
    3: "Read Holding Registers",
    4: "Read Input Registers",
    5: "Write Single Coil",
    6: "Write Single Holding Register",
    15: "Write Multiple Coils",
    10: "Write Multiple Holding Registers"
  };

  const modbusExceptionCodes = {
    1: "Illegal Function",
    2: "Illegal Data Address",
    3: "Illegal Data Value",
    4: "Server Device Failure",
    5: "Acknowledge",
    6: "Server Device Busy",
    10: "Gateway Path Unavailable",
    11: "Gateway Target Device Failed to Respond"
  };

async function getConfigDeviceId(){
    const configDevice = await window.serialAPI.getOpenedDevice();
    const deviceId = `${configDevice.vendorId}-${configDevice.productId}`;
    return deviceId;
}
