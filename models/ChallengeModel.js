const db = require("../db/db.js");
const Event = require("./EventModel");

module.exports = class Challange {
  constructor(userId, name, description,date) {
    this.userId = userId;
    this.name = name;
    this.description = description;
    this.date = date;
  }

  static async getAllChallenges(userid){
    let query = `SELECT event.eventid         AS id,
                        users.username        AS createdBy,
                        name,
                        date                  AS until,
                        event.description,
                        image
                 FROM event
                          INNER JOIN challenge ON event.eventid = challenge.eventid
                          INNER JOIN users ON event.userid = users.userid
                 WHERE event.eventid NOT IN
                       (SELECT joined_event.eventid FROM joined_event WHERE joined_event.userid = $1)
                        AND to_date(challenge.date, 'DD.MM.YYYY') >= CURRENT_DATE
    `;

    try{
      let result = await db.query(query,[userid]);
      return result.rows;
    }catch (e){
      console.log(e);
      return null;
    }
  }

  async saveChallenge(){
    try{
      const eventModel = new Event(this.name,this.description,this.userId);
      let eventId = await eventModel.saveEvent();

      let query = "INSERT INTO challenge (eventid, date) VALUES ($1,$2)";
      await db.query(query,[eventId,this.date]);

      query = `SELECT event.eventid         AS id,
                        users.username        AS createdBy,
                        name,
                        date                  AS until,
                        event.description,
                        image
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

  static async getMyChallenges(userId) {
    const query = `SELECT event.eventid         AS id,
                          users.username        AS createdBy,
                          name,
                          date                  AS until,
                          event.description,
                          image,
                          finished
                   FROM event
                            INNER JOIN challenge ON event.eventid = challenge.eventid
                            INNER JOIN users ON event.userid = users.userid
                            INNER JOIN joined_event
                                       ON event.eventid = joined_event.eventid
                   WHERE joined_event.userid = $1`;

    try{
      const result = await db.query(query,[userId]);
      return result.rows;
    }catch (e){
      console.log(e);
      return null;
    }


  }


  static async update(eventId,date,name,description){
    let result = await Event.update(eventId,name,description);

    if(!result) return null;

    const query = `UPDATE challenge SET date=$1 WHERE eventid = $2`;
    try{
      result = await db.query(query,[date,eventId]);
      return result.rowCount  > 0;
    }catch (e){
      console.log(e);
      return null;
    }
  }

}