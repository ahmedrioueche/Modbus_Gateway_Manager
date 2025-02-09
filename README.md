# Modbus Gateway Manager

A desktop application built with Electron for the configuration and diagnosis of a Modbus gateway. This project is part of my master's degree graduation project in collaboration with **Cevie Doofas Innovative Solutions**.

## Project Overview

This application is a component of a larger project titled **"Design and Implementation of a Modbus TCP/RTU Industrial Gateway"**, completed in June 2024. The purpose of the gateway is to facilitate seamless communication between industrial machines using variations of the Modbus protocol (TCP and RTU). 

I designed and developed a fully functional PCB using **KiCad**, and wrote the firmware in **C** and **C++**, leveraging the **STM32Cube** ecosystem. Throughout the process, I gained extensive experience in building complex multi-component systems from the ground up.

## Key Features

### 1. Gateway Configuration

The primary feature of the Modbus Gateway Manager is to configure the gateway by specifying parameters essential for its operation. These configurations are critical for ensuring that the gateway behaves correctly depending on the connected machines and the type of Modbus protocol used.

- **Modbus Mode Selection:**  
   Users can choose between Modbus RTU (serial communication) or Modbus TCP (Ethernet communication) modes. For instance, if the gateway is connected to a machine operating as a Modbus RTU client (master), the gateway needs to be configured as an RTU server (slave), and vice versa.

- **Serial Communication Settings:**  
   Users can configure various serial communication parameters for RTU mode, including:
   - Baud rate
   - Parity
   - Stop bits
   - Data size
   - Server identifier (slave ID) for RTU servers

- **TCP Configuration:**  
   For Modbus TCP, users can set:
   - The gateway's IP address, subnet mask, and default gateway
   - The remote IP address of the TCP server machine

   All configuration data is transmitted to the gateway via **USB** using the SerialPort library.

### 2. Packet Diagnosis and Troubleshooting

In addition to configuration, the app allows users to diagnose and analyze the data packets passing through the gateway. Packet copies are sent to the app via USB, where users can:
- Review the gateway’s behavior
- Analyze communication patterns
- Troubleshoot any system issues

This feature is particularly helpful for ensuring that the gateway is functioning correctly and for identifying issues in Modbus communication.

### 3. User Management and Localization

- **User Settings:**  
   The app provides functionality for users to manage their profiles. Users can change their username, reset their password, and customize other settings.

- **Localization:**  
   The app supports multiple languages, including:
   - English
   - French
   - Spanish

   User data, including configurations, are securely stored in a local **SQLite** database.

## Technology Stack

- **Frontend:** Electron, HTML, CSS, JavaScript
- **Backend:** SerialPort for USB communication, SQLite for local data storage
- **Firmware Development:** C, C++, STM32Cube for microcontroller programming
- **PCB Design:** KiCad

## Conclusion

The **Modbus Gateway Manager** simplifies the configuration and diagnostic processes of Modbus gateways, making it easier for users to set up industrial communication systems and troubleshoot potential issues. This project has been instrumental in enhancing my skills in embedded systems, software development, and hardware design.
"""