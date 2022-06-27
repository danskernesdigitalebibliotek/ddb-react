import fetch from "unfetch";
import { getToken } from "./token";

/**
 * https://recommendation.libry.dk/swagger/index.html
 *
 * @class LibryRecommendationService
 */
class LibryRecommendationService {
  /**
   * Creates an instance of LibryRecommendationService.
   *
   * @param {object} options
   * @param {string} options.baseUrl
   */
  constructor({ baseUrl, clientId }) {
    this.baseUrl = baseUrl;
    this.clientId = clientId;
  }

  /**
   * Get recommendations for material.
   *
   * @param {object} options
   * @param {string} options.id the pid of the material to get recommendations for.
   */
  async getRecommendations({ id }) {
    if (!id) {
      throw Error("id must be specified");
    }

    const url = `${this.baseUrl}/${this.clientId}/recommendation/token/tag/ddb_library_dk/id/${id}`;
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${getToken("library")}`
      }
    });

    if (response.status !== 200) {
      throw Error(response.status);
    }

    return response.json().then(res => res.map(item => item.id));
  }
}

export default LibryRecommendationService;
