import { useEffect, useRef, useState } from "react";
import Input from "./Input";

export default function TransferForm(props) {

  const {
    transfer, setTransfer,
    receiverAddr, setReceiverAddr,
    receiverTwitter, setReceiverTwitter
  } = props;

  const transferRef = useRef();
  const receiverRef = useRef();
  const [usingTwitter, setUsingTwitter] = useState(false)

  function handleTransferChange(e){
    const amount = e.target.value;
    if((transfer[1].name == "ETH" && amount > 0.01) || amount > 100 || amount < 0) return;
    setTransfer([amount, transfer[1]])
  }

  return (
    <div className="w-full">

      <Input 
        className="w-full" 
        label="Transfer Quantity & Token"
        placeholder="0.00"
        type="number"
        value={transfer[0]}
        onChange={handleTransferChange}
        inputRef={transferRef}
        tokenSelect
        token={transfer[1]}
        setToken={(value) => {setTransfer([transfer[0], value])}}
      />

      <Input 
        className="w-full mt-6" 
        label="Receiver Address"
        placeholder={usingTwitter ? "@chamath" : "0x..."}
        value={usingTwitter ? receiverTwitter : receiverAddr}
        onChange={(e) => {
          if(usingTwitter){
            if(e.target.value[0] !== "@"){
              e.target.value = "@" + e.target.value;
            }
            setReceiverTwitter(e.target.value)
          } else {
            setReceiverAddr(e.target.value)}
          }
        }
        inputRef={receiverRef}
        receiverSelect
        setReceiverType={(type) => {
          if(type == "Twitter"){
            setUsingTwitter(true)
            setReceiverAddr("")
          } else {
            setUsingTwitter(false)
            setReceiverTwitter("")
          }
        }}
      />

    </div>
  )
}
