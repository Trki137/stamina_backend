const db = require("../db/db");

module.exports = class City{
  constructor(pbr, name){
    this.pbr = pbr;
    this.name = name;
  }

  async saveCity(){
    let query = `INSERT INTO city (pbr,name) VALUES ($1,$2)`;

    try{
      let result = await db.query(query,[this.pbr,this.name]);
      if(result.rowCount === 0) return null;

      query = `SELECT cityid FROM city WHERE pbr = $1 AND name = $2`;
      result = await db.query(query,[this.pbr,this.name]);

      return result.rowCount > 0 ? result.rows[0].cityid : null;
    }catch (e){
      console.log(e);
      return null;
    }

  }

  static async checkCity(cityId){
    const query = `SELECT * FROM city WHERE cityid = $1`;

    try{
      const result = await db.query(query,[cityId]);
      return result.rowCount > 0;
    }catch (e){
      console.log(e);
      return null;
    }
  }

  static async updateCity(cityId,pbr,name){
    const query = `UPDATE city SET pbr = $1, name = $2 WHERE cityid = $3`;

    try{
      const result = await db.query(query,[pbr,name,cityId]);
      return result.rowCount > 0;
    }catch (e){
      console.log(e);
      return null;
    }
  }
  static async getCity(pbr){
    const query = `SELECT * FROM city WHERE pbr = $1`;

    try{
      let result = await db.query(query,[pbr]);
      return result.rowCount > 0 ? result.rows[0].cityid : null;
    }catch (e){

      console.log(e);
      return null;
    }
  }
}