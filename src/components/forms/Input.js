import { useState } from "react";
import TokenSelect from "./TokenSelect";
import ReceiverSelect from "./ReceiverSelect";

export default function Input(props) {

  const [active, setActive] = useState(false)

  return (
    <div className={props.className}>
      <div className="text-[#9BA0CC] text-xs font-medium mb-[6px]">{props.label}</div>
      <div 
        className={`${active ? "border-[#d0d5dd24] input-shadow" : "border-[#d0d5dd14]"} border-[1px] w-full flex items-center justify-between px-[14px] py-[10px] rounded-lg bg-[#08132D]`}
      >
        <input 
          className="border-0 bg-transparent outline-0 w-[180px] text-[#606876] overflow-x-scroll" placeholder={props.placeholder} type={props.type} value={props.value}
          onChange={(e) => {props.onChange(e)}}
          onFocus={() => {setActive(true)}}
          onBlur={() => {setActive(false)}}
          ref={props.inputRef || null}
        >
        </input>
        {props.tokenSelect && (
          <TokenSelect token={props.token} nonToken={props.nonToken} setToken={(value) => {props.setToken(value)}} excludeETH={props.excludeETH}/>
        )}
        {props.receiverSelect && (
          <ReceiverSelect setType={props.setReceiverType}/>
        )}
      </div>
    </div>
  )
}
