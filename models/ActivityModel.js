const db = require("../db/db");

module.exports = class Activity{
    constructor(name, date,userId,trainingId) {
      this.name = name;
      this.date = date;
      this.userId = userId;
      this.trainingId = trainingId;
    }

    async saveActivity(){
      let query = `INSERT INTO activity (name, date, userid, trainingid) VALUES ($1,$2,$3,$4)`;

      try{
        let result = await db.query(query,[this.name,this.date,this.userId,this.trainingId]);

        if(result.rowCount === 0) return null;

        query = `SELECT activityid FROM activity WHERE userid=$1 AND date=$2 AND trainingid=$3`;
        result = await db.query(query,[this.userId, this.date, this.trainingId]);

        return result.rowCount > 0 ? result.rows[0].activityid : null;
      }catch (e){
        console.log(e);
        return null;
      }
  }
}