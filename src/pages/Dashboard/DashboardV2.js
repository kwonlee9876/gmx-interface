import React, { useEffect, useState } from "react";
import Footer from "components/Footer/Footer";
import "../Home/Home.css";
// import abi from '../../utils/BuyMeCoffee.json';
import { ethers } from "ethers";
import zkmxLogo from "img/zkmx.png";
import simpleSwapIcon from "img/lightning-32x32-5388057.png";
import costIcon from "img/calendar-check-32x32-5388026.png";
import liquidityIcon from "img/layer-32x32-5388055.png";
import totaluserIcon from "img/calendar-check-32x32-5388026.png";

import statsIcon from "img/ic_stats.svg";
import tradingIcon from "img/ic_trading.svg";

import useSWR from "swr";

import { USD_DECIMALS, getTotalVolumeSum } from "lib/legacy";

import { useUserStat } from "domain/legacy";

import arbitrumIcon from "img/ic_arbitrum_96.svg";
import avaxIcon from "img/ic_avalanche_96.svg";

import TokenCard from "components/TokenCard/TokenCard";
import { Trans } from "@lingui/macro";
import { HeaderLink } from "components/Header/HeaderLink";
import { ARBITRUM, AVALANCHE } from "config/chains";
import { getServerUrl } from "config/backend";
import { bigNumberify, formatAmount, numberWithCommas } from "lib/numbers";

export default function Home({ showRedirectModal, redirectPopupTimestamp }) {
  const [openedFAQIndex, setOpenedFAQIndex] = useState(null)
  const faqContent = [{
    id: 1,
    question: "Impermanent loss risk",
    answer: " Provide liquidity for tokens with lower volatility or invest in AMM pools that use stablecoins.<br><br>\n" +
      "Use strategies such as impermanent loss insurance or portfolio rebalancing to minimize losses."
  }, {
    id: 2,
    question: "Price slippage risk",
    answer: "Protocol monitors the liquidity on the exchange and ensure there is sufficient liquidity before making trades.<br><br>Protocol uses limit orders instead of market orders to avoid unexpected price changes."
  }, {
    id: 3,
    question: "Oracle risk",
    answer: "zkMX uses a 3rd party oracle whereas GMX uses its own off-chain oracle to directly fetch price information from high-volume exchanges<br><br>"
  }]

  const toggleFAQContent = function(index) {
    if (openedFAQIndex === index) {
      setOpenedFAQIndex(null)
    } else {
      setOpenedFAQIndex(index)
    }
  }

  // ARBITRUM

  const contractAddress = "0xDBa03676a2fBb6711CB652beF5B7416A53c1421D";
//   const contractABI = abi.abi;

  // Component state
  const [currentAccount, setCurrentAccount] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [memos, setMemos] = useState([]);
  const [value, setValue] = useState("");

  const arbitrumPositionStatsUrl = getServerUrl(ARBITRUM, "/position_stats");
  const { data: arbitrumPositionStats } = useSWR([arbitrumPositionStatsUrl], {
    fetcher: (...args) => fetch(...args).then((res) => res.json()),
  });

  const arbitrumTotalVolumeUrl = getServerUrl(ARBITRUM, "/total_volume");
  const { data: arbitrumTotalVolume } = useSWR([arbitrumTotalVolumeUrl], {
    fetcher: (...args) => fetch(...args).then((res) => res.json()),
  });

  // AVALANCHE

  const avalanchePositionStatsUrl = getServerUrl(AVALANCHE, "/position_stats");
  const { data: avalanchePositionStats } = useSWR([avalanchePositionStatsUrl], {
    fetcher: (...args) => fetch(...args).then((res) => res.json()),
  });

  const avalancheTotalVolumeUrl = getServerUrl(AVALANCHE, "/total_volume");
  const { data: avalancheTotalVolume } = useSWR([avalancheTotalVolumeUrl], {
    fetcher: (...args) => fetch(...args).then((res) => res.json()),
  });

  // Total Volume

  const arbitrumTotalVolumeSum = getTotalVolumeSum(arbitrumTotalVolume);
  const avalancheTotalVolumeSum = getTotalVolumeSum(avalancheTotalVolume);

  let totalVolumeSum = bigNumberify(0);
  if (arbitrumTotalVolumeSum && avalancheTotalVolumeSum) {
    totalVolumeSum = totalVolumeSum.add(arbitrumTotalVolumeSum);
    totalVolumeSum = totalVolumeSum.add(avalancheTotalVolumeSum);
  }

  // Open Interest

  let openInterest = bigNumberify(0);
  if (
    arbitrumPositionStats &&
    arbitrumPositionStats.totalLongPositionSizes &&
    arbitrumPositionStats.totalShortPositionSizes
  ) {
    openInterest = openInterest.add(arbitrumPositionStats.totalLongPositionSizes);
    openInterest = openInterest.add(arbitrumPositionStats.totalShortPositionSizes);
  }

  if (
    avalanchePositionStats &&
    avalanchePositionStats.totalLongPositionSizes &&
    avalanchePositionStats.totalShortPositionSizes
  ) {
    openInterest = openInterest.add(avalanchePositionStats.totalLongPositionSizes);
    openInterest = openInterest.add(avalanchePositionStats.totalShortPositionSizes);
  }

  // user stat
  const arbitrumUserStats = useUserStat(ARBITRUM);
  const avalancheUserStats = useUserStat(AVALANCHE);
  let totalUsers = 0;

  if (arbitrumUserStats && arbitrumUserStats.uniqueCount) {
    totalUsers += arbitrumUserStats.uniqueCount;
  }

  if (avalancheUserStats && avalancheUserStats.uniqueCount) {
    totalUsers += avalancheUserStats.uniqueCount;
  }

  const LaunchExchangeButton = () => {
    return (
      <HeaderLink
        className="default-btn"
        to="/dashboard"
        redirectPopupTimestamp={redirectPopupTimestamp}
        showRedirectModal={showRedirectModal}
      >
        <Trans>Launch App</Trans>
      </HeaderLink>
    );
  };

  const onValueChange = (event) => {
    setValue(event.target.value)
  }
  const onNameChange = (event) => {
    setName(event.target.value);
  }

  const onMessageChange = (event) => {
    setMessage(event.target.value);
  }

  // Wallet connection logic
  const isWalletConnected = async () => {
    try {
      const { ethereum } = window;

      const accounts = await ethereum.request({method: 'eth_accounts'})
      console.log("accounts: ", accounts);

      if (accounts.length > 0) {
        const account = accounts[0];
        console.log("wallet is connected! " + account);
      } else {
        console.log("make sure MetaMask is connected");
      }
    } catch (error) {
      console.log("error: ", error);
    }
  }

  const connectWallet = async () => {
    try {
      const {ethereum} = window;

      if (!ethereum) {
        console.log("please install MetaMask");
      }

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts'
      });

      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  }

//   const buyCoffee = async () => {
//     try {
//       const {ethereum} = window;

//       if (ethereum) {
//         const provider = new ethers.providers.Web3Provider(ethereum, "any");
//         const signer = provider.getSigner();
//         const buyMeACoffee = new ethers.Contract(
//           contractAddress,
//           contractABI,
//           signer
//         );

//         console.log("bidding..")
//         const coffeeTxn = await buyMeACoffee.buyCoffee(
//           message ? message : "Address to receive Ordinal inscription",
//           {value: ethers.utils.parseEther("0.001")}
//         );

//         await coffeeTxn.wait();

//         console.log("mined ", coffeeTxn.hash);

//         console.log("coffee purchased!");

//         // Clear the form fields.
//         setName("");
//         setMessage("");
//       }
//     } catch (error) {
//       console.log(error);
//     }
//   };

  const getMemos = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const buyMeACoffee = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        console.log("fetching memos from the blockchain..");
        const memos = await buyMeACoffee.getMemos();
        console.log("fetched!");
        setMemos(memos);
      } else {
        console.log("Metamask is not connected");
      }

    } catch (error) {
      console.log(error);
    }
  };


  useEffect(() => {
    let buyMeACoffee;
    isWalletConnected();
    getMemos();

    // Create an event handler function for when someone sends
    // us a new memo.
    const onNewMemo = (from, timestamp, name, message) => {
      console.log("Memo received: ", from, timestamp, name, message);
      setMemos((prevState) => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message,
          name
        }
      ]);
    };

    const {ethereum} = window;

    // Listen for new memo events.
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum, "any");
      const signer = provider.getSigner();
      buyMeACoffee = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      buyMeACoffee.on("NewMemo", onNewMemo);
    }

    return () => {
      if (buyMeACoffee) {
        buyMeACoffee.off("NewMemo", onNewMemo);
      }
    }
  }, []);

  return (
    <div className="Home">
      <div className="Home-top">
        {/* <div className="Home-top-image"></div> */}
        <div className="Home-title-section-container default-container">
          <div className="Home-title-section">
            <div className="Home-title">
              <Trans>
                Perpetual DEX
                <br />
                on zkSync
              </Trans>
            </div>
            <div className="Home-description">
              <Trans>
                ZKMX is a zkRollup based DEX, launchpad, farming platform built on zkSync and Polygon.
              </Trans>
            </div>
            <LaunchExchangeButton />
          </div>
        </div>
        {/* <div className="Home-latest-info-container default-container">
          <div className="Home-latest-info-block">
            <img src={tradingIcon} alt="Total Trading Volume Icon" className="Home-latest-info__icon" />
            <div className="Home-latest-info-content">
              <div className="Home-latest-info__title">
                <Trans>Total Trading Volume</Trans>
              </div>
              <div className="Home-latest-info__value">${formatAmount(totalVolumeSum, USD_DECIMALS, 0, true)}</div>
            </div>
          </div>
          <div className="Home-latest-info-block">
            <img src={statsIcon} alt="Open Interest Icon" className="Home-latest-info__icon" />
            <div className="Home-latest-info-content">
              <div className="Home-latest-info__title">
                <Trans>Open Interest</Trans>
              </div>
              <div className="Home-latest-info__value">${formatAmount(openInterest, USD_DECIMALS, 0, true)}</div>
            </div>
          </div>
          <div className="Home-latest-info-block">
            <img src={totaluserIcon} alt="Total Users Icon" className="Home-latest-info__icon" />
            <div className="Home-latest-info-content">
              <div className="Home-latest-info__title">
                <Trans>Total Users</Trans>
              </div>
              <div className="Home-latest-info__value">{numberWithCommas(totalUsers.toFixed(0))}</div>
            </div>
          </div>
        </div> */}
      </div>
      <div className="Home-benefits-section">
        <div className="Home-benefits default-container">
          <div className="Home-benefit">
            <div className="Home-benefit-icon">
              <img src={liquidityIcon} alt="Reduce Liquidation Risks Icon" className="Home-benefit-icon-symbol" />
              <div className="Home-benefit-title">
                <Trans>Whitelist Ticket NFT on Manifold</Trans>
              </div>
            </div>
            <div className="Home-benefit-description">
              <Trans>
                We'll be announcing whitelist ticket NFT soon.
              </Trans>
            </div>
          </div>
          <div className="Home-benefit">
            <div className="Home-benefit-icon">
              <img src={costIcon} alt="Save on Costs Icon" className="Home-benefit-icon-symbol" />
              <div className="Home-benefit-title">
                <Trans>$ZKS Airdrop</Trans>
              </div>
            </div>
            <div className="Home-benefit-description">
              <Trans>
                $ZKS drop will be available for promotion winner.
              </Trans>
            </div>
          </div>
          <div className="Home-benefit">
            <div className="Home-benefit-icon">
              <img src={simpleSwapIcon} alt="Simple Swaps Icon" className="Home-benefit-icon-symbol" />
              <div className="Home-benefit-title">
                <Trans>Powered by zkSync Era</Trans>
              </div>
            </div>
            <div className="Home-benefit-description">
              <Trans>
                Enjoy unlimited trading experience with zkSync Era.
              </Trans>
            </div>
          </div>
        </div>
      </div>

      <div className="Home-cta-section">
        <div className="Home-cta-container default-container">
          <div className="Home-cta-info">
            <div className="Home-cta-info__title">
              <Trans>IFO rules</Trans>
            </div>
            <div className="Home-cta-info__description">
              <Trans>

                 To be announced
              </Trans>
            </div>
          </div>
          <div className="Home-cta-options">
            <div className="Home-cta-option Home-cta-option-arbitrum">
              <div className="Home-cta-option-icon">
                <img src={zkmxLogo} width="96" alt="Arbitrum Icon" />
              </div>
              <div className="Home-cta-option-info">
                <div className="Home-cta-option-title">$ZKMX</div>
                <div className="Home-cta-option-action">
                  <button
                    className="default-btn"
                    // onClick={buyCoffee}
                  >
                    TBA</button>
                </div>
              </div>
            </div>
            {/*<div className="Home-cta-option Home-cta-option-ava">*/}
            {/*  <div className="Home-cta-option-icon">*/}
            {/*    <img src={avaxIcon} width="96" alt="Avalanche Icon" />*/}
            {/*  </div>*/}
            {/*  <div className="Home-cta-option-info">*/}
            {/*    <div className="Home-cta-option-title">Avalanche</div>*/}
            {/*    <div className="Home-cta-option-action">*/}
            {/*      <LaunchExchangeButton />*/}
            {/*    </div>*/}
            {/*  </div>*/}
            {/*</div>*/}
          </div>
        </div>
      </div>


      {/* <div className="Home-video-section">
        <div className="Home-video-container default-container">
          <div className="Home-video-block">
            <img src={gmxBigIcon} alt="gmxbig" />
          </div>
        </div>
      </div> */}
       <div className="Home-faqs-section">
        <div className="Home-faqs-container default-container">
          <div className="Home-faqs-introduction">
            <div className="Home-faqs-introduction__title">Different approaches  </div>
            <div className="Home-faqs-introduction__description">              1. Impermanent loss risk <br></br>
              2. Price slippage risk <br></br>
              3. Oracle risks (de-peg of price) <br></br>
              4. Regulatory risks<br></br>
              <br></br>
              Among those risks, zkMX offers different approaches except Regulatory risks where thing are beyond our project design and efforts.<br></br>
            </div>


            <a href="https://info-194.gitbook.io/zkmx/" className="default-btn Home-faqs-documentation">Documentation</a>
          </div>
          <div className="Home-faqs-content-block">
            {
              faqContent.map((content, index) => (
                <div className="Home-faqs-content" key={index} onClick={() => toggleFAQContent(index)}>
                  <div className="Home-faqs-content-header">
                    <div className="Home-faqs-content-header__icon">
                      {
                        openedFAQIndex
                      }
                    </div>
                    <div className="Home-faqs-content-header__text">
                      { content.question }
                    </div>
                  </div>
                  <div className={ openedFAQIndex === index ? "Home-faqs-content-main opened" : "Home-faqs-content-main" }>
                    <div className="Home-faqs-content-main__text">
                      <div dangerouslySetInnerHTML={{__html: content.answer}} >
                      </div>
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
      <Footer showRedirectModal={showRedirectModal} redirectPopupTimestamp={redirectPopupTimestamp} />
    </div>
  );
}
