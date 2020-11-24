import fetch from "unfetch";

class DingIll {
  constructor(url) {
    this.baseUrl = url;
  }

  /**
   * Do a request against Ding and return data.
   *
   * @param {string} path - path to request
   * @param {object} options - additional options for fetch
   */
  async request(path, options = {}) {
    const defaults = {
      headers: { Accept: "application/json" }
    };

    const rawResponse = await fetch(`${this.baseUrl}/${path}`, {
      ...defaults,
      ...options
    });

    return rawResponse.json();
  }

  async isAvailableForIll(pids) {
    return this.request(pids.join(",")).then(response => {
      return response.canBeOrdered;
    });
  }
}

export default DingIll;
