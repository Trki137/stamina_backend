const db = require("../db/db");

module.exports = class City{
  constructor(pbr, name){
    this.pbr = pbr;
    this.name = name;
  }

  async saveCity(){
    const query = `INSERT INTO city (pbr,name) VALUES ($1,$2)`;

    try{
      let result = await db.query(query,[this.pbr,this.name]);
      return result.rowCount > 0;
    }catch (e){
      console.log(e);
      return null;
    }

  }

  static async getCity(cityId){
    const query = `SELECT * FROM city WHERE cityid = $1`;

    try{
      let result = await db.query(query,[cityId]);
      return result.rowCount > 0 ? result.rows : null;
    }catch (e){
      console.log(e);
      return null;
    }
  }
}