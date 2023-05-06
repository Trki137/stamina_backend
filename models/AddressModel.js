const db = require("../db/db");

module.exports = class Address{
  constructor(street,cityId,latitude,longitude){
    this.street = street;
    this.cityId = cityId;
    this.latitude = latitude;
    this.longitude = longitude;

  }

  async saveAddress(){
    let query = `INSERT INTO address (street, cityid, latitude,longitude) VALUES ($1,$2,$3,$4)`;

    try{
      let result = await db.query(query,[this.street,this.cityId,this.latitude,this.longitude]);
      if(result.rowCount === 0) return null;

      query = `SELECT addressid FROM address WHERE cityid = $1 AND street = $2`;
      result = await db.query(query, [this.cityId, this.street]);

      return result.rowCount > 0 ? result.rows[0].addressid : null;
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

  static async updateAddress(addressId,street,latitude,longitude){
    const query = `UPDATE address SET street = $1, latitude=$2, longitude = $3 WHERE addressid = $4`;

    try{
      const result = await db.query(query,[street,latitude,longitude,addressId]);
      return result.rowCount > 0;
    }catch (e){
      console.log(e);
      return null;
    }
  }

  static async checkAddress(addressId){
    const query = `SELECT * FROM address WHERE addressid = $1`;

    try{
      const result = await db.query(query,[addressId]);
      return result.rowCount > 0;
    }catch (e){
      console.log(e);
      return null;
    }
  }

}