import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from 'next/image';
import NetworkSelect from "../popups/NetworkSelect";
import { networks } from "../../utils/networks";
import { toUSD } from "../../scripts/prices";
import WalletView from "../popups/WalletView";
import erc20Abi from "../../utils/erc20Abi";
import { ethers } from "ethers";

import { useFun } from "../../contexts/funContext";

export default function Main(props) {

  const router = useRouter();

  const { wallet, setWallet, eoa, setEOA, network, setLoading } = useFun()

  const [balance, setBalance] = useState(0);
  const [balanceUSD, setBalanceUSD] = useState("0.00");
  const [ecoBalance, setEcoBalance] = useState("0.00");
  const [ecoBalanceUSD, setEcoBalanceUSD] = useState("0.00");
  const [usdcBalance, setUsdcBalance] = useState("0.00");
  const [usdcBalanceUSD, setUsdcBalanceUSD] = useState("0.00");
  const [walletCreated, setWalletCreated] = useState()

  useEffect(() => {
    if(localStorage.getItem("fun-wallet-addr") !== wallet?.address && !wallet.deployed){
      setWalletCreated(true);
      localStorage.setItem("fun-wallet-addr", wallet.address)
      setTimeout(() => {
        setWalletCreated(false)
      }, 2500)
    }
  }, [wallet])

  function goToPage(path){
    setLoading(true);
    router.push(path)
  }

  useEffect(() => {
    if (networks[network]) {
      if (wallet?.address) {
        let provider = eoa.signer ? eoa.signer.provider : eoa.provider;
        provider.getBalance(wallet.address).then((balance) => {
          balance = ethers.utils.formatEther(balance);
          setBalance(Number(balance).toFixed(6))
          toUSD("ETH", balance).then((usd) => {
            setBalanceUSD(usd)
          })
        }).catch((e) => {
          console.log(e)
        });
        getCoinBalances(provider);
      }
    }
  }, [network])

  async function getCoinBalances(provider) {
    const ecoContract = new ethers.Contract("0x439882DF6914776E40726027aDC9631cA26B17bd", erc20Abi, provider);
    let ecoBalance = await ecoContract.balanceOf(wallet.address)
    ecoBalance = ethers.utils.formatUnits(ecoBalance, 6)
    setEcoBalance(Number(ecoBalance.toString()).toFixed(2))
    setEcoBalanceUSD(await toUSD("ECO", ecoBalance));

    const usdcContract = new ethers.Contract("0xaa8958047307da7bb00f0766957edec0435b46b5", erc20Abi, provider);
    let usdcBalance = await usdcContract.balanceOf(wallet.address)
    usdcBalance = ethers.utils.formatUnits(usdcBalance, 6)
    setUsdcBalance(Number(usdcBalance.toString()).toFixed(2))
    setUsdcBalanceUSD(await toUSD("USDC", usdcBalance));
  }

  return (
    <div className="w-full">

      {walletCreated && (
        <div className="alert w-full flex justify-between -mb-[58px] relative">
          <div className="flex items-center">
            <Image src="/created.svg" width="24" height="24" alt=""/>
            <div className="text-[#101828] font-medium ml-3">{`Congrats! Eco Wallet Created`}</div>
          </div>
        </div>
      )}

      <div className="w-full bg-[#08132D] rounded-xl py-6 px-8 flex flex-col items-center cursor-default">
        <div className="flex items-end">
          <div className="font-black text-3xl text-white">{ecoBalance}</div>
          <div className="font-bold text-lg text-[#9BA0CC] ml-1">ECO</div>
        </div>
        <div className="text-[#7BFAFC] text-lg font-bold">{`$${(Number(balanceUSD) + Number(ecoBalanceUSD) + Number(usdcBalanceUSD)).toFixed(2) }`}</div>

        <div className="flex items-center w-full justify-between mt-8">
          <div className="flex items-center">
            <Image src="/eco.svg" width="40" height="40" alt=""/>
            <div className="ml-4">
              <div className="font-bold text-white text-lg">ECO</div>
              <div className="text-[#9BA0CC]">{`${ecoBalance} ECO`}</div>
            </div>
          </div>
          <div className="text-white">{`$${ecoBalanceUSD}`}</div>
        </div>

        <div className="flex items-center w-full justify-between mt-8">
          <div className="flex items-center">
            <Image src="/ethereum.svg" width="40" height="40" alt=""/>
            <div className="ml-4">
              <div className="font-bold text-white text-lg">ETH</div>
              <div className="text-[#9BA0CC]">{`${balance} ETH`}</div>
            </div>
          </div>
          <div className="text-white">{`$${balanceUSD}`}</div>
        </div>

        <div className="flex items-center w-full justify-between mt-8">
          <div className="flex items-center">
            <Image src="/usdc.svg" width="40" height="40" alt=""/>
            <div className="ml-4">
              <div className="font-bold text-white text-lg">USD Coin</div>
              <div className="text-[#9BA0CC]">{`${usdcBalance} USD`}</div>
            </div>
          </div>
          <div className="text-white">{`$${usdcBalanceUSD}`}</div>
        </div>

      </div>
      

      <div className="w-full mt-4">
        <div className="actionBtn rounded-xl flex items-center text-sm p-4 mt-4" onClick={() => goToPage("/swap")}>
          <Image src="/swap.svg" width="40" height="40" alt=""/>
          <div className="ml-3">
            <div className="font-medium text-white">Uniswap</div>
            <div className="text-[#606876]">A decentralized exchange protocol that enables automated liquidity provision and trading on Ethereum.</div>
          </div>
        </div>
        <div className="actionBtn rounded-xl flex items-center text-sm mt-4 p-4" onClick={() => goToPage("/transfer")}>
          <Image src="/transfer.svg" width="40" height="40" alt=""/>
          <div className="ml-3">
            <div className="font-medium text-white">Token Transfer</div>
            <div className="text-[#606876]">A smart wallet is the secure movement of digital assets from one wallet to another.</div>
          </div>
        </div>
      </div>
    </div>
  )
}
