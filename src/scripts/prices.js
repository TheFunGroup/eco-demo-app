const USDECOPrice = .015
export const getSwapAmount = async function (token1, amt, token2) {
  try {
    const swapInfo = await (await fetch(`https://min-api.cryptocompare.com/data/price?fsym=${token1.name}&tsyms=${token2.name}`)).json()
    const ETHUSD = await toUSD("ETH", amt)
    let amount = swapInfo[token2.name] * amt;
    if(token2.name.toLowerCase() =="eco"){
      amount = ETHUSD/USDECOPrice
    }
    else if(token1.name.toLowerCase() =="eco"){
      amount = USDECOPrice/ETHUSD
    }
    return amount.toFixed(2)
  } catch(e){
    console.log(e)
  }
}

export const toUSD = async function(token, amt){
  try {
    const swapInfo = await (await fetch(`https://min-api.cryptocompare.com/data/price?fsym=${token}&tsyms=usd`)).json()
    const amount = swapInfo["USD"] * amt;
    return amount.toFixed(2)
  } catch(e){
    console.log(e)
  }
}