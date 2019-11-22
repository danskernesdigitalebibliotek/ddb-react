import React from "react";
import PropTypes from "prop-types";

import Button from "../../components/atoms/button/button.js";

export function AddToChecklist({ loading, onClick, ...rest }) {
  // Here will also be server requests etc.
  if (loading === "active") {
    return <div>Tilføjet</div>;
  }

  if (loading === "failed") {
    return <div>Noget gik galt</div>;
  }

  return (
    <div className="ddb-container">
      <Button className="ddb-btn--charcoal" onClick={onClick}>
        {rest["ddb-text"]}
      </Button>
    </div>
  );
}

AddToChecklist.defaultProps = {
  ddbText: "Tilføj til min huskeliste",
  loading: "inactive"
};

AddToChecklist.propTypes = {
  ddbText: PropTypes.string,
  onClick: PropTypes.func.isRequired,
  loading: PropTypes.oneOf(["inactive", "active", "failed", "finished"])
};

export default AddToChecklist;
