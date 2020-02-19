import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import urlPropType from "url-prop-type";

import Searchlist from "./searchlist";
import FollowSearches from "../../core/FollowSearches";

function SearchlistEntry({
  followSearchesUrl,
  removeButtonText,
  emptyListText,
  errorText,
  goToSearchText,
  searchUrl
}) {
  const [searches, setSearches] = useState([]);
  const [loading, setLoading] = useState("inactive");

  useEffect(() => {
    function onGetSearchesFinished(result) {
      setSearches(result);
      setLoading("finished");
    }

    function onGetSearchesError() {
      setLoading("failed");
    }

    setLoading("active");

    const client = new FollowSearches({ baseUrl: followSearchesUrl });
    client
      .getSearches()
      .then(onGetSearchesFinished)
      .catch(onGetSearchesError);
  }, [followSearchesUrl]);

  function removeSearch(id) {
    const fallback = [...searches];

    function removeDeletedSearch(search) {
      return search.id !== id;
    }
    setSearches(searches.filter(removeDeletedSearch));

    function onDeleteSearchError() {
      setSearches(fallback);
    }

    const client = new FollowSearches({ baseUrl: followSearchesUrl });
    client.deleteSearch({ searchId: id }).catch(onDeleteSearchError);
  }

  return (
    <Searchlist
      loading={loading}
      searches={searches}
      onRemoveSearch={removeSearch}
      removeButtonText={removeButtonText}
      errorText={errorText}
      emptyListText={emptyListText}
      goToSearchText={goToSearchText}
      searchUrl={searchUrl}
    />
  );
}

SearchlistEntry.propTypes = {
  followSearchesUrl: urlPropType,
  removeButtonText: PropTypes.string,
  errorText: PropTypes.string,
  emptyListText: PropTypes.string,
  goToSearchText: PropTypes.string,
  searchUrl: urlPropType.isRequired
};

SearchlistEntry.defaultProps = {
  followSearchesUrl: "https://stage.followsearches.dandigbib.org",
  removeButtonText: "Fjern fra listen",
  emptyListText: "Ingen gemte søgninger.",
  errorText: "Gemte søgninger kunne ikke hentes.",
  goToSearchText: "Gå til søgeresultat"
};

export default SearchlistEntry;
