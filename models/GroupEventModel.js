const db = require("../db/db");
const City = require("./CityModel");
const Address = require("./AddressModel");
const Event = require("./EventModel");

module.exports = class GroupEvent {
  constructor(name, description, userId, max_space, date_time, street, pbr, cityName,latitude,longitude) {
    this.name = name;
    this.description = description;
    this.userid = userId;
    this.max_space = max_space;
    this.date_time = date_time;
    this.street = street;
    this.pbr = pbr;
    this.cityName = cityName;
    this.latitude = latitude;
    this.longitude = longitude;
  }

  async saveEvent() {
    try {
      const eventModel = new Event(this.name, this.description, this.userid);
      let eventId = await eventModel.saveEvent();

      const cityModel = new City(this.pbr, this.cityName);

      let cityId = await City.getCity(this.pbr);

      if (!cityId) {
        cityId = await cityModel.saveCity();
        if (!cityId) return null;
      }

      const addressModel = new Address(this.street, cityId,this.latitude,this.longitude);

      const addressId = await addressModel.saveAddress();

      if (!addressId) return null;

      const query = `INSERT INTO group_event (max_space, eventid, addressid, date_time)
                     VALUES ($1, $2, $3, $4)`;
      const result = await db.query(query, [this.max_space, eventId, addressId, this.date_time]);

      if (result.rowCount === 0) return null;

      return await GroupEvent.getChallenge(eventId, this.userid);
    } catch (e) {
      console.log(e);
      return null;
    }
  }


  static async getChallenge(eventId, userId) {
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
                            JOIN city ON address.cityid = city.cityid
                   WHERE event.eventid = $1
                     AND event.userid = $2;
    `;

    try {
      let result = await db.query(query, [eventId, userId]);
      return result.rowCount > 0 ? result.rows[0] : null;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  static async getAllEvents(userId) {
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
                            JOIN city ON address.cityid = city.cityid
                   WHERE event.eventid NOT IN
                         (SELECT joined_event.eventid FROM joined_event WHERE joined_event.userid = $1)
                     AND (to_timestamp(date_time, 'YYYY.MM.DD-HH24:MI:SS')::TIMESTAMP WITHOUT TIME ZONE) >
                         CURRENT_TIMESTAMP;
    `;

    try {
      let result = await db.query(query, [userId]);
      return result.rows;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  static async getMyEvents(userId) {
    const query = `SELECT event.eventid                      AS id,
                            city.cityid,
                            address.addressid,
                          users.username                     AS createdby,
                          event.name,
                          date_time                          AS startsAt,
                          event.description,
                          (SELECT group_event.max_space - COUNT(joined_event_id)
                           FROM group_event AS g2
                                    JOIN joined_event ON g2.eventid = joined_event.eventid
                           WHERE g2.eventid = event.eventid) as remainingSpace,
                          group_event.max_space,
                          city.name                          as city,
                          address.street                     as address,
                          users.image,
                          city.pbr,
                          latitude,
                          longitude
                   FROM event
                            JOIN group_event ON event.eventid = group_event.eventid
                            JOIN users ON event.userid = users.userid
                            JOIN address ON group_event.addressid = address.addressid
                            JOIN city ON address.cityid = city.cityid
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

  static async updateGroupEvent(max_space,date_time,eventId,cityId,pbr,name,addressId,street,latitude,longitude,eventName, description){
    let result = await City.updateCity(cityId,pbr,name);
    if(!result) return null;

    result = await Address.updateAddress(addressId,street,latitude,longitude);
    if(!result) return null;

    result = await Event.update(eventId,eventName, description)
    if(!result) return null;
    const query = `UPDATE group_event SET max_space = $1, date_time=$2 WHERE eventid = $3`;

    try{
      result = await db.query(query,[max_space,date_time,eventId]);
      return result.rowCount > 0;
    }catch (e){
      console.log(e);
      return null;
    }
  }
};