const Web3 = require('web3');
const ExcelJS = require('exceljs');
const fs = require('fs');
const xlsx = require('node-xlsx');

const web3 = new Web3(new Web3.providers.WebsocketProvider("ws://127.0.0.1:7545"));
const contractArtifacts = require('../build/contracts/EWasteTracking.json');
const contractABI = contractArtifacts.abi;
const contractAddress = contractArtifacts.networks[Object.keys(contractArtifacts.networks)[0]].address; // Address where your contract is deployed
console.log(`Contract address: ${contractAddress}`);

const contract = new web3.eth.Contract(contractABI, contractAddress);
const outputFile = 'transactions.xlsx';

const BATCH_TIME = 3000; // 3 seconds in milliseconds
let transactionBatch = [];
const MAX_BATCH_SIZE = 100; 

const processBatch = async () => {
    if (transactionBatch.length > 0) {
        console.log("Processing batch with data:\n", transactionBatch);
        for (const data of transactionBatch) {
            await writeToExcel(data);  // We're utilizing your writeToExcel function for batch processing
        }
        transactionBatch = []; // Clear the batch after processing
    }
};

// Use a setInterval to periodically process batches
setInterval(processBatch, BATCH_TIME);

const writeQueue = [];
let lastPromiseInQueue = Promise.resolve();  // Start with a resolved promise

const processQueue = () => {
    console.log("Processing Excel write queue. Items in queue:", writeQueue.length);
    while (writeQueue.length > 0) {
        const data = writeQueue.shift();
        lastPromiseInQueue = lastPromiseInQueue.then(() => {
            return _writeToExcel(data);
        }).catch(error => {
            console.error('Error writing to Excel:', error);
        });
    }
};


const writeToExcel = (data) => {
    console.log("Queuing data for Excel:", data);
    writeQueue.push(data);
    processQueue();
};

const _writeToExcel = async (data) => {
    let sheets = [];
    let worksheet;

    const headers = [
        'Timestamp',
        'IMEI Number',
        'Phone Name',
        'Manufacturer',
        'Event Performed',
        'Source Entity Type',
        'Source Entity Address',
        'Target Entity Type',
        'Target Entity Address',
        'Expected Lifecycle', 
        'Achieved Lifecycle',
        '5G capability',   
        'Release Date',  
        'OS', 
        'Chipset',         
        'Phone Memory',  
        'Battery Removable',
        'Battery Type',
        'Condition',
        'Components',
        'Lifecycle Events',
        'Disposal Method',
        'Disposal Date',
        'Disposal Location',
        'Disposed By'    
    ];

    try {
        // Read the existing file if it exists
        if (fs.existsSync(outputFile)) {
            sheets = xlsx.parse(outputFile);
            // Check if 'Transactions' sheet exists
            worksheet = sheets.find(sheet => sheet.name === 'Transactions');
        }

        // If 'Transactions' sheet does not exist or there was an error reading the file, create one
        if (!worksheet) {
            console.log("Creating new worksheet 'Transactions'");
            worksheet = {
                name: 'Transactions',
                data: [headers]  // Initialize with headers
            };
            sheets.push(worksheet);
        } else {
            console.log("Appending to existing worksheet 'Transactions'");
        }

        // Append the data to the worksheet
        worksheet.data.push(Object.values(data));

    } catch (error) {
        console.error("Error while handling Excel operations:", error.message);
        return;
    }

    console.log("Writing data to Excel:", data);
    // Convert sheets to buffer and write to file
    const buffer = xlsx.build(sheets);
    fs.writeFileSync(outputFile, buffer);
};


// Listener for PassportCreated event
contract.events.PassportCreated({
    fromBlock: 'latest' // start listening from the latest block
})
.on('data', (event) => {
    console.log("\nPassportCreated event received!");
    console.log("Phone Name:", event.returnValues.phoneName);
    console.log("IMEI Number:", event.returnValues.imeiNumber);
    console.log("Manufacturer:", event.returnValues.manufacturer);
    console.log("Expected Lifecycle:", event.returnValues.expectedLifecycle);
    console.log("Manufacture Date:", new Date(event.returnValues.manufactureDate * 1000).toISOString());
    console.log("Is Battery Replaceable:", event.returnValues.isBatteryReplaceable);
})
.on('error', console.error);



function handleEventData(event, passport) {

    // Extract AdditionalDetails from the fetched passport
    const additionalDetails = passport.additionalDetails;

    const imeiNumber = event.returnValues.imeiNumber;
    const sourceEntityType = event.returnValues.sourceEntityType;
    const sourceEntityAddress = event.returnValues.sourceEntityAddress;
    const targetEntityType = event.returnValues.targetEntityType;
    const targetEntityAddress = event.returnValues.targetEntityAddress;
    const actionPerformed =  sourceEntityType + " " + event.returnValues.actionPerformed + " to " + targetEntityType;

    // Unpack additionalDetails
    const is5GCapable = additionalDetails.is5GCapable;
    const releaseDate = additionalDetails.releaseDate;
    const os = additionalDetails.os;
    const chipset = additionalDetails.chipset;
    const phoneMemory = additionalDetails.phoneMemory;
    const batteryType = additionalDetails.batteryType;
    const condition = additionalDetails.condition;
    const expectedLifecycleAdd = additionalDetails.expectedLifecycle; // renamed to avoid conflict
    const achievedLifecycle = additionalDetails.achievedLifecycle;

    const componentsList = passport.components;
    const componentsString = {};

    for (const component of componentsList) {
        componentsString[component.material] = component.componentName;
    }

    components = JSON.stringify(componentsString);

    const lifecycleEventsList = passport.lifecycleEvents;
    const lifecycleEventsString = {};

    for (const event of lifecycleEventsList) {
        const timestamp = new Date(event.timestamp * 1000).toISOString(); // Convert timestamp to ISO format
        lifecycleEventsString[timestamp] = event.eventDescription;
    }

    lifecycleEvents = JSON.stringify(lifecycleEventsString)

    const transactionData = {
        'Timestamp': new Date().toISOString(),
        'IMEI Number': imeiNumber,
        'Phone Name': passport.phoneName, // Replace with the actual phone name
        'Manufacturer': passport.manufacturer, // Replace with the actual manufacturer
        'Event Performed': actionPerformed,
        'Source Entity Type': sourceEntityType,
        'Source Entity Address': sourceEntityAddress,
        'Target Entity Type': targetEntityType,
        'Target Entity Address': targetEntityAddress,
        'Expected Lifecycle': expectedLifecycleAdd,
        'Achieved Lifecycle': achievedLifecycle,
        '5G capability': is5GCapable,
        'Release Date': releaseDate,
        'OS': os,
        'Chipset': chipset,
        'Phone Memory': phoneMemory,
        'Battery Removable': passport.isBatteryReplaceable, 
        'Battery Type': batteryType,
        'Condition': condition,
        'Components': components, 
        'Lifecycle Events': lifecycleEvents, 
        'Disposal Method': passport.disposalEvent.disposalMethod, 
        'Disposal Date': passport.disposalEvent.disposedBy, 
        'Disposal Location': passport.disposalEvent.location, 
        'Disposed By': passport.disposalEvent.disposedBy 
    };

    return transactionData;
}

// Listener for SellTransaction
contract.events.SellTransaction({
    fromBlock: 'latest'
})
.on('data', async (event) => {
    console.log("\nSellTransaction event received");

    // Fetch the passport using the IMEI number from the event
    const imeiNumber = event.returnValues.imeiNumber;
    const passport = await contract.methods.getPassportByIMEI(imeiNumber).call();

    const transactionData = handleEventData(event, passport);

    transactionBatch.push(transactionData); 

    if (transactionBatch.length >= MAX_BATCH_SIZE) {
        await processBatch(); // Process the batch immediately
    }
})
.on('error', console.error);




// Listener for GiveTransaction
contract.events.GiveTransaction({
    fromBlock: 'latest'
})
.on('data', async (event) => {
    console.log("GiveTransaction event received");

    // Fetch the passport using the IMEI number from the event
    const imeiNumber = event.returnValues.imeiNumber;
    const passport = await contract.methods.getPassportByIMEI(imeiNumber).call();

    const transactionData = handleEventData(event, passport);

    transactionBatch.push(transactionData); 

    if (transactionBatch.length >= MAX_BATCH_SIZE) {
        await processBatch(); // Process the batch immediately
    }
})
.on('error', console.error);



// Listener for ReturnTransaction
contract.events.ReturnTransaction({
    fromBlock: 'latest'
})
.on('data', async (event) => {
    console.log("ReturnTransaction event received");

    // Fetch the passport using the IMEI number from the event
    const imeiNumber = event.returnValues.imeiNumber;
    const passport = await contract.methods.getPassportByIMEI(imeiNumber).call();

    const transactionData = handleEventData(event, passport);

    transactionBatch.push(transactionData); 

    if (transactionBatch.length >= MAX_BATCH_SIZE) {
        await processBatch(); // Process the batch immediately
    }
})
.on('error', console.error);


// Listener for DisposeTransaction
contract.events.DisposeTransaction({
    fromBlock: 'latest'
})
.on('data', async (event) => {
    console.log("DisposeTransaction event received");

    // Fetch the passport using the IMEI number from the event
    const imeiNumber = event.returnValues.imeiNumber;
    const passport = await contract.methods.getPassportByIMEI(imeiNumber).call();

    const transactionData = handleEventData(event, passport);

    transactionBatch.push(transactionData); 

    if (transactionBatch.length >= MAX_BATCH_SIZE) {
        await processBatch(); // Process the batch immediately
    }
})
.on('error', console.error);




console.log(`Monitoring events and writing to ${outputFile}...`);
