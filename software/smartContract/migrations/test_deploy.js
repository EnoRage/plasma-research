const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '../../commons/config/config.verifier.json');
const BankexPlasmaJSON = path.join(__dirname, '../build/contracts/BankexPlasma.json');
const Tx = require('ethereumjs-tx');
const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:9545'));
const solc = require('solc');


const clean_input = function(str) {
    if ((typeof str === 'number') || (str.isBigNumber === true)) str = `${ str.toString(16) }`
    if ((!str) || (typeof str !== 'string') || (str === '0x')) str = '00'
    if (str.indexOf('0x') === 0) str = str.substr(2)
    if (str.length % 2 === 1) str = `0${str}`
    return `0x${str}`
};

(async function deploy() {
    // const BankexPlasma = JSON.parse(fs.readFileSync(BankexPlasmaJSON, 'utf8'));
    // console.log(BankexPlasma)
    // const bytecode = BankexPlasma.bytecode;
    // console.log(bytecode)
    const bytecode = "0x6080604081905260008054600160a060020a0319163317808255600160a060020a0316917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0908290a3611454806100576000396000f3006080604052600436106100cf5763ffffffff7c0100000000000000000000000000000000000000000000000000000000600035041663150b7a0281146100d457806347097aea146101785780636680c548146101f9578063715018a6146102ab5780638ce0b5a2146102c25780638da5cb5b146102d75780638f32d59b1461030857806397feb92614610331578063d0e30db014610355578063d29a4bf61461035d578063dce1e77214610381578063f25b3f99146103a5578063f2fde38b146103bd578063f3b6eb91146103de575b600080fd5b3480156100e057600080fd5b50604080516020601f60643560048181013592830184900484028501840190955281845261014394600160a060020a0381358116956024803590921695604435953695608494019181908401838280828437509497506103f39650505050505050565b604080517fffffffff000000000000000000000000000000000000000000000000000000009092168252519081900360200190f35b34801561018457600080fd5b5060408051602060046024803582810135601f81018590048502860185019096528585526101e79583359536956044949193909101919081908401838280828437509497505084359550505050602090910135600160a060020a03169050610536565b60408051918252519081900360200190f35b34801561020557600080fd5b5060408051602060046024803582810135601f81018590048502860185019096528585526101e795833595369560449491939091019190819084018382808284375050604080516020888301358a018035601f8101839004830284018301909452838352979a89359a8a830135600160a060020a03169a919990985060609091019650919450908101925081908401838280828437509497506105609650505050505050565b3480156102b757600080fd5b506102c06106ff565b005b3480156102ce57600080fd5b506101e7610769565b3480156102e357600080fd5b506102ec610770565b60408051600160a060020a039092168252519081900360200190f35b34801561031457600080fd5b5061031d61077f565b604080519115158252519081900360200190f35b34801561033d57600080fd5b506102c0600160a060020a0360043516602435610790565b6102c0610a41565b34801561036957600080fd5b506102c0600160a060020a0360043516602435610b8b565b34801561038d57600080fd5b506102ec600160a060020a0360043516602435610df6565b3480156103b157600080fd5b506102ec600435610ea3565b3480156103c957600080fd5b506102c0600160a060020a0360043516610ecf565b3480156103ea57600080fd5b506102ec610eee565b6000600160a060020a038516301461047b576040805160e560020a62461bcd02815260206004820152602f60248201527f4f6e6c79207468697320636f6e74726163742073686f756c64206465706f736960448201527f742045524337323120746f6b656e730000000000000000000000000000000000606482015290519081900360840190fd5b600254600160a060020a03166104913385610df6565b600160a060020a0316146104ef576040805160e560020a62461bcd02815260206004820152601d60248201527f45524337323120746f6b656e20776173206e6f74206578706563746564000000604482015290519081900360640190fd5b506002805473ffffffffffffffffffffffffffffffffffffffff191690557f150b7a0200000000000000000000000000000000000000000000000000000000949350505050565b600061054061077f565b151561054b57600080fd5b61055785858585610f06565b50949350505050565b6000806000878787876040516020018085815260200184805190602001908083835b602083106105a15780518252601f199092019160209182019101610582565b6001836020036101000a03801982511681845116808217855250505050505090500183815260200182600160a060020a0316600160a060020a03166c010000000000000000000000000281526014019450505050506040516020818303038152906040526040518082805190602001908083835b602083106106345780518252601f199092019160209182019101610615565b6001836020036101000a0380198251168184511680821785525050505050509050019150506040518091039020915061066c82611104565b905061067881856111ae565b600160a060020a0316610689610770565b600160a060020a0316146106e7576040805160e560020a62461bcd02815260206004820152601160248201527f496e76616c6964207369676e6174757265000000000000000000000000000000604482015290519081900360640190fd5b6106f388888888610f06565b98975050505050505050565b61070761077f565b151561071257600080fd5b60008054604051600160a060020a03909116907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0908390a36000805473ffffffffffffffffffffffffffffffffffffffff19169055565b6001545b90565b600054600160a060020a031690565b600054600160a060020a0316331490565b600080600084600160a060020a03166370a08231306040518263ffffffff167c01000000000000000000000000000000000000000000000000000000000281526004018082600160a060020a0316600160a060020a03168152602001915050602060405180830381600087803b15801561080957600080fd5b505af115801561081d573d6000803e3d6000fd5b505050506040513d602081101561083357600080fd5b50519250610852600160a060020a03861633308763ffffffff61128316565b604080517f70a0823100000000000000000000000000000000000000000000000000000000815230600482015290516108f1918591600160a060020a038916916370a082319160248083019260209291908290030181600087803b1580156108b957600080fd5b505af11580156108cd573d6000803e3d6000fd5b505050506040513d60208110156108e357600080fd5b50519063ffffffff61133416565b6040805182815290519193503391600160a060020a038816917fe33e9822e3317b004d587136bab2627ea1ecfbba4eb79abddd0a56cfdd09c0e1919081900360200190a36040805183815290513391600160a060020a038816917f01527be533d184d44e3111afa7800fa60ced6e1b44bd025f8b457deb8ce0ce359181900360200190a3604080516c01000000000000000000000000600160a060020a038816810260208084019190915233919091026034830152604880830186905283518084039091018152606890920192839052815191929182918401908083835b602083106109ee5780518252601f1990920191602091820191016109cf565b51815160209384036101000a600019018019909216911617905260408051929094018290039091203360009081526003835293842080546001810182559085529190932001919091555050505050505050565b60408051348152905160009133917f7d6babeeae6799e032644c4c2d100c2ab47a967aec6115cf3ec5c09b818a62b69181900360200190a2604080513481529051339173eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee917f01527be533d184d44e3111afa7800fa60ced6e1b44bd025f8b457deb8ce0ce359181900360200190a333346040516020018083600160a060020a0316600160a060020a03166c01000000000000000000000000028152601401828152602001925050506040516020818303038152906040526040518082805190602001908083835b60208310610b3c5780518252601f199092019160209182019101610b1d565b51815160209384036101000a6000190180199092169116179052604080519290940182900390912033600090815260038352938420805460018101825590855291909320019190915550505050565b600080610b988484610df6565b6002805473ffffffffffffffffffffffffffffffffffffffff1916600160a060020a0383811691909117909155604080517f42842e0e000000000000000000000000000000000000000000000000000000008152336004820152306024820152604481018790529051929450908616916342842e0e9160648082019260009290919082900301818387803b158015610c2f57600080fd5b505af1158015610c43573d6000803e3d6000fd5b5050600254600160a060020a0316159150610caa9050576040805160e560020a62461bcd02815260206004820152601960248201527f45524337323120746f6b656e206e6f7420726563656976656400000000000000604482015290519081900360640190fd5b60405183903390600160a060020a038716907f20d9d42fbcdd65fce5c3986b701b04ffb8e09852d04a93422dd4be124ae10a8e90600090a46040805184815290513391600160a060020a038516917f01527be533d184d44e3111afa7800fa60ced6e1b44bd025f8b457deb8ce0ce359181900360200190a360408051600160a060020a038481166c010000000000000000000000009081026020808501919091529188168102603484015233026048830152605c80830187905283518084039091018152607c90920192839052815191929182918401908083835b60208310610da45780518252601f199092019160209182019101610d85565b51815160209384036101000a6000190180199092169116179052604080519290940182900390912033600090815260038352938420805460018101825590855291909320019190915550505050505050565b600082826040516020018083600160a060020a0316600160a060020a03166c01000000000000000000000000028152601401828152602001925050506040516020818303038152906040526040518082805190602001908083835b60208310610e705780518252601f199092019160209182019101610e51565b5181516020939093036101000a600019018019909116921691909117905260405192018290039091209695505050505050565b6000600182815481101515610eb457fe5b600091825260209091200154600160a060020a031692915050565b610ed761077f565b1515610ee257600080fd5b610eeb8161134b565b50565b73eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee81565b60008060008060008060148951811515610f1c57fe5b60015491900495508a14610f7a576040805160e560020a62461bcd02815260206004820152601160248201527f496e76616c69642066726f6d496e646578000000000000000000000000000000604482015290519081900360640190fd5b891580610fb2575086600160a060020a0316600189815481101515610f9b57fe5b600091825260209091200154600160a060020a0316145b1515611008576040805160e560020a62461bcd02815260206004820152601c60248201527f57726f6e672070726f74656374656420626c6f636b206e756d62657200000000604482015290519081900360640190fd5b60015461101b908b63ffffffff61133416565b935061102d8a8663ffffffff6113c816565b6110386001826113e1565b508392505b848310156110b7578260140260200190506c01000000000000000000000000818a0151049150816001848c0181548110151561107557fe5b6000918252602090912001805473ffffffffffffffffffffffffffffffffffffffff1916600160a060020a03929092169190911790556001929092019161103d565b848410156110f6576001546040805142815290517ff32c68e7736e0f3f51cf7e6d33003550534f6ce10665ed8430cd92d66b0bbb999181900360200190a25b505050900395945050505050565b604080517f19457468657265756d205369676e6564204d6573736167653a0a333200000000602080830191909152603c80830185905283518084039091018152605c909201928390528151600093918291908401908083835b6020831061117c5780518252601f19909201916020918201910161115d565b5181516020939093036101000a6000190180199091169216919091179052604051920182900390912095945050505050565b600080600080845160411415156111c8576000935061127a565b50505060208201516040830151606084015160001a601b60ff821610156111ed57601b015b8060ff16601b1415801561120557508060ff16601c14155b15611213576000935061127a565b60408051600080825260208083018085528a905260ff8516838501526060830187905260808301869052925160019360a0808501949193601f19840193928390039091019190865af115801561126d573d6000803e3d6000fd5b5050506020604051035193505b50505092915050565b604080517f23b872dd000000000000000000000000000000000000000000000000000000008152600160a060020a0385811660048301528481166024830152604482018490529151918616916323b872dd916064808201926020929091908290030181600087803b1580156112f757600080fd5b505af115801561130b573d6000803e3d6000fd5b505050506040513d602081101561132157600080fd5b5051151561132e57600080fd5b50505050565b6000808383111561134457600080fd5b5050900390565b600160a060020a038116151561136057600080fd5b60008054604051600160a060020a03808516939216917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e091a36000805473ffffffffffffffffffffffffffffffffffffffff1916600160a060020a0392909216919091179055565b6000828201838110156113da57600080fd5b9392505050565b8154818355818111156114055760008381526020902061140591810190830161140a565b505050565b61076d91905b808211156114245760008155600101611410565b50905600a165627a7a72305820337678ada02e622469f46855de60a50f91b962ede361677460579d30ab6ee3510029";

    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const deployerAddress = data.main_account_public_key;
    const privateKey = Buffer.from(data.main_account_private_key, 'hex');
    const txParams = {
        gasPrice: clean_input(30000000),
        gasLimit: clean_input('0x100000'),
        gas:      clean_input(2100000),
        from:     clean_input(deployerAddress),
        nonce:    clean_input(await web3.eth.getTransactionCount(deployerAddress)),
        value:    clean_input(0),
        data:     clean_input(bytecode)
    };
    const tx = new Tx(txParams);
    tx.sign(privateKey);
    const serializedTx = tx.serialize();
    const txHash = await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'));
    console.log("BankexPlasma address: " + txHash.contractAddress);
    console.log("TxHash: " + txHash.transactionHash);
    data.smart = txHash.contractAddress;
    fs.writeFileSync(filePath, JSON.stringify(data));
})();