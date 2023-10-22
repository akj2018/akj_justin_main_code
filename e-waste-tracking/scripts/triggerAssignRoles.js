const contractArtifacts = artifacts.require("EWasteTracking");

module.exports = async (callback) => {
    try {
        const eWasteTracking = await contractArtifacts.deployed();

        const accounts = await web3.eth.getAccounts();
        const admin = accounts[0];
        const manufacturer = accounts[1];
        const consumer = accounts[2];
        const refurbisher = accounts[3];
        const recycler = accounts[4];
        const distributor = accounts[5];
        const retailer = accounts[6];
        const govt = accounts[7];
        const environmentalAgency = accounts[8];

        // Grant and inform manufacturer role
        await eWasteTracking.grantRole(web3.utils.sha3("MANUFACTURER_ROLE"), manufacturer, { from: admin });
        // await eWasteTracking.informRoleAssignment("MANUFACTURER_ROLE", manufacturer, { from: admin });

        // Grant and inform consumer role
        await eWasteTracking.grantRole(web3.utils.sha3("CONSUMER_ROLE"), consumer, { from: admin });
        // await eWasteTracking.informRoleAssignment("CONSUMER_ROLE", consumer, { from: admin });

        // Grant and inform refurbisher role
        await eWasteTracking.grantRole(web3.utils.sha3("REFURBISHER_ROLE"), refurbisher, { from: admin });
        // await eWasteTracking.informRoleAssignment("REFURBISHER_ROLE", refurbisher, { from: admin });

        // Grant and inform recycler role
        await eWasteTracking.grantRole(web3.utils.sha3("RECYCLER_ROLE"), recycler, { from: admin });
        // await eWasteTracking.informRoleAssignment("RECYCLER_ROLE", recycler, { from: admin });

        // Grant and inform distributor role
        await eWasteTracking.grantRole(web3.utils.sha3("DISTRIBUTOR_ROLE"), distributor, { from: admin });
        // await eWasteTracking.informRoleAssignment("DISTRIBUTOR_ROLE", distributor, { from: admin });

        // Grant and inform retailer role
        await eWasteTracking.grantRole(web3.utils.sha3("RETAILER_ROLE"), retailer, { from: admin });
        // await eWasteTracking.informRoleAssignment("RETAILER_ROLE", retailer, { from: admin });

        // Grant and inform environment role
        await eWasteTracking.grantRole(web3.utils.sha3("ENVIRONMENT_ROLE"), environmentalAgency, { from: admin });
        // await eWasteTracking.informRoleAssignment("ENVIRONMENT_ROLE", environmentalAgency, { from: admin });

        // Grant and inform government role
        await eWasteTracking.grantRole(web3.utils.sha3("GOVERNMENT_ROLE"), govt, { from: admin });
        // await eWasteTracking.informRoleAssignment("GOVERNMENT_ROLE", govt, { from: admin });

        console.log('Roles assigned successfully');

        callback(); // successfully end the execution
    } catch (error) {
        console.error(error);
        callback(error); // signal the execution finished with an error
    }
};

