const db = require("../db/db.js");
const Workout = require("./WorkoutModel");

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

  static async checkTraining(trainingId){
    const query = `SELECT * FROM training WHERE trainingid = $1`;

    try{
      const result = await db.query(query,[trainingId]);
      return result.rowCount > 0;
    }catch (e){
      console.log(e);
      return null;
    }
  }

  static async getById(trainingId){
    const query = `SELECT
    training.trainingid,
                       training_plan.time,
                       repetition,
                       numOfSets,
                       restBetweenSets,
                       restBetweenWorkouts,
                       workout.name,
                       training_plan.workoutid,
                       avg_calories,
                       workout.intensity
                   FROM training_plan
                            JOIN training ON training_plan.trainingid = training.trainingid
                            JOIN workout ON training_plan.workoutid = workout.workoutid
                   WHERE training_plan.trainingid = $1
    `;

    try{
      const result = await db.query(query,[trainingId]);
      if(result.rowCount === 0) return null;

      const rows = result.rows;
      const workoutIds = rows.map(row => row.workoutid);
      const data = [];

      let sequence = 0;
      for(let i = 0; i < rows.length * rows[0].numofsets; i++){
        data.push({
          sequence: sequence++,
          time: rows[i % rows.length].time,
          repetition: rows[i % rows.length].repetition,
          name: rows[i % rows.length].name,
          intensity: rows[i % rows.length].intensity
        });

        if(i === rows.length * rows[0].numofsets - 1){
          continue;
        }

        if(rows[0].restbetweenworkouts !== 0 && i % rows.length !== rows.length - 1){
          data.push({
            sequence: sequence++,
            time: rows[0].restbetweenworkouts,
            repetition: null,
            name: "Rest",
            intensity: "low"
          });
        }

        if(rows[0].restbetweensets !== 0 && i % rows.length === rows.length - 1){
          data.push({
            sequence: sequence++,
            time: rows[0].restbetweensets,
            repetition: null,
            name: "Rest",
            intensity: "low"
          });
        }
      }

      const workout_description = [];

      for(let i = 0; i < workoutIds.length; i++){
        const result =await Workout.getById(workoutIds[i]);

        if(!result) return null;
        workout_description.push(result);
      }

      return {
        trainingId: rows[0].trainingid,
        restBetweenWorkouts: rows[0].restbetweenworkouts,
        restBetweenSets: rows[0].restbetweensets,
        numberOfSets: rows[0].numofsets,
        avgCalories: rows[0].avg_calories,
        data,
        workouts: workout_description
      };

    }catch (e){
      console.log(e);
      return null;
    }
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

  static async getAllTraining(){
    const query = `SELECT
                       time,
                       name,
                       intensity,
                       description,
                       trainingid,
                       avg_calories,
                       (
                           SELECT initcap(string_agg(DISTINCT(muscle_group.name), ',')) AS targeted_muscles
                           FROM training AS t2
                                    JOIN training_plan ON training_plan.trainingid = t2.trainingid
                                    JOIN workout ON training_plan.workoutid = workout.workoutid
                                    JOIN muscle_workout_target ON workout.workoutid = muscle_workout_target.workoutid
                                    JOIN muscle_group ON muscle_workout_target.muscleid = muscle_group.muscleid
                           WHERE t2.trainingid = training.trainingid
                           GROUP BY t2.trainingid
                       ) as targeted_muscles
                   FROM training`;

    try{
      const result = await db.query(query,[]);
      return result.rows;

    }catch (e){
      console.log(e);
      return null;
    }

  }

  async addWorkout() {
    const addTrainingQuery = `INSERT INTO training (time, name, intensity, description, avg_calories,numofsets, restbetweensets,restbetweenworkouts)
                              VALUES ($1, $2, $3, $4, $5, $6,$7,$8) RETURNING trainingid`;

    const addTToTrainingPlanQuery = `INSERT INTO training_plan (workoutid,trainingid,time,repetition) VALUES ($1,$2,$3,$4)`;

    try{
      let trainingId = await db.query(addTrainingQuery,[this.time,this.name,this.intensity,this.description,this.avg_calories,this.numOfSets,this.restBetweenSets,this.restBetweenWorkouts]);

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