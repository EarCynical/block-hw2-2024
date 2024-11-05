import {Button, Image, Modal, Input, List} from 'antd';
import {UserOutlined} from "@ant-design/icons";
import {useEffect, useState} from 'react';
import {buyMyRoomContract,web3} from "../../utils/contracts";
import './index.css';

const GanacheTestChainId = '0x539' // Ganache默认的ChainId = 0x539 = Hex(1337)
// TODO change according to your configuration
const GanacheTestChainName = 'Ganache Test Chain'
const GanacheTestChainRpcUrl = 'http://127.0.0.1:8545'

const HousePage = () => {
    const [account, setAccount] = useState('')
    const [MyHouses, setMyHouses] = useState<Array<{ tokenId: number; owner: string; listedTimestamp: number; price: number; isListed: boolean }>>([]);
    const [ListedHouses, setListedHouses] = useState<Array<{ tokenId: number; owner: string; listedTimestamp: number; price: number; isListed: boolean }>>([]);
    const [prices, setPrices] = useState(Array(100).fill(''));

    useEffect(() => {
        // 初始化检查用户是否已经连接钱包
        // 查看window对象里是否存在ethereum（metamask安装后注入的）对象
        const initCheckAccounts = async () => {
            // @ts-ignore
            const {ethereum} = window;
            if (Boolean(ethereum && ethereum.isMetaMask)) {
                // 尝试获取连接的用户账户
                const accounts = await web3.eth.getAccounts()
                if(accounts && accounts.length) {
                    setAccount(accounts[0])
                }
            }
        }
        initCheckAccounts()
    }, [])

    const onGetHouses = async () => {
        if(account === '') {
            alert('You have not connected wallet yet.')
            return
        }

        if (buyMyRoomContract) {
            try {
                await buyMyRoomContract.methods.getHouses().send({from: account})
                alert('You have claimed houses.')
            } catch (error: any) {
                alert(error.message)
            }

        } else {
            alert('Contract not exists.')
        }
    }

    const onMyHouses = async () => {
        if(account === '') {
            alert('You have not connected wallet yet.')
            return
        }

        if (buyMyRoomContract) {
            try {
                setMyHouses([]);
                const ownedHouses = await buyMyRoomContract.methods.getOwnedHouses().call({from: account})
                console.log('ownedHouses:', ownedHouses);
                const houses = ownedHouses.map((house: any) => ({
                    tokenId: house.tokenID,
                    owner: house.owner,
                    listedTimestamp: house.listedTimestamp,
                    price: house.price,
                    isListed: house.isListed,
                }));
                setMyHouses(houses);
                alert('You have got your houses.')
            } catch (error: any) {
                alert(error.message)
            }

        } else {
            alert('Contract not exists.')
        }
    }

    const onListedHouses = async () => {
        if(account === '') {
            alert('You have not connected wallet yet.')
            return
        }

        if (buyMyRoomContract) {
            try {
                setListedHouses([]);
                const ListHouses = await buyMyRoomContract.methods.getListedHouses().call({from: account})
                console.log('ownedHouses:', ListHouses);
                const lhouses = ListHouses.map((house: any) => ({
                    tokenId: house.tokenID,
                    owner: house.owner,
                    listedTimestamp: house.listedTimestamp,
                    price: house.price,
                    isListed: house.isListed,
                }));
                setListedHouses(lhouses);
                alert('You have checked listed house.')
            } catch (error: any) {
                alert(error.message)
            }

        } else {
            alert('Contract not exists.')
        }
    }

    const onListHouse = async (tokenId:number) => {
        if(account === '') {
            alert('You have not connected wallet yet.')
            return
        }

        if (buyMyRoomContract) {
            try {
                const priceValue = parseInt(prices[tokenId], 10);
                console.log(`房屋 ${tokenId} 的挂单价格: ${priceValue}`);
              //  console.log(`挂单价格: ${priceValue}`);
                const ownedHouses = await buyMyRoomContract.methods.listHouse(tokenId,priceValue).send({from: account})
            } catch (error: any) {
                alert(error.message)
            }

        } else {
            alert('Contract not exists.')
        }
    }

    const onunListHouse = async (tokenId:number) => {
        if(account === '') {
            alert('You have not connected wallet yet.')
            return
        }

        if (buyMyRoomContract) {
            try {
                const ownedHouses = await buyMyRoomContract.methods.unlistHouse(tokenId).send({from: account})
            } catch (error: any) {
                alert(error.message)
            }

        } else {
            alert('Contract not exists.')
        }
    }

    const onBuyHouse = async (tokenId:number,price:number) => {
        if(account === '') {
            alert('You have not connected wallet yet.')
            return
        }

        if (buyMyRoomContract) {
            try {
                console.log(`购买房屋 ${tokenId}  价格: ${price}`);
                const ownedHouses = await buyMyRoomContract.methods.buyHouse(tokenId).send({from: account,value:price,gas:300000})
            } catch (error: any) {
                alert(error.message)
            }

        } else {
            alert('Contract not exists.')
        }
    }

    return (
        <div className='container'>
            <div className='main'>
                <div>当前用户：{account === '' ? '无用户连接' : account}</div>
                <Button onClick={onGetHouses}>领取房屋</Button>
            </div>
            <div className='main'>
                <Button onClick={onMyHouses}>我的房屋</Button>
            </div>
            <div className='main'>
                <Button onClick={onListedHouses}>查看出售中房产</Button>
            </div>
            <h2 style={{margin: '0'}}>我的房屋</h2>
            <div className="house-list">
                {MyHouses.length > 0 ? (
                    MyHouses.map((house, index) => (
                        <div key={index} className="house-card">
                            <p>房屋编号: {house.tokenId}</p>
                            <p>拥有者: {house.owner}</p>
                            <p>是否挂单: {house.isListed ? '已挂单' : '未挂单'}</p>
                            <p>价格: {house.price}</p>
                            <Input
                                placeholder="请输入价格"
                                value={prices[house.tokenId]}
                                onChange={(e) => {
                                    const newPrices = [...prices]; // 创建新数组
                                    newPrices[house.tokenId] = e.target.value; // 更新对应房屋的输入价格
                                    setPrices(newPrices); // 更新状态
                                }}
                            />
                            <Button onClick={() => onListHouse(house.tokenId)}>挂单</Button>
                            <Button onClick={() => onunListHouse(house.tokenId)}>取消挂单</Button>
                        </div>
                    ))
                ) : (
                    <p>No houses found for this user.</p>
                )}
            </div>
            <h2 style={{margin: '0'}}>出售中房产</h2>
            <div className="house-list">
                {ListedHouses.length > 0 ? (
                    ListedHouses.map((house, index) => (
                        <div key={index} className="house-card">
                            <p>房屋编号: {house.tokenId}</p>
                            <p>拥有者: {house.owner}</p>
                            <p>价格: {house.price}</p>
                            <Button onClick={() => onBuyHouse(house.tokenId, house.price)}>购买</Button>
                        </div>
                    ))
                ) : (
                    <p>No houses found on sale.</p>
                )}
            </div>
        </div>
    )
}

export default HousePage