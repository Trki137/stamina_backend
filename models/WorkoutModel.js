const db = require("../db/db.js");
const Muscle = require("./MuslceModel");
module.exports = class Workout {

  constructor(name, description, intensity, equipment, muscle) {
    this.name = name;
    this.description = description;
    this.intensity = intensity;
    this.equipment = equipment;
    this.muscle = muscle;
  }

  static async checkEquipment(equipment) {
    const query = `SELECT *
                   FROM equipment
                   where equipmentid = $1`;

    for (let i = 0; i < equipment.length; i++) {
      const result = await db.query(query, [equipment[i]]);

      if (result.rowCount === 0) return false;
    }

    return true;
  }

  static async checkMuscles(muscle_group) {
    const query = `SELECT *
                   FROM muscle_group
                   where muscleid = $1`;

    for (let i = 0; i < muscle_group.length; i++) {
      const result = await db.query(query, [muscle_group[i]]);

      if (result.rowCount === 0) return false;
    }

    return true;
  }

  async addWorkout() {
    const workoutQuery = `INSERT INTO workout (name, description, intensity)
                          VALUES ($1, $2, $3) RETURNING workoutid`;

    const workoutEquipmentQuery = `INSERT INTO workout_equipment (workoutid, equipmentid)
                                   VALUES ($1, $2)`;

    const workoutMuscleTargeted = `INSERT INTO muscle_workout_target (workoutid, muscleid)
                                   VALUES ($1, $2)`;


    try {
      let workoutId = await db.query(workoutQuery, [this.name, this.description, this.intensity]);
      workoutId = workoutId.rows[0].workoutid;
      if (this.equipment && this.equipment.length > 0) {
        for (let i = 0; i < this.equipment.length; i++) {
          const result = await db.query(workoutEquipmentQuery, [workoutId, this.equipment[i]]);
          if (result.rowCount !== 1) {
            console.log("Couldn't save workout equipment");
            return null;
          }

        }

      }

      if (this.muscle === 0) return true;

      for (let i = 0; i < this.muscle.length; i++) {
        const result = await db.query(workoutMuscleTargeted, [workoutId, this.muscle[i]]);
        if (result.rowCount !== 1) {
          console.log("Couldn't save muscle group targeted");
          return null;
        }
      }

      return true;

    } catch (e) {
      console.log(e);
      return null;
    }

  }

  static async getAllWorkouts() {
    const query = `SELECT workout.*,
                          json_agg(DISTINCT muscle_group) as muscle_targeted,
                          json_agg(DISTINCT equipment)    as equipment
                   FROM workout
                            LEFT JOIN muscle_workout_target ON workout.workoutid = muscle_workout_target.workoutid
                            LEFT JOIN workout_equipment ON workout.workoutid = workout_equipment.workoutid
                            LEFT JOIN equipment ON workout_equipment.equipmentid = equipment.equipmentid
                            LEFT JOIN muscle_group ON muscle_workout_target.muscleid = muscle_group.muscleid
                   GROUP BY workout.workoutid`;

    try {
      let result = (await db.query(query, [])).rows;
      result = Workout.formatResult(result);
      //console.log(result);
      return result;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  static async getById(workoutId) {
    const query = `SELECT workout.*,
                          json_agg(DISTINCT muscle_group) as muscle_targeted,
                          json_agg(DISTINCT equipment)    as equipment
                   FROM workout
                            LEFT JOIN muscle_workout_target ON workout.workoutid = muscle_workout_target.workoutid
                            LEFT JOIN workout_equipment ON workout.workoutid = workout_equipment.workoutid
                            LEFT JOIN equipment ON workout_equipment.equipmentid = equipment.equipmentid
                            LEFT JOIN muscle_group ON muscle_workout_target.muscleid = muscle_group.muscleid
                   WHERE workout.workoutid = $1
                   GROUP BY workout.workoutid`;

    try {
      let result = (await db.query(query, [workoutId]));
      if(result.rowCount === 0) return null;


      result = Workout.formatResult(result.rows);

      return result[0];
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  static formatResult(data) {
    for (let i = 0; i < data.length; i++) {
      if (data[i].equipment.length === 1 && data[i].equipment[0] === null) {
        data[i].equipment = null;
      }

      data[i].muscle_targeted = Muscle.renameMuscles(data[i].muscle_targeted);
    }

    return data;
  }
};