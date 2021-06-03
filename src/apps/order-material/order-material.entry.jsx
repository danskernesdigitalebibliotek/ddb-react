import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import urlPropType from "url-prop-type";

import OrderMaterial from "./order-material";
import OpenPlatform from "../../core/OpenPlatform";
import DingIll from "../../core/DingIll";
import User from "../../core/user";

/**
 * Transform a set of ids to an array of ids.
 *
 * This supports transforming a single string with multiple ids separated by ,
 * (used in naive app mounts using data attributes as props) to an array of ids.
 *
 * @param {string|string[]} One or more ids.
 * @returns {string[]} Array of ids.
 */
function idsArray(ids) {
  return typeof ids === "string" ? ids.split(",") : ids;
}

function OrderMaterialEntry({
  text,
  successText,
  successMessage,
  errorText,
  checkingText,
  progressText,
  unavailableText,
  invalidPickupBranchText,
  ids,
  loginUrl,
  illCheckUrl,
  pickupBranch,
  expires
}) {
  const [status, setStatus] = useState("initial");

  function orderMaterial() {
    setStatus("processing");
    const client = new OpenPlatform();
    client
      .orderMaterial({ pids: idsArray(ids), pickupBranch, expires })
      .then(() => {
        setStatus("finished");
      })
      .catch(() => {
        setStatus("failed");
      });
  }

  useEffect(() => {
    const client = new OpenPlatform();
    const dingIll = new DingIll(illCheckUrl);
    // Check that the material is available for ILL.
    setStatus("checking");
    dingIll
      .isAvailableForIll(idsArray(ids))
      .then(available => {
        if (!available) {
          setStatus("unavailable");
        } else if (User.isAuthenticated()) {
          // Check that the pickup branch accepts inter-library loans.
          client
            .getBranch(pickupBranch)
            .then(branch => {
              if (branch.willReceiveIll !== "1") {
                setStatus("invalid branch");
              } else {
                setStatus("ready");
              }
            })
            .catch(() => {
              setStatus("failed");
            });
        } else {
          // It's available and we're not logged in, show as available
          // for order. Ready is the state we use for buttons which
          // require login when accessed by anonymous users.
          setStatus("ready");
        }
      })
      .catch(() => {
        setStatus("failed");
      });
  }, [ids, pickupBranch, illCheckUrl]);

  return (
    <OrderMaterial
      text={text}
      errorText={errorText}
      successText={successText}
      successMessage={successMessage}
      checkingText={checkingText}
      progressText={progressText}
      unavailableText={unavailableText}
      invalidPickupBranchText={invalidPickupBranchText}
      status={status}
      onClick={orderMaterial}
      loginUrl={loginUrl}
      materialIds={idsArray(ids)}
    />
  );
}

OrderMaterialEntry.propTypes = {
  text: PropTypes.string,
  errorText: PropTypes.string,
  checkingText: PropTypes.string,
  progressText: PropTypes.string,
  unavailableText: PropTypes.string,
  invalidPickupBranchText: PropTypes.string,
  successText: PropTypes.string,
  successMessage: PropTypes.string,
  ids: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string)
  ]).isRequired,
  loginUrl: urlPropType.isRequired,
  illCheckUrl: urlPropType.isRequired,
  pickupBranch: PropTypes.string.isRequired,
  expires: PropTypes.string.isRequired
};

OrderMaterialEntry.defaultProps = {
  text: "Bestil materiale",
  checkingText: "Undersøger mulighed for fjernlån",
  progressText: "Bestiller materiale",
  unavailableText: "Kan ikke fjernlånes",
  invalidPickupBranchText: "Dit afhentningsbibliotek modtager ikke fjernlån",
  errorText: "Det lykkedes ikke at bestille materialet.",
  successText: "Materialet er bestilt",
  successMessage:
    "Materialet er bestilt, dit bibliotek vil give besked når det er klar til afhentning."
};

export default OrderMaterialEntry;
