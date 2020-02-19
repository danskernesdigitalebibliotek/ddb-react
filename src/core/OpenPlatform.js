import chunk from "lodash/chunk";
import isEmpty from "lodash/isEmpty";
import fetch from "unfetch";
import { getToken } from "./token";

/**
 * A dedicated formatter array parameters.
 *
 * OpenPlatform cannot figure out that some parameters are arrays of
 * strings if there's no comma in it.
 *
 * This goes for pids, agencyIds and branchIds, at least. Fields seems
 * unaffected.
 *
 * We'll just add a trailing comma in all cases, as it doesn't seem to
 * do any harm.
 *
 * @param {string[]} items
 * @returns {string} string of items
 * @memberof OpenPlatform
 */
function formatUrlArray(items = []) {
  return `${items.map(encodeURIComponent).join(",")},`;
}

/**
 * @typedef Work
 * In "definitions" look for "Work" to see all the different fields
 * one can get.
 * https://openplatform.dbc.dk/v3/swagger.json
 * https://raw.githubusercontent.com/DBCDK/serviceprovider/master/doc/work-context.jsonld
 */

/**
 * @typedef Availability
 * In "definitions" look for "Availability" to see all the different fields
 * one can get.
 * https://openplatform.dbc.dk/v3/swagger.json
 */

/**
 * @typeof User
 * In "definitions" look for "User" to see all the different fields
 * one can get.
 * https://openplatform.dbc.dk/v3/swagger.json
 */

/**
 * @typeof Library
 * In "definitions" look for "Libraries" (yes, plural, "Library" is another data structure) to see all the different fields
 * one can get.
 * https://openplatform.dbc.dk/v3/swagger.json
 */

class OpenPlatform {
  constructor() {
    this.token = getToken();
    this.baseUrl = "https://openplatform.dbc.dk/v3";
  }

  /**
   * Do a request against OpenPlatform and return data.
   *
   * Unpacks a standard OpenPlatform response and returns the data.
   * Throws in case of errors.
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

    const response = await rawResponse.json();
    if (response.statusCode !== 200) throw Error(response.error);
    if (!response.data) throw Error("data not found");

    return response.data;
  }

  /**
   * Retrieve meta information about creative work(s).
   * In other words, books, cd's etc.
   *
   * @param {object} options
   * @param {string[]} options.pids - id's of the work.
   * @param {string[]} options.fields - https://raw.githubusercontent.com/DBCDK/serviceprovider/master/doc/work-context.jsonld
   * @returns {Promise<Work[]>}
   * @memberof OpenPlatform
   */
  async getWork({ pids = [], fields = ["title"] } = {}) {
    // OpenPlatform allows retrieval of a maximum of 20 pids per request.
    // Chunk large pid sets and merge the results.
    const pidLimit = 20;
    if (pids.length > pidLimit) {
      const responses = chunk(pids, pidLimit).map(pidChunk =>
        this.getWork({ pids: pidChunk, fields })
      );
      return Promise.all(responses).then(results => {
        return [].concat(...results);
      });
    }

    const formattedPids = formatUrlArray(pids);
    const formattedFields = fields.map(encodeURIComponent).join(",");

    const works = await this.request(
      `work?access_token=${this.token}&fields=${formattedFields}&pids=${formattedPids}`
    );

    return works.filter(result => !isEmpty(result));
  }

  /**
   * Retrieve availability information about work(s).
   *
   * @param {object} options
   * @param {string[]} options.pid - id's of work(s)
   * @param {string[]} options.fields - Fields to fetch, see swagger.json.
   * @returns {Availability[]}
   * @memberof OpenPlatform
   */
  async getAvailability({
    pids = [],
    fields = ["expectedDelivery", "orderPossible", "willLend"]
  }) {
    const formattedPids = formatUrlArray(pids);
    const formattedFields = fields.map(encodeURIComponent).join(",");

    return this.request(
      `availability?access_token=${this.token}&fields=${formattedFields}&pids=${formattedPids}`
    );
  }

  /**
   * Check if a material can be ordered.
   *
   * @param {string} pid - id of work
   * @returns {Promise<boolean>}
   */
  async canBeOrdered(pid) {
    function getAvailabilityResult(response) {
      // The API says there can be more than one reply, but nobody
      // defines what that means. So if case there's more than one
      // reply, only return true if all items are order-able.

      return response.every(orderStat => {
        return orderStat.orderPossible;
      });
    }
    return this.getAvailability({ pids: [pid] }).then(getAvailabilityResult);
  }

  /**
   * Order a material.
   *
   * Note that while this takes a list of pids, it seems that they're
   * considered alternatives (for instance different editions of the
   * same book), not separate materials to order.
   *
   * @param {string} pids - id of works
   * @returns {void}
   */
  async orderMaterial({ pids = [], pickupBranch = null, expires = null }) {
    // This gets dicey. When doing the request, the browser makes a
    // pre-flight CORS OPTIONS request to the server to check if it's
    // allowed to do the request. Unfortunately, OpenPlatform is too
    // aggressive in its validation, and tries to validate all the
    // parameters, but as the OPTIONS request does not have the JSON
    // body of the POST request, it cannot find any parameters and
    // complains about missing access_token, pids, etc. So we
    // duplicate all the parameters in the URL in order for the
    // pre-flight check to pass, which defeats some of the point in
    // using POST in the first place (that parameters isn't in the URL
    // that might end up in logs somewhere). But POST is still the
    // most semantically correct method to use.
    const parameters = [
      `access_token=${this.token}`,
      "orderType=normal",
      `expires=${expires}`,
      `pickUpBranch="${pickupBranch}"`
    ];

    const body = {
      // No access_token as that would make OpenPlatform complain
      // about multiple tokens.
      orderType: "normal",
      expires,
      pickUpBranch: pickupBranch
    };

    parameters.push(`pids=${formatUrlArray(pids)}`);
    body.pids = pids;

    // Try to supply the parameters that the library requires for
    // orders. They are listed on the library.
    const [user, branch] = await Promise.all([
      this.getUser(),
      this.getBranch(pickupBranch)
    ]);
    function eachOrderParameter(parameter) {
      switch (parameter) {
        case "userId":
        case "pincode":
          // OpenPlatform should take care of these.
          break;

        case "name":
          parameters.push(`name=${user.name}`);
          body.name = user.name;
          break;

        case "address":
          parameters.push(`address=${user.address}`);
          body.address = user.address;
          break;

        case "email":
          parameters.push(`email=${user.mail}`);
          body.email = user.mail;
          break;

        case "phone":
          // OpenPlatform doesn't supply phone number for users, so fake one.
          parameters.push(`phone=12345678`);
          body.phone = "12345678";
          break;

        default:
        // Oh bollocks, we have no idea what to do. Try soldiering on
        // and hope the best.
      }
    }
    branch.orderParameters.forEach(eachOrderParameter);

    return this.request(`order?${parameters.join("&")}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
  }

  /**
   * Get user information.
   *
   * @returns {User}
   */
  async getUser() {
    return this.request(`user?access_token=${this.token}`);
  }

  /**
   * Get libraries information.
   *
   * @param {object} options
   * @param {string[]} options.agencyIds - Agency ids to look up
   * @param {string[]} options.branchIds - Branch ids to look up
   * @returns {Library[]}
   */
  async getLibraries({ agencyIds = [], branchIds = [] }) {
    const parameters = [`access_token=${this.token}`];

    if (agencyIds.length > 0) {
      parameters.push(`agencyIds=${formatUrlArray(agencyIds)}`);
    }

    if (branchIds.length > 0) {
      parameters.push(`branchIds=${formatUrlArray(branchIds)}`);
    }

    return this.request(`libraries?${parameters.join("&")}`);
  }

  /**
   * Get branch information.
   *
   * @param {string} branchId - Branch id to look up.
   * @returns {Library}
   */
  async getBranch(branchId) {
    const branches = await this.getLibraries({ branchIds: [branchId] });

    if (branches.length < 1) throw Error("branch not found");

    return branches[0];
  }
}

export default OpenPlatform;
