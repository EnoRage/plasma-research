package events

import (
	"context"
	"fmt"
	"log"
	"math/big"
	"strconv"
	"strings"
	"time"

	"github.com/BANKEX/plasma-research/src/contracts/api"
	"github.com/BANKEX/plasma-research/src/node/blockchain"
	"github.com/BANKEX/plasma-research/src/node/operator/blockPublicher"
	"github.com/BANKEX/plasma-research/src/node/types/slice"
	"github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"
)

type EventAssetDeposited struct {
	Who         common.Address
	IntervalId  uint64
	Begin       uint64
	End         uint64
	BlockNumber uint64
}

var eventGroup = make([]EventAssetDeposited, 0)
var currentBlock uint64 = 0
var client *ethclient.Client
var manager *blockPublicher.TransactionManager

func GetEvent(contractAddress common.Address) bool {
	maxBlock, err := client.HeaderByNumber(context.Background(), nil)
	if err != nil {
		log.Fatal(err)
	}

	query := ethereum.FilterQuery{
		FromBlock: big.NewInt(int64(currentBlock)),
		ToBlock:   big.NewInt(int64(checker(currentBlock, maxBlock.Number.Uint64()))),
		Addresses: []common.Address{
			contractAddress,
		},
	}

	logs, err := client.FilterLogs(context.Background(), query)
	if err != nil {
		log.Fatal(err)
	}

	contractAbi, err := abi.JSON(strings.NewReader(string(api.BankexPlasmaABI)))
	if err != nil {
		log.Fatal(err)
	}

	Sig := []byte("AssetDeposited(address,address,uint64,uint64,uint64)")
	SigHash := crypto.Keccak256Hash(Sig)

	for _, vLog := range logs {
		switch vLog.Topics[0].Hex() {
		case SigHash.Hex():
			var depositEvent EventAssetDeposited
			err := contractAbi.Unpack(&depositEvent, "AssetDeposited", vLog.Data)
			if err != nil {
				log.Fatal(err)
			}
			depositEvent.Who = common.HexToAddress(vLog.Topics[2].Hex())
			depositEvent.BlockNumber = vLog.BlockNumber
			PutEventsToGroup(depositEvent)

			out := blockchain.Output{
				Owner: depositEvent.Who.Bytes(),
				Slice: slice.Slice{
					Begin: uint32(depositEvent.Begin),
					End:   uint32(depositEvent.End),
				},
			}
			_, err = manager.AssembleDepositBlock(out)
			if err != nil {
				log.Fatal(err)
			}
		}
	}

	if currentBlock <= maxBlock.Number.Uint64()+1 {
		SetLastBlock(currentBlock + 1)
	}

	if currentBlock >= maxBlock.Number.Uint64() {
		return false
	}
	return true
}

func SetLastBlock(v uint64) {
	currentBlock = v
}

func checker(current, final uint64) uint64 {
	if current+1 <= final {
		current = current + 1
	} else {
		delta := final - current
		current = current + delta
	}
	return current
}

func PutEventsToGroup(e EventAssetDeposited) {
	eventGroup = append(eventGroup, e)
}

func ShowGroup() {
	for i := range eventGroup {
		fmt.Printf("BlockNumber: %d\n", eventGroup[i].BlockNumber)
		fmt.Printf("Amount: %d\n", eventGroup[i].Begin-eventGroup[i].End)
		fmt.Printf("Who: %s\n", eventGroup[i].Who.String())
	}
}
func EventListener(m *blockPublicher.TransactionManager, contractAddress common.Address, endpointAddress string) {
	c, err := ethclient.Dial(endpointAddress)
	if err != nil {
		log.Fatal(err)
	}
	client = c
	manager = m

	for {
		if !GetEvent(contractAddress) {
			break
		}
	}
}

var round int

func EventShow() {
	for {
		fmt.Println("Show round " + strconv.Itoa(round))
		round++
		ShowGroup()
		time.Sleep(time.Second * 15)
	}
}
