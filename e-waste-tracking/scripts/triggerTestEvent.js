const EWasteTracking = artifacts.require("EWasteTracking"); // Replace with the name of your contract

module.exports = async (callback) => {
    const contract = await EWasteTracking.deployed();
    await contract.triggerTestEvent();
    callback();
};