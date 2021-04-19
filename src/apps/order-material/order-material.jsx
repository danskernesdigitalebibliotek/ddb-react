import React, { useState } from "react";
import PropTypes from "prop-types";
import urlPropType from "url-prop-type";

import Button from "../../components/atoms/button/button";
import Dialog from "../../components/atoms/dialog/dialog";
import Alert from "../../components/alert/alert";
import User from "../../core/user";
import replacePlaceholders from "../../core/replacePlaceholders";

function OrderMaterial({
  status,
  checkingText,
  progressText,
  unavailableText,
  invalidPickupBranchText,
  onClick,
  text,
  helpText,
  errorText,
  successText,
  successMessage,
  loginUrl,
  materialIds
}) {
  const [open, setOpen] = useState(true);
  const closeDialog = () => setOpen(false);

  switch (status) {
    case "initial":
      // Don't render anything until we start checking if the material
      // can be ordered.
      return null;

    case "checking":
      return (
        <div className="ddb-order-material__container">
          <Alert message={checkingText} type="polite" variant="info" />
        </div>
      );

    case "unavailable":
      return (
        <div className="ddb-order-material__container">
          <Alert message={unavailableText} type="polite" variant="info" />
        </div>
      );

    case "invalid branch":
      return (
        <div className="ddb-order-material__container">
          <Alert
            message={invalidPickupBranchText}
            type="polite"
            variant="warning"
          />
        </div>
      );

    case "processing":
      return (
        <div className="ddb-order-material__container">
          <Alert message={progressText} type="polite" variant="info" />
        </div>
      );

    case "finished":
      return (
        <>
          <div className="ddb-order-material__container">
            <Alert message={successText} type="polite" variant="success" />
          </div>
          <Dialog
            label="Tilføj søgning til liste"
            showCloseButton
            dropDown
            isOpen={open}
            onDismiss={closeDialog}
          >
            <Alert message={successMessage} type="polite" variant="blank" />
          </Dialog>
        </>
      );

    case "failed":
      return (
        <div className="ddb-order-material__container">
          <Alert message={errorText} type="polite" variant="warning" />
        </div>
      );

    default:
      return (
        <div className="ddb-order-material__container">
          <Button
            href={
              !User.isAuthenticated()
                ? replacePlaceholders({
                    text: loginUrl,
                    tags: {
                      // Urls only support a single material id so assume we
                      // want to use the first.
                      id: encodeURIComponent(materialIds.first)
                    }
                  })
                : undefined
            }
            variant="black"
            align="left"
            onClick={onClick}
          >
            {text}
          </Button>
          {helpText ? (
            <div className="ddb-order-material__help">{helpText}</div>
          ) : null}
        </div>
      );
  }
}

OrderMaterial.propTypes = {
  text: PropTypes.string.isRequired,
  helpText: PropTypes.string,
  errorText: PropTypes.string.isRequired,
  successText: PropTypes.string.isRequired,
  successMessage: PropTypes.string.isRequired,
  checkingText: PropTypes.string.isRequired,
  progressText: PropTypes.string.isRequired,
  unavailableText: PropTypes.string.isRequired,
  invalidPickupBranchText: PropTypes.string.isRequired,
  loginUrl: urlPropType.isRequired,
  onClick: PropTypes.func.isRequired,
  status: PropTypes.oneOf([
    "initial",
    "checking",
    "unavailable",
    "invalid branch",
    "ready",
    "processing",
    "failed",
    "finished"
  ]),
  materialIds: PropTypes.arrayOf(PropTypes.string).isRequired
};

OrderMaterial.defaultProps = {
  helpText: null,
  status: "initial"
};

export default OrderMaterial;
