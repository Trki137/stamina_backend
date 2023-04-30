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