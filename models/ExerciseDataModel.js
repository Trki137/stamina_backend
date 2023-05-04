const db = require("../db/db");
const Activity = require("./ActivityModel");

module.exports = class ExerciseData{
  constructor(name,date,userId,trainingId, time, calories,avg_hearth_rate) {
    this.name = name;
    this.date = date;
    this.userId = userId;
    this.trainingId = trainingId;
    this.time = time;
    this.calories = calories;
    this.avg_hearth_rate = avg_hearth_rate;
  }

  async saveExerciseData(){
    const activityModel = new Activity(this.name,this.date,this.userId,this.trainingId);

    try{
      let activityId = await activityModel.saveActivity();
      if(!activityId) return null;
      const query = `INSERT INTO exercise_data (time, calories, avg_hearth_rate, activityid) VALUES ($1,$2,$3,$4)`;
      const result = await db.query(query,[this.time,this.calories,this.avg_hearth_rate,activityId]);

      return result.rowCount > 0;
    }catch (e){
      console.log(e);
      return null;
    }
  }

  static async getUserData(userId){
    const query = `SELECT name,
                          date,
                          time,
                          calories,
                          avg_hearth_rate
                   FROM exercise_data
                            JOIN activity ON exercise_data.activityid = activity.activityid
                   WHERE userid = $1`;
    try{
      return (await db.query(query, [userId])).rows;
    }catch (e){
      console.log(e);
      return null;
    }
  }

  static async getAvgUserData(userId){
    const query = `SELECT date,
                          TRUNC(AVG(time::FLOAT))   AS avgtime,
                          TRUNC(AVG(calories))        AS avgcalories,
                          TRUNC(AVG(avg_hearth_rate)) AS avg_hearth_rate
                   FROM exercise_data
                            JOIN activity ON exercise_data.activityid = activity.activityid
                   WHERE userid <> $1
                   GROUP BY DATE`;

    try{
      return (await db.query(query, [userId])).rows;
    }catch (e){
      console.log(e);
      return null;
    }
  }

}