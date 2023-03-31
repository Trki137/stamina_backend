const db = require("../db/db.js");
const worker_threads = require("worker_threads");

module.exports = class Training {

  constructor(time, name, intensity, description, avg_calories, numOfSets, restBetweenSets,restBetweenWorkouts,workouts) {
    this.time = time;
    this.name = name;
    this.intensity = intensity;
    this.description = description;
    this.avg_calories = avg_calories;
    this.numOfSets = numOfSets;
    this.restBetweenSets = restBetweenSets;
    this.restBetweenWorkouts = restBetweenWorkouts;
    this.workouts = workouts;
  }

  static async checkWorkouts(workouts) {
    const query = `SELECT *
                   FROM workout
                   WHERE workoutid = $1`;

    try {
      for (let i = 0; i < workouts.length; i++) {
        const result = db.query(query, [workouts[i].workoutid]);
        if (result.rowCount === 0) return false;
      }

      return true;
    } catch (e) {
      console.log();
      return null;
    }
  }

  async addWorkout() {
    const addTrainingQuery = `INSERT INTO training (time, name, intensity, description, avg_calories,numofsets, restbetweensets,restbetweenworkouts)
                              VALUES ($1, $2, $3, $4, $5, $6,$7,$8) RETURNING trainingid`;

    const addTToTrainingPlanQuery = `INSERT INTO training_plan (workoutid,trainingid,time,repetition) VALUES ($1,$2,$3,$4)`;

    try{
      let trainingId = await db.query(addTrainingQuery,[this.time,this.name,this.intensity,this.description,this.avg_calories,this.numOfSets,this.restBetweenSets,this.restBetweenWorkouts]);
      console.log(trainingId);
      trainingId = trainingId.rows[0].trainingid;

      if(this.workouts.length === 0) return true;
      for(let i = 0; i < this.workouts.length; i++){
        const result = await db.query(addTToTrainingPlanQuery,[this.workouts[i].workoutid,trainingId,this.workouts[i].time,this.workouts[i].repetition])

        if(!result.rowCount) return false;


      }

      return true;

    }catch (e){
      console.log(e);
      return null;
    }
  }

};