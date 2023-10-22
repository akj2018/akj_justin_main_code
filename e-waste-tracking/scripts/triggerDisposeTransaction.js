const contractArtifacts = artifacts.require("EWasteTracking");

module.exports = async (callback) => {
    try {
        const eWasteTracking = await contractArtifacts.deployed();

        // Sample data (Modify as per your needs)
        const imeiNumber = 123456789012345; // Example IMEI
        const sourceEntityType = "consumer"; // Example source entity type
        const disposalMethod = "Crushing";
        const disposalDate = "2023-10-22"; // Current date as an example
        const disposalLocation = "Disposal Center, CA";

        const accounts = await web3.eth.getAccounts();
        const sourceEntityAddress = accounts[2]; // consumer


        await eWasteTracking.disposeTransaction(
            imeiNumber, 
            sourceEntityType,
            sourceEntityAddress,
            disposalMethod,
            disposalDate,
            disposalLocation,
            { from: sourceEntityAddress } // ensure the sourceEntityAddress has the appropriate role
        );

        console.log('Dispose transaction executed successfully');

        callback(); // successfully end the execution
    } catch (error) {
        console.error(error);
        callback(error); // signal the execution finished with an error
    }
};
