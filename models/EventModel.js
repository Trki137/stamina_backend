const db = require("../db/db");

module.exports = class Event{

  constructor(name, description,userId){
    this.name = name;
    this.description = description;
    this.userid = userId;
  }

  static async finishEvent(userId,eventId){
    const query = `UPDATE joined_event SET finished = true WHERE userid = $1 AND eventid = $2`;

    try{
      const result = await db.query(query,[userId,eventId]);
      return result.rowCount > 0;
    }catch (e){
      console.log(e);
      return null;
    }
  }

  async saveEvent(){
    let query = `INSERT INTO event (name, description, userid) VALUES ($1,$2,$3)`;

    try{
      let result = await db.query(query,[this.name,this.description,this.userid]);
      if(result.rowCount === 0) return null;

      query = `SELECT eventid FROM event WHERE userid = $1 ORDER BY eventid DESC LIMIT 1`;
      result = await db.query(query,[this.userid]);

      if(result.rowCount === 0) return null;

      return result.rows[0].eventid;
  }catch (e){
      console.log(e);
      return null;
    }
  }


  static async getEvent(eventId, userid){
    const query = `SELECT * FROM event WHERE eventid = $1 and userid= $2 ORDER BY eventid DESC LIMIT 1`;

    try{
      let result = await db.query(query,[eventId,userid]);
      return result.rowCount > 0 ? result.rows[0] : null;
    }catch (e){
      console.log(e);
      return null;
    }
  }

  static async joinEvent(userId, eventId){
    const query = `INSERT INTO joined_event (userid,eventid,finished) VALUES ($1,$2,$3)`;

    try{
      let result = await db.query(query,[userId,eventId,false]);
      return result.rowCount > 0;
    }catch (e){
      console.log(e);
      return null;
    }
  }

  static async unJoinEvent(userId,eventId){
    const query = `DELETE FROM joined_event WHERE userid = $1 AND eventid = $2`;

    try{
      let result = await db.query(query,[userId,eventId]);
      return result.rowCount > 0;
    }catch (e){
      console.log(e);
      return null;
    }
  }


  static async checkEvent(eventId){
    const query = "SELECT * FROM event WHERE eventid = $1";

    try{
      const result = await db.query(query,[eventId]);
      return result.rowCount > 0;
    }catch (e){
      console.log(e);
      return null;
    }
  }

  static async update(eventId,name,description){
    const query = `UPDATE event SET name=$1, description=$2 WHERE eventid=$3`;

    try{
      const result = await db.query(query,[name,description,eventId]);
      return result.rowCount > 0;
    }catch (e){
      console.log(e);
      return null;
    }
  }


}