const db = require("../db/db");

module.exports = class Address{
  constructor(street,cityId){
    this.street = street;
    this.cityId = cityId;
  }

  async saveAddress(){
    const query = `INSERT INTO address (street, cityid) VALUES ($1,$2)`;

    try{
      let result = await db.query(query,[this.street,this.cityId]);
      return result.rowCount > 0;

    }catch (e){
      console.log(e);
      return null;
    }
  }

  static async getAddress(street, cityId){
    const query = `SELECT addressid FROM address WHERE street = $1 AND cityid = $2`;

    try{
      let result = await db.query(query,[street,cityId]);
      return result.rowCount > 0 ? result.rows[0].addressid : null;

    }catch (e){
      console.log(e);
      return null;
    }
  }
}