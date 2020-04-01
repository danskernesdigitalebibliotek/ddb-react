import { createElement } from "react";
import { render } from "react-dom";

import { withErrorBoundary } from "react-error-boundary";
import ErrorBoundary from "../components/alert/alert";
import { setToken } from "./token";

/**
 * We look for containers and corresponding applications.
 * Thereafter we mount them if a corresponding container and application can be found.
 *
 * @param {HTMLElement} context - The HTML element you want to search for app containers in.
 */
function mount(context) {
  if (!context) return;
  const appContainers = context.querySelectorAll("[data-ddb-app]");

  function mountApp(container) {
    const appName = container?.dataset?.ddbApp;
    const app = window.ddbReact?.apps?.[appName];
    // Ensure that the application exists and that the container isn't already populated.
    const isValidMount = app && !container.innerHTML;
    if (isValidMount) {
      render(
        createElement(withErrorBoundary(app, ErrorBoundary), {
          ...container.dataset
        }),
        container
      );
    }
  }

  appContainers.forEach(mountApp);
}

/**
 * If you want to remove all ddb apps in a certain context.
 *
 * @param {HTMLElement} context - The HTML element you want to search for app containers in.
 */
function unmount(context) {
  if (!context) return;
  const appContainers = context.querySelectorAll("[data-ddb-app]");

  function unMountApp(container) {
    const appContainerToUnmount = container;
    appContainerToUnmount.innerHTML = "";
  }
  appContainers.forEach(unMountApp);
}

function init() {
  const initial = {
    apps: {},
    setToken,
    mount,
    unmount
  };
  window.ddbReact = {
    ...(window.ddbReact || {}),
    ...initial
  };
}

// Inject into the global namespace for third party access.
init();
