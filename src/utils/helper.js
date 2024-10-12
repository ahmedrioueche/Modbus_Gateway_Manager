function formatField(value) {
    return `${(value < 16 ? '0' : '')}${value.toString(16).toUpperCase()}`;
}

function formatTwoByteValue(byte1, byte2) {
    return `${formatField(byte1)} ${formatField(byte2)}`;
}

function formatAddress(byte1, byte2) {
    return formatTwoByteValue(byte1, byte2);
}

function formatData(dataArray) {
    return `${dataArray.map(byte => formatField(byte)).join(' ')}`;
}

function getFunctionCodeString(functionCode){
    let normalValue, exceptionText = "";

    if(functionCode > 80){
        normalValue = functionCode - 80; 
        exceptionText = " Exception: Couldn't"
    }
    else
        normalValue = parseInt(functionCode.toString(), 10); 
  
    return exceptionText + " " + modbusFunctionCodes[normalValue];
  }