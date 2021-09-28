import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setToken, getToken, TOKEN_USER_KEY } from "../../../core/token";
import {
  setStatusAuthenticated,
  setStatusUnauthenticated
} from "../../../core/user.slice";

const CLIENT_ID = "bdc1d425-9117-4867-acb9-c7307ddc2e0f";
const REDIRECT_URL = `${window.location.origin}/?path=/story/adgangsplatformen--sign-in`;

// The Client ID is only pointing towards the URI's below
// http://ddb-react.docker/?path=/story/adgangsplatformen--sign-in
// https://danskernesdigitalebibliotek.github.io/ddb-react/?path=/story/adgangsplatformen--sign-in

function Auth() {
  const dispatch = useDispatch();
  const status = useSelector(s => s.user.status);

  const handleCleanUp = useCallback(() => {
    setToken(TOKEN_USER_KEY, null);
    dispatch(setStatusUnauthenticated());
  }, [dispatch]);

  const handleSignIn = () => {
    window.parent.location.href = `https://login.bib.dk/oauth/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URL}`;
  };

  const handleSignOut = () => {
    handleCleanUp();
    const token = getToken(TOKEN_USER_KEY);
    window.parent.location.href = `https://login.bib.dk/logout/?access_token=${token}`;
  };

  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.href);
    const code = urlParams.get("code");

    if (!code) {
      return;
    }

    console.info("CODE ", code);

    fetch("https://login.bib.dk/oauth/token", {
      method: "POST",
      headers: {},
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: CLIENT_ID,
        client_secret: "secret",
        redirect_uri: REDIRECT_URL
      })
    })
      .then(res => res.json())
      .then(token => {
        console.info("TOKEN ", token);

        // eslint-disable-next-line camelcase
        if (!token?.access_token) {
          throw new Error(token);
        }

        setToken(TOKEN_USER_KEY, token.access_token);
        dispatch(setStatusAuthenticated());
      })
      .catch(err => {
        console.error(err);
        handleCleanUp();
      });
  }, [dispatch, handleCleanUp]);

  return (
    <div style={{ width: "300px" }}>
      <h2>Adgangsplatformen</h2>
      <h5>
        Status:
        {status === "authenticated" ? (
          <span style={{ color: "green" }}> Signed in</span>
        ) : (
          <span style={{ color: "red" }}> Signed out</span>
        )}
      </h5>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gridColumnGap: 10
        }}
      >
        <button type="button" onClick={handleSignIn} style={{ width: "100%" }}>
          Sign in
        </button>

        <button type="button" onClick={handleSignOut} style={{ width: "100%" }}>
          Sign out
        </button>
      </div>
    </div>
  );
}

export default Auth;
