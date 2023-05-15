export const getSwapAmount = async function (token1, amt, token2) {
  try {
    let swapInfo;
    let amount;
    if(token1.name.toLowerCase() == "eco"){
      if(token2.name.toLowerCase() == "usdc") token2.name = "USD";
      swapInfo = await (await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${token1.name.toLowerCase()}&vs_currencies=${token2.name.toLowerCase()}`)).json();
      amount = swapInfo[token1.name.toLowerCase()][token2.name.toLowerCase()] * amt;
    } else if(token2.name.toLowerCase() == "eco"){
      let ecoUSD = await toUSD("eco", 1, 4);
      let tokenUSD = await toUSD(token1.name.toLowerCase(), 1, 4);
      amount = (tokenUSD * amt) / ecoUSD;
    } else {
      swapInfo = await (await fetch(`https://min-api.cryptocompare.com/data/price?fsym=${token1.name.toLowerCase()}&tsyms=${token2.name.toLowerCase()}`)).json()
      amount = swapInfo[token2.name] * amt;
    }
    return amount.toFixed(2)
  } catch(e){
    console.log(e)
  }
}

export const toUSD = async function(token, amt, fixed=2){
  try {
    let amount;
    let swapInfo;
    if(token.toLowerCase() == "eco"){ 
      swapInfo = await (await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=eco&vs_currencies=usd`)).json()
      amount = swapInfo["eco"]["usd"] * amt;
    } else {
      swapInfo = await (await fetch(`https://min-api.cryptocompare.com/data/price?fsym=${token}&tsyms=usd`)).json()
      amount = swapInfo["USD"] * amt;
    }
    return amount.toFixed(fixed)
  } catch(e){
    console.log(e)
  }
}