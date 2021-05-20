import fetch from "unfetch";
import { getToken } from "./token";

/**
 * https://github.com/reload/material-list/blob/develop/spec/material-list-1.0.0.yaml
 *
 * @class MaterialList
 */
class MaterialList {
  constructor({ baseUrl }) {
    this.baseUrl = baseUrl;
  }

  /**
   * Get list with materials.
   *
   * @param {string} listId
   * @returns {Promise<string[]>}
   * @memberof MaterialList
   */
  async getList(listId = "default") {
    const raw = await fetch(`${this.baseUrl}/list/${listId}`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${getToken("user")}`
      }
    });
    if (raw.status !== 200) {
      throw Error(raw.status);
    }
    const response = await raw.json();
    return response.materials;
  }

  /**
   * Check existence of material on list.
   *
   * @param {object} options
   * @param {string} options.listId
   * @param {string} options.materialId
   * @returns {Promise<boolean>}
   * @memberof MaterialList
   */
  async checkListMaterial({ listId = "default", materialId } = {}) {
    if (!materialId) {
      throw Error("materialId must be specified");
    }
    const response = await fetch(
      `${this.baseUrl}/list/${listId}/${materialId}`,
      {
        method: "HEAD",
        headers: {
          Authorization: `Bearer ${getToken("user")}`
        }
      }
    );
    if (response.status !== 200 && response.status !== 404) {
      throw Error(response.status);
    }

    return response.status === 200;
  }

  /**
   * Add material to the the list.
   *
   * @param {object} options
   * @param {string} options.listId
   * @param {string} options.materialId
   * @returns {Promise}
   * @memberof MaterialList
   */
  async addListMaterial({ listId = "default", materialId } = {}) {
    if (!materialId) {
      throw Error("materialId must be specified");
    }
    const response = await fetch(
      `${this.baseUrl}/list/${listId}/${materialId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${getToken("user")}`
        }
      }
    );
    if (response.status !== 201) {
      throw Error(response.status);
    }
  }

  /**
   * Delete material from list.
   *
   * @param {object} options
   * @param {string} options.listId
   * @param {string} options.materialId
   * @returns {Promise}
   * @memberof MaterialList
   */
  async deleteListMaterial({ listId = "default", materialId } = {}) {
    if (!materialId) {
      throw Error("materialId must be specified");
    }
    const response = await fetch(
      `${this.baseUrl}/list/${listId}/${materialId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken("user")}`
        }
      }
    );
    if (response.status !== 204) {
      throw Error(response.status);
    }
  }
}

export default MaterialList;
