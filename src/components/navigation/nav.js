import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import Image from 'next/image';
import { networks } from "../../utils/networks";
import { useFun } from "../../contexts/funContext";
import { toUSD } from "../../scripts/prices";
import { ethers } from "ethers";
import erc20Abi from "../../utils/erc20Abi";
import { disconnect } from '@wagmi/core'
import { QRCode } from 'react-qrcode-logo';
import { useOnClickOutside } from "../../hooks/useOnClickOutside";

export default function Nav(props) {

  const router = useRouter();
  const { wallet, setWallet, eoa, setEOA, network, setLoading } = useFun()

  const [showQR, setShowQR] = useState(false)
  const [showCopy, setShowCopy] = useState(false)
  const [copying, setCopying] = useState(false)

  const [addr, setAddr] = useState("")
  const qrCode = useRef();

  const [dropdown, setDropdown] = useState(false);
  const dropdownRef = useRef()
  const dropdownBtnRef = useRef()

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

  useOnClickOutside(qrCode, (e) => {
    setShowQR(false)
  }) 

  useOnClickOutside(dropdownRef, (e) => {
    if(dropdownBtnRef?.current?.contains(e.target) || e.target == dropdownBtnRef?.current) return;
    setDropdown(false)
  })

  return (
    <div className="w-full flex items-center justify-between py-2 mb-6">
      <div className="flex items-center">
        <Image src='eco.svg' width="48" height="48" alt=""/>
        <div className="font-black text-xl text-white">Welcome Eco!</div>
      </div>
      <div>
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
          <Image src="/chevron.svg" width="20" height="20" alt="" className="ml-1 cursor-pointer transition"
            onClick={() => setDropdown(!dropdown)} ref={dropdownBtnRef} style={dropdown && {transform: "rotate(-180deg)"}}
          />

          {/* <Image src="/qr.svg" width="16" height="16" alt="" className="ml-[6px] cursor-pointer"
            onClick={() => setShowQR(true)}
          /> */}
        </div>

        {dropdown && (
          <div className="walletDropdown mt-1 absolute text-center text-white w-[200px] font-medium text-sm" ref={dropdownRef} onClick={() => setDropdown(false)} >
            <div 
              className="p-2 w-full rounded-t-[12px] cursor-pointer hover:bg-[#00000030]"
              onClick={() => setShowQR(true)}
            >Wallet QR Code</div>
            <a 
              className="p-2 w-full cursor-pointer hover:bg-[#00000030] block"
              href={`https://goerli.etherscan.io/address/${addr}`}
              target="_blank"
            >Block Explorer</a>
            <div className="p-2 w-full rounded-b-[12px] cursor-pointer hover:bg-[#00000030]" onClick={() => {
              setWallet(null);
              setEOA(null)
              disconnect();
              localStorage.removeItem("magic connected")
            }}>Log Out</div>
          </div>
        )}

      </div>


      {showQR && (
        <div className="w-full h-full backdrop-blur-[6px] bg-[#00000025] absolute top-0 left-0 flex flex-col items-center justify-center">
          <div ref={qrCode}>
            <QRCode 
              value={addr}
              logoImage="/eco.png"
              logoPadding={6}
              size={200}
              bgColor="#f9f9f9"
            />
          </div>
        </div>
      )}
    </div>
  )
}
