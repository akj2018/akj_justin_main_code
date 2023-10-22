const EWasteTracking = artifacts.require("EWasteTracking");
const { expect } = require("chai");
const { BN } = require("bn.js"); // Import the BN library

contract("EWasteTracking", (accounts) => {
    let ewasteTracking;
    const admin = accounts[0];
    const manufacturer = accounts[1];
    const consumer = accounts[2];
    const refurbisher = accounts[3];
    const recycler = accounts[4];
    const distributor = accounts[5];
    const retailer = accounts[6];
    const govt = accounts[7];
    const environmentalAgency = accounts[8];

    before(async () => {
        eWasteTracking = await EWasteTracking.deployed();
    });

    it("should deploy and assign roles correctly", async () => {
        const hasAdminRole = await eWasteTracking.hasRole(web3.utils.sha3("MANUFACTURER_ROLE"), admin);
        expect(hasAdminRole).to.equal(true);
    });

    it("should create a new passport", async () => {
        await eWasteTracking.grantRole(web3.utils.sha3("MANUFACTURER_ROLE"), manufacturer, { from: admin });
        
        const imeiNumber = 123456789012345;
        const smartphoneModel = "Galaxy S20";
        const phoneManufacturer = "Samsung";
        const expectedLifecycle = 5; // for example, in years
        const manufactureDate = Math.floor(Date.now() / 1000); // current timestamp in seconds
        const isBatteryReplaceable = true;

        const tx = await eWasteTracking.createNewPassport(
            imeiNumber,
            smartphoneModel,
            phoneManufacturer,
            expectedLifecycle,
            manufactureDate,
            isBatteryReplaceable,
            { from: manufacturer } 
        );


        expect(tx.logs).to.have.lengthOf(1, "One event should have been emitted");
        expect(tx.logs[0].event).to.equal("PassportCreated", "The event emitted should be PassportCreated");
        expect(tx.logs[0].args.imeiNumber.toString()).to.equal(imeiNumber.toString() , "IMEI should match");
        expect(tx.logs[0].args.smartphoneModel).to.equal(smartphoneModel, "Smartphone model should match");
        expect(tx.logs[0].args.manufacturer).to.equal(phoneManufacturer, "Manufacturer should match");
        expect(tx.logs[0].args.expectedLifecycle.toNumber()).to.equal(expectedLifecycle, "Expected lifecycle should match");
        expect(tx.logs[0].args.manufactureDate.toNumber()).to.equal(manufactureDate, "Manufacture date should match");
        expect(tx.logs[0].args.isBatteryReplaceable).to.equal(isBatteryReplaceable, "Is battery replaceable should match");

        logEvent(tx.logs[0]);

    });


    describe("Sell Transaction", function() {
        it("should execute a successful sell transaction", async function() {
            const imeiNumber = 123456789012345; // Example IMEI
            const sourceEntityType = "manufacturer"; // Example source entity type
            const targetEntityType = "consumer"; // Example target entity type
            const sourceEntityAddress = manufacturer // Example source entity address
            const targetEntityAddress = consumer; // Example target entity address
            const smartphoneDetails = "Test Smartphone Details";
            const additionalInfo = "Test Additional Info for Sale";
    
            // Execute the sell transaction
            const tx = await eWasteTracking.sellTransaction(
                imeiNumber,
                sourceEntityType,
                targetEntityType,
                sourceEntityAddress,
                targetEntityAddress,
                smartphoneDetails,
                additionalInfo,
                { from: sourceEntityAddress } 
            );
    
            // Check the event logs
            const log = tx.logs.find(l => l.event === "SellTransaction");
            expect(log).to.not.be.undefined;
            expect(log.args.imeiNumber.toString()).to.equal(imeiNumber.toString());
            expect(log.args.actionPerformed).to.equal('sell');            
            expect(log.args.sourceEntityType).to.equal(sourceEntityType);
            expect(log.args.sourceEntityAddress).to.equal(sourceEntityAddress);
            expect(log.args.targetEntityType).to.equal(targetEntityType);
            expect(log.args.targetEntityAddress).to.equal(targetEntityAddress);
            expect(log.args.smartphoneDetails).to.equal(smartphoneDetails);
            expect(log.args.additionalInfo).to.equal(additionalInfo);

            logEvent(log);

        });
    });

    // describe('Give Transaction', () => {
    //     it('should execute a successfull give event', async () => {
    //         const imeiNumber = 123456789012345;  // replace with an appropriate IMEI number for your test
    //         const sourceEntityType = "consumer";
    //         const targetEntityType = "recycler";
    //         const sourceEntityAddress = consumer;
    //         const targetEntityAddress = recycler;
    //         const smartphoneDetails = "Test Smartphone Details";
    //         const additionalInfo = "Test Additional Info";

    //         await eWasteTracking.grantRole(web3.utils.sha3("CONSUMER_ROLE"), consumer, { from: admin });

    //         // Execute the give transaction
    //         const tx = await eWasteTracking.giveTransaction(
    //             imeiNumber,
    //             sourceEntityType,
    //             targetEntityType,
    //             sourceEntityAddress,
    //             targetEntityAddress,
    //             smartphoneDetails,
    //             additionalInfo,
    //             { from: sourceEntityAddress } 
    //         );

    //         // Check event emission
    //         const log = tx.logs.find(l => l.event === "GiveTransaction");
    //         expect(log).to.not.be.undefined;
    //         expect(log.args.imeiNumber.toString()).to.equal(imeiNumber.toString());
    //         expect(log.args.actionPerformed).to.equal('give');
    //         expect(log.args.sourceEntityType).to.equal(sourceEntityType);
    //         expect(log.args.sourceEntityAddress).to.equal(sourceEntityAddress);
    //         expect(log.args.targetEntityType).to.equal(targetEntityType);
    //         expect(log.args.targetEntityAddress).to.equal(targetEntityAddress);
    //         expect(log.args.additionalInfo).to.equal(additionalInfo);
    //         expect(log.args.smartphoneDetails).to.equal(smartphoneDetails);

    //         logEvent(log);
    //     });
    // });

    // describe('Return Transaction', () => {
    //     it('should execute a successfull return event', async () => {
    //         const imeiNumber = 123456789012345;  // replace with an appropriate IMEI number for your test
    //         const sourceEntityType = "refurbisher";
    //         const targetEntityType = "retailer";
    //         const sourceEntityAddress = refurbisher;
    //         const targetEntityAddress = retailer;
    //         const smartphoneDetails = "Test Smartphone Details";
    //         const additionalInfo = "Test Additional Info";

    //         await eWasteTracking.grantRole(web3.utils.sha3("REFURBISHER_ROLE"), refurbisher, { from: admin });

    //         // Execute the give transaction
    //         const tx = await eWasteTracking.returnTransaction(
    //             imeiNumber,
    //             sourceEntityType,
    //             targetEntityType,
    //             sourceEntityAddress,
    //             targetEntityAddress,
    //             smartphoneDetails,
    //             additionalInfo,
    //             { from: sourceEntityAddress } 
    //         );

    //         // Check event emission
    //         const log = tx.logs.find(l => l.event === "ReturnTransaction");
    //         expect(log).to.not.be.undefined;
    //         expect(log.args.imeiNumber.toString()).to.equal(imeiNumber.toString());
    //         expect(log.args.actionPerformed).to.equal('return');
    //         expect(log.args.sourceEntityType).to.equal(sourceEntityType);
    //         expect(log.args.sourceEntityAddress).to.equal(sourceEntityAddress);
    //         expect(log.args.targetEntityType).to.equal(targetEntityType);
    //         expect(log.args.targetEntityAddress).to.equal(targetEntityAddress);
    //         expect(log.args.additionalInfo).to.equal(additionalInfo);
    //         expect(log.args.smartphoneDetails).to.equal(smartphoneDetails);

    //         logEvent(log);
    //     });
    // });


    
    // describe('Dispose Transaction', () => {
    //     it('should execute a successful dispose transaction', async () => {
    //         const imeiNumber = 123456789012345;  // Replace with an appropriate IMEI number for your test
    //         const sourceEntityType = "consumer"; // Example source entity type
    //         const sourceEntityAddress = consumer; // Example source entity address
    //         const disposalMethod = "Recycle";
    //         const disposalDate = "2023-10-22"; // Current date as an example
    //         const disposalLocation = "Recycle Center, NY";
    //         const smartphoneDetails = "Test Smartphone Details";
    //         const additionalInfo = "Test Additional Info for Disposal";
    
    //         // Ensure the consumer has the right role to dispose (if not, grant them the role)
    //         await eWasteTracking.grantRole(web3.utils.sha3("CONSUMER_ROLE"), consumer, { from: admin });
    
    //         // Call the function
    //         const tx = await eWasteTracking.disposeTransaction(
    //             imeiNumber,
    //             sourceEntityType,
    //             sourceEntityAddress,
    //             disposalMethod,
    //             disposalDate,
    //             disposalLocation,
    //             smartphoneDetails,
    //             additionalInfo,
    //             { from: sourceEntityAddress } // Assuming consumer initiates the disposal transaction
    //         );
    
    //         // Check event emission
    //         const log = tx.logs.find(l => l.event === "DisposeTransaction");
    //         expect(log).to.not.be.undefined;
    //         expect(log.args.imeiNumber.toString()).to.equal(imeiNumber.toString());
    //         expect(log.args.actionPerformed).to.equal('dispose');
    //         expect(log.args.sourceEntityType).to.equal(sourceEntityType);
    //         expect(log.args.sourceEntityAddress).to.equal(sourceEntityAddress);
    //         expect(log.args.disposalMethod).to.equal(disposalMethod);
    //         expect(log.args.disposalDate).to.equal(disposalDate);
    //         expect(log.args.disposalLocation).to.equal(disposalLocation);
    //         expect(log.args.additionalInfo).to.equal(additionalInfo);
    //         expect(log.args.smartphoneDetails).to.equal(smartphoneDetails);
    
    //         logEvent(log);
    //     });
    // });

    // describe('Government Transaction', () => {
    //     it("should emit GovernmentTransactionRequest event and get lifecycle events", async () => {
    
    //         const imeiNumber = 123456789012345; // Replace with your test IMEI
    
    //         // Ensure the consumer has the right role to dispose (if not, grant them the role)
    //         await eWasteTracking.grantRole(web3.utils.sha3("GOVERNMENT_ROLE"), govt, { from: admin });
    
    //         // Call the governmentTransaction function
    //         const tx = await eWasteTracking.governmentTransaction(imeiNumber, {from: govt});
    
    //         // Assert the emitted event
    //         const event = tx.logs[0].args;
    //         expect(event.imeiNumber.toString()).to.equal(imeiNumber.toString());
    //         expect(event.requestorAddress.toString()).to.equal(govt.toString());
    
    //         // Fetch lifecycleEvents count for the given IMEI
    //         const eventsCount = await eWasteTracking.getLifecycleEventsCount(imeiNumber);
            
    //         console.log("\nLifecycle Events for IMEI:", imeiNumber);
    //         for(let i = 0; i < eventsCount.toNumber(); i++) {
    //             const eventResult = await eWasteTracking.getLifecycleEvent(imeiNumber, i);
    //             const eventDescription = eventResult.eventDescription;
    //             const timestamp = eventResult.timestamp.toString();
    //             console.log(`Event ${i + 1} [Timestamp: ${timestamp}]: ${eventDescription}\n`);
    //         }

    //         console.log("Disposal Log for IMEI:", imeiNumber);
    //         const disposalDetails = await eWasteTracking.getDisposalDetails(imeiNumber);
    //         console.log("Disposal Method:", disposalDetails[0]);
    //         console.log("Disposal Date:", disposalDetails[1]);
    //         console.log("Location:", disposalDetails[2]);
    //         console.log("Disposed By:", disposalDetails[3]);

    //     });
    // });

    // describe('Environment Transaction', () => {
    //     it("sshould emit EnvironmentTransactionEvent when environmentTransaction is called", async () => {
    
    //         const imeiNumber = 123456789012345; // Replace with your test IMEI
    
    //         // Ensure the consumer has the right role to dispose (if not, grant them the role)
    //         await eWasteTracking.grantRole(web3.utils.sha3("ENVIRONMENT_ROLE"), environmentalAgency, { from: admin });
    
    //         // Call the governmentTransaction function
    //         const tx = await eWasteTracking.environmentTransaction(imeiNumber, {from: environmentalAgency});
    
    //         // Assert the emitted event
    //         const event = tx.logs[0].args;
    //         expect(event.imeiNumber.toString()).to.equal(imeiNumber.toString());
    //         expect(event.requestorAddress.toString()).to.equal(environmentalAgency.toString());
    
    //         // Fetch lifecycleEvents count for the given IMEI
    //         const eventsCount = await eWasteTracking.getLifecycleEventsCount(imeiNumber);
            
    //         console.log("\nLifecycle Events for IMEI:", imeiNumber);
    //         for(let i = 0; i < eventsCount.toNumber(); i++) {
    //             const eventResult = await eWasteTracking.getLifecycleEvent(imeiNumber, i);
    //             const eventDescription = eventResult.eventDescription;
    //             const timestamp = eventResult.timestamp.toString();
    //             console.log(`Event ${i + 1} [Timestamp: ${timestamp}]: ${eventDescription}\n`);
    //         }

    //         console.log("Disposal Log for IMEI:", imeiNumber);
    //         const disposalDetails = await eWasteTracking.getDisposalDetails(imeiNumber);
    //         console.log("Disposal Method:", disposalDetails[0]);
    //         console.log("Disposal Date:", disposalDetails[1]);
    //         console.log("Location:", disposalDetails[2]);
    //         console.log("Disposed By:", disposalDetails[3]);

    //     });
    // });


    after(async () => {
        await eWasteTracking.renounceRole(web3.utils.sha3("MANUFACTURER_ROLE"), manufacturer, { from: manufacturer });
        await eWasteTracking.renounceRole(web3.utils.sha3("CONSUMER_ROLE"), consumer, { from: consumer });
        await eWasteTracking.renounceRole(web3.utils.sha3("REFURBISHER_ROLE"), refurbisher, { from: refurbisher });
        await eWasteTracking.renounceRole(web3.utils.sha3("RECYCLER_ROLE"), recycler, { from: recycler });
        await eWasteTracking.renounceRole(web3.utils.sha3("RETAILER_ROLE"), retailer, { from: retailer });
        await eWasteTracking.renounceRole(web3.utils.sha3("GOVERNMENT_ROLE"), govt, { from: govt });
        await eWasteTracking.renounceRole(web3.utils.sha3("ENVIRONMENT_ROLE"), environmentalAgency, { from: environmentalAgency });
        // Similar role renunciations for other roles to clean up
    });
});

function logEvent(log) {
    let output = `[${log.event}](\n`;

    for (let [key, value] of Object.entries(log.args)) {
        if (!key.startsWith('__') && isNaN(key)) { // Check if key is non-numeric
            let type = typeof value;

            // Special handling for BN type
            if (BN.isBN(value)) {
                type = "uint256";
                value = value.toString();
            } else if (type === 'string') {
                value = `'${value}'`;
            }

            output += `  ${key}: ${value} (type: ${type}),\n`;
        }
    }

    output = output.slice(0, -2); // remove last comma and newline
    output += "\n)";

    console.log(output);
}