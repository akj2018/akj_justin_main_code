const contractArtifacts = artifacts.require("EWasteTracking");

module.exports = async (callback) => {
    try {
        const eWasteTracking = await contractArtifacts.deployed();

        const accounts = await web3.eth.getAccounts();
        const manufacturer = accounts[1]; // Assuming the manufacturer's account is at index 1, as per your earlier code
        
        // Sample data for creating a new passport. You can modify these values.
        const _phoneName = "iPhone 12 Pro";
        const _imeiNumber = 123456789012345;
        const _manufacturer = "Apple";
        const _manufactureDate = new Date("2020-10-23").getTime() / 1000; // Convert to Unix timestamp format
        const _expectedLifecycle = 5;
        const _isBatteryRemovable = false;

        // Call to create a new passport
        await eWasteTracking.createNewPassport(
            _imeiNumber,
            _phoneName,
            _manufacturer,
            _expectedLifecycle,
            _manufactureDate,
            _isBatteryRemovable,
            { from: manufacturer }
        );

        console.log('Passport created successfully');

        // Data for additional details
        const _is5GCapable = true;
        const _releaseDate = _manufactureDate;  // Assuming release date same as manufacture date
        const _os = "iOS";
        const _chipset = "Apple A14 Bionic";
        const _memory = 128;
        const _batteryType = "Lithium-ion";
        const _condition = "Very Good";
        const _additionalExpectedLifecycle = 5;
        const _achievedLifecycle = 0; // You can adjust this value according to your needs

        // Call to update additional details
        await eWasteTracking.updateAdditionalDetails(
            _imeiNumber,
            _is5GCapable,
            _releaseDate,
            _os,
            _chipset,
            _memory,
            _batteryType,
            _condition,
            _additionalExpectedLifecycle,
            _achievedLifecycle,
            { from: manufacturer }
        );

        console.log('Additional details updated successfully');

        // Data for components
        const componentNames = [
            "Central Processing Unit (CPU)",
            "Display Screen",
            "Battery"
        ];
        
        const materials = [
            "Silicon",
            "Gorilla Glass",
            "Lithium-ion"
        ];

        // Call to add components to the passport
        await eWasteTracking.addComponentsToPassport(
            _imeiNumber,
            componentNames,
            materials,
            { from: manufacturer }
        );

        console.log('Components added successfully');

        callback(); // successfully end the execution
    } catch (error) {
        console.error(error);
        callback(error); // signal the execution finished with an error
    }
};
