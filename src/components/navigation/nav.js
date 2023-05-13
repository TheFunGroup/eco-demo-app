import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from 'next/image';
import { networks } from "../../utils/networks";
import { useFun } from "../../contexts/funContext";
import { toUSD } from "../../scripts/prices";
import { ethers } from "ethers";
import erc20Abi from "../../utils/erc20Abi";
import { QRCode } from 'react-qrcode-logo';

export default function Nav(props) {

  const router = useRouter();
  const { wallet, setWallet, eoa, setEOA, network, setLoading } = useFun()

  const [showQR, setShowQR] = useState(false)
  const [showCopy, setShowCopy] = useState(false)
  const [copying, setCopying] = useState(false)

  const [addr, setAddr] = useState("")

  useEffect(() => {
    if (networks[network]) {
      if (wallet?.address) {
        setAddr(wallet.address);
      }
    }
  }, [network])

  function handleCopyAddr() {
    var copyText = document.createElement('input');
    copyText.style.position = "absolute";
    copyText.style.top = "-1250000px";
    copyText.value = addr;
    document.body.appendChild(copyText);
    copyText.select();
    copyText.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(copyText.value);
    setCopying(true)
    setTimeout(() => {
      setCopying(false)
    }, 1500)
  }

  return (
    <div className="w-full flex items-center justify-between p-2 mb-10">
      <div className="flex items-center">
        <Image src='eco.svg' width="48" height="48" alt=""/>
        <div className="font-black text-2xl text-white">Welcome Eco!</div>
      </div>
      <div className="flex items-center">
        <div
          onMouseEnter={() => setShowCopy(true)}
          onMouseLeave={() => setShowCopy(false)}
          onClick={handleCopyAddr}
          className="cursor-pointer mt-[2px]"
        >
          {(showCopy || copying) && (<div className="copy -mr-[8px] text-sm">{copying ? "Copied!" : "Click to Copy"}</div>)}
          <div className="font-mono text-sm text-[#9BA0CC] mr-1" >{`${addr.substring(0, 5)}...${addr.substring(addr.length - 4)}`}</div>
        </div>
        <Image src="/qr.svg" width="16" height="16" alt="" className="ml-[6px] cursor-pointer"
          onClick={() => setShowQR(true)}
        />
      </div>
    </div>
  )
}
