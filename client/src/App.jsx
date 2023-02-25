import { useState, useEffect, useRef } from 'react'
import {Contract, utils, providers, BigNumber} from 'ethers'
import Web3Modal from 'web3modal'
import {
  NFT_CONTRACT_ADDRESS,
  NFT_ABI, 
  TOKEN_ABI,
  TOKEN_CONTRACT_ADDRESS
  } from './constants'
import './App.css'

function App() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tokensToBeClaimed, setTokensToBeClaimed] = useState('0');
  const [balanceOfCryptoDevTokens, setBalanceOfCryptoDevTokens] = useState('0');
  const [tokensMinted , setTokensMinted] = useState('0');
  const [isOwner, setIsOwner] = useState(false);
  const [tokenAmount, setTokenAmount] = useState('')

  const zero = BigNumber.from(0);
  const web3ModalRef = useRef();
  // -------  GET PROVIDER OR SIGNER-----
  const getProviderOrSigner = async(needSigner = false)=>{
    try {
      const provider = await web3ModalRef.current.connect();
      const web3Provider = new providers.Web3Provider(provider)
      
  
      const { chainId } = await web3Provider.getNetwork();
      if (chainId !== 97) {
        window.alert("Change the network to BSC");
        throw new Error("Change network to BSC");
      }
  
      if(needSigner){
        const signer = web3Provider.getSigner()
        return signer;
      }
  
      return web3Provider;
  
    } catch (error) {
      console.log(error);
    }
  }

  // ---------GET OWNER --------
  const getOwner = async()=>{
    try {
      const provider = await getProviderOrSigner();
      const contract = new Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_ABI, provider);
      const _owner = await contract.owner();

      const signer = await getProviderOrSigner(true);
      const address = await signer.getAddress();

      if(address.toLowerCase() === _owner.toLowerCase()){
        setIsOwner(true)
      }

    } catch (error) {
      console.log(error);
    }
  }



  // -------GET TOTAL TOKEN MINTED-----
  const getTotalTokensMinted = async()=>{
    try {
      const provider = await getProviderOrSigner();
      const contract = new Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_ABI, provider);
      const _tokenMinted = await contract.totalSupply();
      setTokensMinted(_tokenMinted);
    } catch (error) {
      console.log(error)
    }
  }


  // -----CHECK IF THERE ARE TOKENS TO BE CLAIMED----------
  const getTokensToBeClaimed = async()=>{
    try {
      const provider = await getProviderOrSigner(true);
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, NFT_ABI, provider);
      const tknContract = new Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_ABI, provider);

      const signer = await getProviderOrSigner(true);
      const address = await signer.getAddress();

      const balance = await nftContract.balanceOf(address);

      if(balance === zero){
        setTokensToBeClaimed(zero);
      }else{
        var amount = 0 ;

        for(var i=0; i<balance; i++){
          var tokenId = await nftContract.tokenOfOwnerByIndex(address, i);
          var claimed = await tknContract.tokenIdsClaimed(tokenId);
          if(!claimed){
            amount++;
          }
        }
        setTokensToBeClaimed(BigNumber.from(amount));
      }
    } catch (error) {
      console.log(error)
    }
  }

  // ----------GET BALANCE OF CRYPTODEV TOKENS----------
  const getBalanceOfCryptodevTokens = async()=>{
    try {
      const provider = await getProviderOrSigner();
      const contract = new Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_ABI, provider);

      const signer = await getProviderOrSigner(true);
      const address = await signer.getAddress();
      const txn = await contract.balanceOf(address);
      setBalanceOfCryptoDevTokens(txn);
    } catch (error) {
      console.log(error);
      setBalanceOfCryptoDevTokens(zero);
    }
  }


  // ---------CLAIM CRYPTODEV TOKENS--------
  const claimCryptoDevTokens = async()=>{
    try {
      const signer = getProviderOrSigner(signer);
      const contract = new Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_ABI, signer);
      const txn = await contract.claim();
      setIsLoading(true);
      await txn.wait();
      setIsLoading(false);
      window.alert("Sucessfully claimed Crypto Dev Tokens");
      await getTokensToBeClaimed();
      await getBalanceOfCryptodevTokens();
    } catch (error) {
      console.log(error);
    }
  }

  // ----------MINT CRYPTODEV TOKEN------
  const mintCryptoDevToken = async(amount)=>{
    try {
      const signer = await getProviderOrSigner(true);
      const contract = new Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_ABI, signer);

      const value = 0.001 * amount 
      const tx = await contract.mint(amount , {
        value  : utils.parseEther(value.toString())
      });

      setIsLoading(true);
      await tx.wait();
      setIsLoading(false);
      window.alert("Successfully Minted the Crypto Dev Tokens");
      await getBalanceOfCryptodevTokens();
      await getTotalTokensMinted();
      await getTokensToBeClaimed();

    } catch (error) {
      console.log(error);
    }
  }
  // ----------------WITHDRAW COINS---------
  const withdrawCoins = async()=>{
    try {
      const signer = await getProviderOrSigner(true);
      const contract = new Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_ABI, signer);
      
      const tx = await contract.withdraw();
      setIsLoading(true);
      await tx.wait();
      setIsLoading(false);
      window.alert("You withdrawn coin successfully");
    } catch (error) {
      console.log(error)
    }
  }


  // -------CONNECT WALLET----
  const connectWallet = async()=>{
    try {
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (error) {
      console.log(error)
    }
  }


  // ---------USE EFFECT---------
  useEffect(()=>{
    if(!walletConnected){
      web3ModalRef.current = new Web3Modal({
        network : 'goerli',
        providerOptions : {},
        disableInjectedProvider : false
      })
    }
    getTotalTokensMinted();
    getBalanceOfCryptodevTokens();
    getTokensToBeClaimed();
    getOwner();
  }, [walletConnected])


  // -------RENDER BUTTON------
  const renderButton = ()=>{
     // If we are currently waiting for something, return a loading button
     if (isLoading) {
      return (
        <div>
          <button className='button'>Loading...</button>
        </div>
      );
    }
    // If tokens to be claimed are greater than 0, Return a claim button
    if (tokensToBeClaimed > 0) {
      return (
        <div>
          <div className={styles.description}>
            {tokensToBeClaimed * 10} Tokens can be claimed!
          </div>
          <button className="button" onClick={claimCryptoDevTokens}>
            Claim Tokens
          </button>
        </div>
      );
    }
    // If user doesn't have any tokens to claim, show the mint button
    return (
      <div style={{ display: "flex-col" }}>
        <div>
          <input
            type="number"
            placeholder="Amount of Tokens"
            // BigNumber.from converts the `e.target.value` to a BigNumber
            onChange={(e) => setTokenAmount(BigNumber.from(e.target.value))}
            className="input"
          />
        </div>

        <button
          className="button"
          disabled={!(tokenAmount > 0)}
          onClick={() => mintCryptoDevToken(tokenAmount)}
        >
          Mint Tokens
        </button>
      </div>
    );
  };

  return (
      <div>
        <div className="main">
          <div>
            <h1 className="title">Welcome to Crypto Devs ICO!</h1>
            <div className="description">
              You can claim or mint Crypto Dev tokens here
            </div>
            {walletConnected ? (
              <div>
                <div className="description">
                  {/* Format Ether helps us in converting a BigNumber to string */}
                  You have minted {utils.formatEther(balanceOfCryptoDevTokens)} Crypto
                  Dev Tokens
                </div>
                <div className="description">
                  {/* Format Ether helps us in converting a BigNumber to string */}
                  Overall {utils.formatEther(tokensMinted)}/10000 have been minted!!!
                </div>
                {renderButton()}
                {/* Display additional withdraw button if connected wallet is owner */}
                  {isOwner ? (
                    <div>
                    {isLoading ? <button className="button">Loading...</button>
                             : <button className="button" onClick={withdrawCoins}>
                                 Withdraw Coins
                               </button>
                    }
                    </div>
                    ) : ("")
                  }
              </div>
            ) : (
              <button onClick={connectWallet} className="button">
                Connect your wallet
              </button>
            )}
          </div>
          <div>
            <img className="image" src="./0.svg" />
          </div>
        </div>
  
        <footer className="footer">
          Made with &#10084; by MH
        </footer>
      </div>
    );
}

export default App
