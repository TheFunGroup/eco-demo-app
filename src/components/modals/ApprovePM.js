import { useState } from "react";
import { useRouter } from "next/router";
import { handleApprove } from "../../scripts/approve";
import { useFun } from "../../contexts/funContext";
import Input from "../forms/Input";
import Spinner from "../misc/Spinner";

export default function ApprovePM(props) {

  const router = useRouter();
  const [amount, setAmount] = useState(["200.00"]);
  const { wallet, eoa, paymentToken, setPaymentToken, paymentAddr, paymasterAddress, setLoading } = useFun()
  const [approving, setApproving] = useState(false);

  function approve(){
    setLoading(true);
    setApproving(true)
    handleApprove(wallet, eoa, paymasterAddress, paymentAddr, amount).then((data) => {
      if(router.query.example){
        router.push(`/${router.query.example}`)
      } else {
        router.push("/")
      }      
      setLoading(false);
      setApproving(false);
    })
  }

  return (
    <div className="w-full">
      <div className="text-white font-bold text-lg">Give permission to pay for gas</div>
      <div className="text-[#606876] font-mono text-sm mt-1 whitespace-nowrap">Give Fun access to tokens to pay gas fees.</div>
      <div className="w-full mt-6 flex items-center justify-between">
        
        <Input 
          className="w-full" 
          label="Amount"
          placeholder="0.00"
          type="number"
          value={amount}
          onChange={(e) => {setAmount(e.target.value)}}
          tokenSelect
          token={{name :paymentToken}}
          setToken={(value) => {setPaymentToken(value.name)}}
          excludeETH={true}
        />
       
      </div>

      <div className="flex w-full items-center justify-between mt-8 text-center">

        <div className="w-[226px] cancelBtn p-3 font-medium" onClick={() => router.push("/")}>Cancel</div>
        <div 
          className="w-[226px] submitBtn p-3 font-medium flex items-center justify-center"
          onClick={approve}
          style={ approving ? { opacity: 0.8, pointerEvents: "none" } : {}}
        >
          {approving && (<Spinner marginRight="6px"/>)} 
          <div>Give Access</div>
        </div>

      </div>


    </div>
  )
}
