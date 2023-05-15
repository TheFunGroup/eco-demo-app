import Image from 'next/image';
import { networks } from "../../utils/networks";
import { useFun } from "../../contexts/funContext";

export default function PaymentMethod(props) {

  const { token, setToken } = props;
  const { network } = useFun()
  
  const tokens = {
    "USDC": 1, "DAI": 1, "USDT": 1, "ECO": 1
  }

  const chainToken = networks[network || 5].nativeCurrency;

  return (
    <div className="w-full mt-8">
      <div className="text-white font-black">Gas Payment Method</div>

      <div 
        className="button border-[1px] flex justify-between items-center w-full p-4 text-[#FFFFFFCC] font-medium mt-3 rounded-lg"
        style={{borderColor: tokens[token] ? "#5AE4BFB0" : "#D0D5DD14"}}
        onClick={() => {if(!tokens[token]) setToken("ECO")}}
      >
        <div className="flex items-center">
          <img src="/eco.svg" width="32" height="32" alt=""/>
          <div className="ml-4">ECO Token</div>
        </div>
      </div>

      <div 
        className="button border-[1px] flex justify-between items-center w-full p-4 text-[#FFFFFFCC] font-medium mt-3 rounded-lg"
        style={{borderColor: token == "gasless" ? "#5AE4BFB0" : "#D0D5DD14"}}
        onClick={() => {setToken("gasless")}}
      >
        <div className="flex items-center">
          <img src="/gasless.svg" width="32" height="32" alt=""/>
          <div className="ml-4">Gasless</div>
        </div>
      </div>

      <div 
        className="button border-[1px] flex justify-between items-center w-full p-4 text-[#FFFFFFCC] font-medium mt-3 rounded-lg"
        style={{borderColor: token == chainToken.symbol ? "#5AE4BFB0" : "#D0D5DD14"}}
        onClick={() => {setToken(chainToken.symbol)}}
      >
        <div className="flex items-center">
          <img src={"/ethereum.svg"} width="32" height="32" alt=""/>
          <div className="ml-4">{chainToken.name}</div>
        </div>
      </div>
    </div>
  )
}
