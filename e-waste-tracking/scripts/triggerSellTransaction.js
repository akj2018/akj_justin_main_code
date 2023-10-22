const contractArtifacts = artifacts.require("EWasteTracking");

module.exports = async (callback) => {
    try {
        const eWasteTracking = await contractArtifacts.deployed();

        // Sample data (Modify as per your needs)

        const imeiNumber = 123456789012345; // Example IMEI
        const sourceEntityType = "manufacturer"; // Example source entity type
        const targetEntityType = "distributor"; // Example target entity type

        const accounts = await web3.eth.getAccounts();
        const sourceEntityAddress = accounts[1]; // manufacturer
        const targetEntityAddress = accounts[5]; // consumer


        await eWasteTracking.sellTransaction(
            imeiNumber, 
            sourceEntityType,
            targetEntityType,
            sourceEntityAddress,
            targetEntityAddress, 
            { from: sourceEntityAddress } // ensure the sourceEntityAddress has the appropriate role
        );

        console.log('Sell transaction executed successfully');

        callback(); // successfully end the execution
    } catch (error) {
        console.error(error);
        callback(error); // signal the execution finished with an error
    }
};
