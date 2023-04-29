const db = require("../db/db.js");

module.exports = class Training {
  constructor(userId, name, description,date, workoutId) {
    this.userId = userId;
    this.name = name;
    this.description = description;
    this.date = date;
    this.workoutId = workoutId;
  }

  static async getAllChallenges(){
    let query = `SELECT event.eventid         AS id,
                        users.username        AS createdBy,
                        name,
                        date                  AS until,
                        event.description,
                        image,
                        (SELECT initcap(string_agg(equipment.name, ',')) AS targeted_muscles
                         FROM challenge as c2
                                  JOIN workout ON workout.workoutid = c2.workoutid
                                  JOIN workout_equipment ON workout.workoutid = workout_equipment.workoutid
                                  JOIN equipment on workout_equipment.equipmentid = equipment.equipmentid
                         WHERE c2.eventid = event.eventid
                         GROUP BY c2.eventid) as equipment
                 FROM event
                          INNER JOIN challenge ON event.eventid = challenge.eventid
                          INNER JOIN users ON event.userid = users.userid
    `;

    try{
      let result = await db.query(query,[]);
      return result.rows;
    }catch (e){
      console.log(e);
      return null;
    }
  }

  async saveChallenge(){
    let query = `INSERT INTO event (name, description,userid) VALUES ($1,$2,$3)`;

    try{
      await db.query(query,[this.name,this.description,this.userId]);

      query = "SELECT eventid FROM event WHERE userid = $1 ORDER BY eventid DESC LIMIT 1";
      let eventId = (await db.query(query,[this.userId])).rows[0].eventid;

      query = "INSERT INTO challenge (eventid, workoutid, date) VALUES ($1,$2,$3)";
      await db.query(query,[eventId,this.workoutId,this.date]);

      query = `SELECT event.eventid         AS id,
                        users.username        AS createdBy,
                        name,
                        date                  AS until,
                        event.description,
                        image,
                        (SELECT initcap(string_agg(equipment.name, ',')) AS targeted_muscles
                         FROM challenge as c2
                                  JOIN workout ON workout.workoutid = c2.workoutid
                                  JOIN workout_equipment ON workout.workoutid = workout_equipment.workoutid
                                  JOIN equipment on workout_equipment.equipmentid = equipment.equipmentid
                         WHERE c2.eventid = event.eventid
                         GROUP BY c2.eventid) as equipment
                 FROM event
                          INNER JOIN challenge ON event.eventid = challenge.eventid
                          INNER JOIN users ON event.userid = users.userid
                WHERE event.eventid = $1
    `;

      let result = await db.query(query,[eventId]);

      return result.rows;
    }catch (e){
      console.log(e);
      return null;
    }

  }

}