

import { useEffect, useState, useRef } from "react";
import Head from 'next/head'
import { useRouter } from 'next/router';
import Loader from "./misc/Loader";
import { useFun } from "../contexts/funContext";
import Nav from "./navigation/nav";

export default function Layout(props) {

  const router = useRouter();
  const { loading, setLoading, wallet} = useFun()

  return (
    <div className="w-full h-full">
      <Head>
        <title>Eco Demo</title>
        <meta name="description" content="The Wallet Development Platform"/>
        <link rel="icon" href="/ecoIcon.png" />
      </Head>

      <main className="w-full h-full flex flex-col">
        {loading && (
          <Loader />
        )}
        <div className={`w-full h-full overflow-y-scroll`}>
          {(router.pathname !== "/connect" && wallet) &&(
            <div className="w-full h-full flex flex-col items-center justify-center">
              <div className="modal w-[690px] px-[113px] py-[40px]">
                <Nav />
                {props.children}
              </div>
            </div>
          )}
          {router.pathname == "/connect" && (
            props.children
          )}
        </div>
      </main>

    </div>
  )
}
