import React, { useEffect, useRef, useState } from "react";
import { Trans, t } from "@lingui/macro";
import { useWeb3React } from "@web3-react/core";
import { setTraderReferralCodeByUser, validateReferralCodeExists } from "domain/referrals";
import { REFERRAL_CODE_REGEX } from "./referralsHelper";
import { useDebounce } from "lib/useDebounce";
import {ethers} from "ethers";
import abi from "../../utils/BuyMeCoffee.json";

const contractAddress = "0x3cfBad4BB4c99333CF6EC3884b1b7e1E75cc2D50";
const contractABI = abi.abi;



function JoinReferralCode({ setPendingTxns, pendingTxns, active, connectWallet, props }) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  //
  // const {
  //   inputValue,
  //   onInputValueChange,
  // } = props;

  const onMessageChange = (event) => {
    setMessage(event.target.value);
  }
  const buyZkmx = async () => {
    try {
      const {ethereum} = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum, "any");
        const signer = provider.getSigner();
        const buyZkmxIfo = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        console.log("zkMX IFO..")
        console.log(message)
        const value = ethers.utils.parseEther(message.toString());
        console.log(value)

        const coffeeTxn = await buyZkmxIfo.buyZkmx(
          name ? name : "anon",
          message ? message : "IFO success!",
          {value: value.toString()}
        );

        await coffeeTxn.wait();

        console.log("mined ", coffeeTxn.hash);

        console.log("zkMX particiated!");

        // Clear the form fields.
        setName("");
        setMessage("");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="referral-card section-center mt-medium">
      <h2 className="title">
        <h1>Participate</h1>
      </h2>
      <p className="sub-title">
        <Trans>Please input ETH amount to participate IFO</Trans>
      </p>
      <div className="card-action">
          <div>
            <input
              type="number"
              min="0"
              placeholder="0.0"
              className="Exchange-swap-input"
              onChange={onMessageChange}
            /><br></br><br></br>
            <button
           className="default-btn"
            onClick={buyZkmx}
           >
            Participate</button>
          </div>

      </div>
    </div>
  );
}

export function ReferralCodeForm({
  setPendingTxns,
  pendingTxns,
  callAfterSuccess,
  userReferralCodeString = "",
  type = "join",
}) {
  const { account, library, chainId } = useWeb3React();
  const [referralCode, setReferralCode] = useState("");
  const inputRef = useRef("");
  const [isValidating, setIsValidating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [referralCodeExists, setReferralCodeExists] = useState(true);
  const debouncedReferralCode = useDebounce(referralCode, 300);

  function getPrimaryText() {
    const isEdit = type === "edit";
    if (isEdit && debouncedReferralCode === userReferralCodeString) {
      return t`Same as current active code`;
    }
    if (isEdit && isSubmitting) {
      return t`Updating...`;
    }

    if (isSubmitting) {
      return t`Adding...`;
    }
    if (debouncedReferralCode === "") {
      return t`Enter Referral Code`;
    }
    if (isValidating) {
      return t`Checking code...`;
    }
    if (!referralCodeExists) {
      return t`Referral Code does not exist`;
    }

    return isEdit ? t`Update` : t`Submit`;
  }
  function isPrimaryEnabled() {
    if (
      debouncedReferralCode === "" ||
      isSubmitting ||
      isValidating ||
      !referralCodeExists ||
      debouncedReferralCode === userReferralCodeString
    ) {
      return false;
    }
    return true;
  }

  async function handleSubmit(event) {
    const isEdit = type === "edit";
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const tx = await setTraderReferralCodeByUser(chainId, referralCode, library, {
        account,
        successMsg: isEdit ? t`Referral code updated!` : t`Referral code added!`,
        failMsg: isEdit ? t`Referral code updated failed.` : t`Adding referral code failed.`,
        setPendingTxns,
        pendingTxns,
      });
      if (callAfterSuccess) {
        callAfterSuccess();
      }
      const receipt = await tx.wait();
      if (receipt.status === 1) {
        setReferralCode("");
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    } finally {
      setIsSubmitting(false);
      setIsValidating(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    async function checkReferralCode() {
      if (debouncedReferralCode === "" || !REFERRAL_CODE_REGEX.test(debouncedReferralCode)) {
        setIsValidating(false);
        setReferralCodeExists(false);
        return;
      }

      setIsValidating(true);
      const codeExists = await validateReferralCodeExists(debouncedReferralCode, chainId);
      if (!cancelled) {
        setReferralCodeExists(codeExists);
        setIsValidating(false);
      }
    }
    checkReferralCode();
    return () => {
      cancelled = true;
    };
  }, [debouncedReferralCode, chainId]);

  useEffect(() => {
    inputRef.current.focus();
  }, []);

  return (
    <form onSubmit={handleSubmit}>
      <input
        ref={inputRef}
        disabled={isSubmitting}
        type="text"
        placeholder="Enter referral code"
        className="text-input mb-sm"
        value={referralCode}
        onChange={({ target }) => {
          const { value } = target;
          setReferralCode(value);
        }}
      />
      <button type="submit" className="App-cta Exchange-swap-button" disabled={!isPrimaryEnabled()}>
        {getPrimaryText()}
      </button>
    </form>
  );
}
export default JoinReferralCode;
