const contractArtifacts = artifacts.require("EWasteTracking");

module.exports = async (callback) => {
    try {
        const eWasteTracking = await contractArtifacts.deployed();

        // Sample data (Modify as per your needs)

        const imeiNumber = 123456789012345; // Example IMEI
        const sourceEntityType = "consumer"; // Example source entity type
        const targetEntityType = "recycler"; // Example target entity type

        const accounts = await web3.eth.getAccounts();
        const sourceEntityAddress = accounts[2]; // consumer
        const targetEntityAddress = accounts[4]; // recycler


        await eWasteTracking.giveTransaction(
            imeiNumber, 
            sourceEntityType,
            targetEntityType,
            sourceEntityAddress,
            targetEntityAddress, 
            { from: sourceEntityAddress } // ensure the sourceEntityAddress has the appropriate role
        );

        console.log('Give transaction executed successfully');

        callback(); // successfully end the execution
    } catch (error) {
        console.error(error);
        callback(error); // signal the execution finished with an error
    }
};
