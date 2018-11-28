const BankexPlasma = artifacts.require('BankexPlasma');
const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '../../commons/config/config.verifier.json');

module.exports = function (deployer) {
    deployer.then(async function () {
        // deployContract("BankexPlasma")
        const contractAddress = await BankexPlasma.new();
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        data.smart = contractAddress.address;
        console.log("BankexPlasma address: " + contractAddress.address)
        fs.writeFileSync(filePath, JSON.stringify(data));
    });
};