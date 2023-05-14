import { useRouter } from "next/router";
import Image from 'next/image';
import { useFun } from "../../contexts/funContext";

export default function Deployed(props) {

  const router = useRouter();
  const { deployedUrl } = useFun()

  return (
    <div className="w-full">
      <Image src="/success.svg" width="48" height="48" alt=""/>
      <div className="text-white font-semibold text-xl mt-6">Action Deployed</div>
      <div className="text-[#606876] font-mono text-sm mt-1">Your transaction has been deployed to the chain! Please find it on the block explorer.</div>
      <div className="flex w-full items-center justify-center mt-6 text-center">
        <div className="w-full mr-3 cancelBtn p-3 font-medium text-[#344054]" onClick={() => router.push("/")}>Back</div>
        <a className="w-full font-medium submitBtn" href={deployedUrl} target="_blank">
          <div className="w-full p-3" onClick={() => router.push("/")}>Block Explorer</div>
        </a>
      </div>
    </div>
  )
}
