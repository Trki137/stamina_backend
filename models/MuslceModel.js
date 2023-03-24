const db = require("../db/db.js");

module.exports = class Muscle {

   static async getAllMuscles(){
    const query = `SELECT * FROM muscle_group`;

    try{
      const result = await db.query(query,[]);

      return result.rowCount !== 0 ? Muscle.renameMuscles(result.rows) : null;
    }catch (e){
      console.log(e);
    }
  }

  static renameMuscles(data){
    for(let i = 0;  i < data.length; i++){
      data[i].input_name = data[i].name;
      if(data[i].name.includes("-")){
        data[i].name = data[i].name.replace("-", " ");
      }

      data[i].name = data[i].name.charAt(0).toUpperCase() + data[i].name.slice(1);
    }

    return data;
  }

}