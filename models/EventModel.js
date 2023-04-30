const db = require("../db/db");
const Address = require("./AddressModel");
const City = require("./CityModel");

module.exports = class Event{
  constructor(name, description,userId, max_space,date_time, street,pbr,cityName){
    this.name = name;
    this.description = description;
    this.userid = userId;
    this.max_space = max_space;
    this.date_time = date_time;
    this.street = street;
    this.pbr = pbr;
    this.cityName = cityName;
  }

  async saveEvent(){
    let query = `INSERT INTO event (name, description, userid) VALUES ($1,$2,$3)`;

    try{
      let result = await db.query(query,[this.name,this.description,this.userid]);
      if(result.rowCount === 0) return null;

      query = `SELECT eventid FROM event WHERE userid = $1 ORDER BY eventid DESC LIMIT 1`;
      result = await db.query(query,[this.userid]);

      if(result.rowCount === 0) return null;

      const eventId = result.rows[0].eventid;

      const cityModel = new City(this.pbr,this.cityName);

      let cityId = await City.getCity(this.pbr);

      if(!cityId){
        cityId = await cityModel.saveCity();
        if(!cityId) return null;
      }

      const addressModel = new Address(this.street, cityId);

      const addressId = await addressModel.saveAddress();

      if (!addressId) return null;

      query = `INSERT INTO group_event (max_space, eventid, addressid, date_time) VALUES ($1,$2,$3,$4)`;
      result = await db.query(query,[this.max_space,eventId,addressId,this.date_time]);

      return result.rowCount > 0;
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
    const query = `INSERT INTO joined_event (userid,eventid) VALUES ($1,$2)`;

    try{
      let result = await db.query(query,[userId,eventId]);
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

  static async getAllEvents(){
    const query = `SELECT event.eventid                      AS id,
                          users.username                     AS createdby,
                          event.name,
                          date_time                          AS startsAt,
                          event.description,
                          (SELECT group_event.max_space - COUNT(joined_event_id)
                           FROM group_event AS g2
                                    JOIN joined_event ON g2.eventid = joined_event.eventid
                           WHERE g2.eventid = event.eventid) as remainingSpace,
                          city.name                          as city,
                          address.street                     as address,
                          users.image
                   FROM event
                            JOIN group_event ON event.eventid = group_event.eventid
                            JOIN users ON event.userid = users.userid
                            JOIN address ON group_event.addressid = address.addressid
                            JOIN city ON address.cityid = city.cityid`

    try{
      let result = await db.query(query,[]);
      return result.rowCount > 0;
    }catch (e){
      console.log(e);
      return null;
    }
  }


}