import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import PropTypes from "prop-types";
import urlPropType from "url-prop-type";

import OrderMaterial from "./order-material";
import User from "../../core/user";

import {
  checkAvailibility,
  orderMaterial,
  orderMaterialPending,
  orderMaterialAborted,
  resetStatusDelayed
} from "./order-material.slice";

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

/**
 * Do the reverse of idsArray
 *
 * This returns a string, separating ids with commas.
 *
 * @param {string|string[]} One or more ids.
 * @returns {string} Comma separated list of ids.
 */
function idsString(ids) {
  return typeof ids !== "string" ? ids.join() : ids;
}

function OrderMaterialEntry({
  text,
  helpText,
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
  // const [status, setStatus] = useState("initial");
  const stateId = idsString(ids);
  const status =
    useSelector(state => state.orderMaterial.status[stateId]) || "initial";
  const dispatch = useDispatch();
  const loggedIn = User.isAuthenticated();

  function onClick() {
    dispatch(orderMaterialPending({ id: stateId }));
    if (!loggedIn) {
      User.authenticate(loginUrl);
    }
  }

  useEffect(() => {
    if (status === "initial") {
      // Check that the material is available for ILL.
      dispatch(
        checkAvailibility({ id: stateId, pids: idsArray(ids), illCheckUrl })
      );
    }
    if (status === "pending") {
      if (loggedIn) {
        dispatch(
          orderMaterial({
            id: stateId,
            pids: idsArray(ids),
            pickupBranch,
            expires
          })
        );
      } else if (User.authenticationFailed()) {
        // If authentication failed, abort.
        dispatch(orderMaterialAborted({ id: stateId }));
        dispatch(resetStatusDelayed({ id: stateId }));
      }
    }
  }, [
    ids,
    pickupBranch,
    illCheckUrl,
    expires,
    loggedIn,
    stateId,
    status,
    dispatch
  ]);

  return (
    <OrderMaterial
      text={text}
      helpText={helpText}
      errorText={errorText}
      successText={successText}
      successMessage={successMessage}
      checkingText={checkingText}
      progressText={progressText}
      unavailableText={unavailableText}
      invalidPickupBranchText={invalidPickupBranchText}
      status={status}
      onClick={onClick}
      loginUrl={loginUrl}
      materialIds={idsArray(ids)}
    />
  );
}

OrderMaterialEntry.propTypes = {
  text: PropTypes.string,
  helpText: PropTypes.string,
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
  helpText: null,
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
