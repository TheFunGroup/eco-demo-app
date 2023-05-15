import { useEffect, useState } from "react";
import Image from 'next/image';
import { ethers } from "ethers";
import { createFunWallet, useFaucet, isAuthIdUsed } from "../../scripts/wallet";
import Spinner from "../misc/Spinner";
import { useFun } from "../../contexts/funContext";
import { MultiAuthEoa } from "fun-wallet/auth";
import { useAccount, useProvider, useConnect, useSigner } from 'wagmi'
import LinkAccounts from "./LinkAccounts";
import { useRouter } from 'next/router';
import { Magic } from 'magic-sdk';
import { OAuthExtension } from '@magic-ext/oauth';
import socials from "../../utils/socials";

export default function ConnectWallet(props) {
  const { connect, connectors } = useConnect()
  const { connector } = useAccount()
  const { data: signer } = useSigner()
  const wagmiProvider = useProvider()
  const { setWallet, setNetwork, setEOA, setLoading } = useFun()
  const [checkingLoginStatus, setCheckingLoginStatus] = useState(true);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState();
  const [showEOA, setShowEOA] = useState(false);
  const [showLinkMore, setShowLinkMore] = useState(false);
  const [linked, setLinked] = useState({});
  const [linkingWallet] = useState();
  const [provider, setProvider] = useState();
  const router = useRouter()
  const [magic, setMagic] = useState()
  const [authType, setAuthType] = useState("signup")

  useEffect(() => {
    const initMagicAuth = async () => {
      const magic = new Magic('pk_live_846F1095F0E1303C', {
        network: {
          chainId: 5,
          rpcUrl: "https://rpc.ankr.com/eth_goerli"
        },
        extensions: [new OAuthExtension()],
      })

      magic.preload()

      setMagic(magic)

      const isLinking = localStorage.getItem("magic-linking");
      if (isLinking) {
        const Linked = JSON.parse(localStorage.getItem("linked"));
        setLinked({ ...linked, ...Linked });
        setShowLinkMore(true);
      }
    }
    initMagicAuth()
  }, [])


  useEffect(() => {
    async function connectEOA() {
      setConnecting(connector.name)
      setLoading(true)
      let provider = await connector.getProvider({ chainId: 5 })
      if (signer && provider) {
        const chainId = await connector.getChainId();
        if (chainId !== 5) await connector.switchChain(5)
        setNetwork(5)
        const eoaAddr = await signer.getAddress();
        if (!provider.getBalance) provider = (await connector.getSigner()).provider;
        connectFunWallet(connector.name, eoaAddr, provider, eoaAddr);
      }
    }
    if (!showLinkMore && connector) {
      connectEOA()
    }
  }, [signer, wagmiProvider])

  useEffect(() => {
    if (router.query.provider) finishSocialLogin();
  }, [router.query]);

  const checkUserLoggedIn = async () => {
    if (magic) {
      setCheckingLoginStatus(true);  // Set to true when the check begins
      const isLoggedIn = await magic.user.isLoggedIn();
      if (isLoggedIn) {
        setConnected(true);
        const metadata = await magic.user.getMetadata();
        let publicAddress = metadata.publicAddress;
        let authId = `${metadata.oauth?.provider}###${metadata.email || metadata.oauth?.userInfo?.preferredUsername}`;
        const provider = new ethers.providers.Web3Provider(magic.rpcProvider);
        await connectFunWallet(metadata.oauth?.provider, authId, provider, publicAddress);
      }
      setCheckingLoginStatus(false);  // Set to false when the check is done
    }
  };
  useEffect(() => {
    if(localStorage.getItem("wallet connected")){
      checkUserLoggedIn()
    } else {
      setConnected(false);
      setCheckingLoginStatus(false)
    }
  }, [magic]);

  async function connectFunWallet(connector, authId, provider, publicKey) {
    // const authIdUsed = await isAuthIdUsed(authId)
    // if (!authIdUsed) {
    //   if (!linked[connector]) {
    //     linked[connector] = [authId, publicKey];
    //     setLinked(linked)
    //   }
    //   setProvider(provider)
    //   setShowLinkMore(true)
    //   setLoading(false)
    //   setConnecting("")
    //   return;
    // }
    const auth = new MultiAuthEoa({ provider, authIds: [[authId, publicKey]] })
    const FunWallet = await createFunWallet(auth)
    const addr = await FunWallet.getAddress()
    FunWallet.address = addr
    try {
      let balance = await provider.getBalance(addr);
      balance = ethers.utils.formatEther(balance);
      if (balance == 0) {
        FunWallet.deployed = false;
        await useFaucet(addr, 5);
      } else {
        FunWallet.deployed = true
      }
    } catch (e) {
      console.log(e)
    }
    localStorage.setItem("wallet connected", "true")
    setProvider(provider)
    setWallet(FunWallet);
    setEOA(auth)
    setConnecting("")
    setLoading(false)
  }

  const finishSocialLogin = async () => {
    const oauthProvider = localStorage.getItem("magic-connecting");
    setConnecting(oauthProvider);
    setLoading(true)
    try {
      let result = await magic.oauth.getRedirectResult();
      let authId = result.oauth.userInfo.email;
      let publicAddress = result.magic.userMetadata.publicAddress
      if (result.oauth.provider == "twitter") {
        authId = result.oauth.userInfo.preferredUsername
      }
      authId = `${result.oauth.provider}###${authId}`;
      localStorage.removeItem("magic-connecting");
      const isLinking = localStorage.getItem("magic-linking");
      const provider = new ethers.providers.Web3Provider(magic.rpcProvider);
      if (isLinking && !linked[result.oauth.provider]) {
        const authIdUsed = await isAuthIdUsed(authId)
        if (!authIdUsed) {
          linked[result.oauth.provider] = [authId, publicAddress]
        } else {
          alert("This account is already connected to a FunWallet")
        }
        setLinked(linked)
        setConnecting(false)
        setLoading(false)
        setProvider(provider)
        localStorage.removeItem("magic-linking")
        return;
      }
      connectFunWallet(result.oauth.provider, authId, provider, publicAddress)
    } catch (e) {
      console.log("finishSocialLogin", e)
      setConnecting("");
      setLoading(false)
      localStorage.removeItem("magic-connecting");
    }
  };

  async function connectMagic(oauthProvider) {
    try {
      setConnecting(oauthProvider);
      setLoading(true)
      localStorage.setItem("magic-connecting", oauthProvider)
      await magic.oauth.loginWithRedirect({
        provider: oauthProvider,
        redirectURI: new URL('/connect', window.location.origin).href
      });
    } catch (err) {
      console.log("connect wallet connect error", err)
    }
  }
 
  if (showLinkMore) {
    return (
      <LinkAccounts
        connect={connect} connectors={connectors} setWallet={setWallet} magic={magic}
        linked={linked} setLinked={setLinked} linkingWallet={linkingWallet} provider={provider}
        setProvider={setProvider} connecting={connecting} setConnecting={setConnecting} signer={signer}
      />
    )
  } else if (checkingLoginStatus) {
    return <Spinner />;
  } else if (!connected) {
    return (
      <div className={`w-[360px] modal p-6 flex flex-col items-center text-center -mt-[64px]`} >
        <Image src="/eco.svg" width="52" height="42" alt="" />
        <div className="font-black text-2xl mt-6 text-white">Eco Wallet</div>
        <div className="text-sm font-mono text-[#7BFAFC] mt-2">Secure & decentralized</div>

        <div className="mt-8 flex w-full justify-between">
          {Object.keys(socials).map((key) => {
            const social = socials[key]
            return (
              <div
                className="max-w-[56px] button rounded-full flex justify-center items-center cursor-pointer py-[14px] px-4"
                onClick={() => { if (!connecting) connectMagic(key) }}
                key={key}
              >
                {connecting == key ? (
                  <Spinner />
                ) : (
                  <Image src={social.icon} width="22" height="22" alt="" />
                )}
                {/* <div className="ml-3 font-medium text-[#344054]">{`Connect with ${social.name}`}</div> */}
              </div>
            )
          })}
        </div>

        <div className="w-full flex items-center my-6">
          <div className="w-full bg-[#9BA0CC] h-[1px]"></div>
          <div className="text-[#9BA0CC] mx-2">OR</div>
          <div className="w-full bg-[#9BA0CC] h-[1px]"></div>
        </div>

        {!showEOA && (
          <div
            className="button w-full rounded-lg flex justify-center cursor-pointer py-[10px] px-4"
            onClick={() => setShowEOA(true)}
          > 
            {connectors.filter((connector) => {
              let name = connector.name;
              if (name == "WalletConnectLegacy") name = "WalletConnect";
              if(name == connecting){
                return true
              } else {
                return false
              }
            })[0] ? (
              <Spinner />
            ) : (
              <Image src="/wallet.svg" width="22" height="22" alt="" />
            )}
            <div className="ml-3 font-medium text-white font-mono">{`${authType == "signup" ? "Sign up" : "Login"} with EOA`}</div>
          </div>
        )}

        {(showEOA && connectors.map((connector, idx) => {
          let name = connector.name;
          if (name == "WalletConnectLegacy") name = "WalletConnect"
          return (
            <button className="button mb-3 w-full rounded-lg flex justify-center cursor-pointer py-[10px] px-4"
              disabled={!connector.ready}
              onClick={() => {
                if (!connecting) connect({ connector })
              }}
              key={idx}
            >
              {connecting == connector.name ? (
                <Spinner />
              ) : (
                <Image src="/wallet.svg" width="22" height="22" alt="" />
              )}
              <div className="ml-3 font-medium text-sm text-white font-mono">{`${authType == "signup" ? "Sign up" : "Login"} with ${name}`}</div>
            </button>
          )
        }))}

        <div className="flex items-center w-full justify-center cursor-default mt-8 select-none text-sm">
          <div className="text-[#9BA0CC] font-mono mr-1">{authType == "signup" ? "Already have an account?" : "Don't have an account?"}</div>
          <div 
            className="font-medium font-mono text-[#7BFAFC] cursor-pointer transition hover:opacity-80"
            onClick={() => {
              if(authType == "signup"){
                setAuthType("login")
              } else {
                setAuthType("signup")
              }
            }}
          >
            {authType == "signup" ? "Log in" : "Sign up"}
          </div>
        </div>

      </div>
    )
  }
}