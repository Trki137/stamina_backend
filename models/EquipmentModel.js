const db = require("../db/db.js");

module.exports = class Equipment {
  static async getAllEquipment() {
    const query = `SELECT *
                   FROM equipment`;

    try {
      const result = await db.query(query, []);

      return result.rowCount > 0 ? result.rows : null;
    } catch (e) {
      console.log(e);
      return null;
    }

  }
}