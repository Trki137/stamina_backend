const FitParser = require("fit-file-parser").default;
const ExerciseData = require("../models/ExerciseDataModel");
const dayjs = require("dayjs");


module.exports = class FITParser {

  constructor(buffer) {
    this.buffer = buffer;
  }

  async getData() {
    const fitParser = new FitParser({
      force: true,
      speedUnit: "km/h",
      lengthUnit: "km",
      temperatureUnit: "celsius",
      elapsedRecordField: true,
      mode: "cascade"
    });

    return new Promise((resolve, reject) => {
      fitParser.parse(this.buffer, (err, data) => {
        if (err) {
          console.log(err);
          return null;
        }

        try {
          let sport = data.activity.sessions[0].sport;
          let date = data.activity.sessions[0].start_time;
          const time = data.activity.sessions[0].total_elapsed_time;
          const calories = data.activity.sessions[0].total_calories ?  data.activity.sessions[0].total_calories : null;
          const avg_hearth_rate = data.activity.sessions[0].avg_heart_rate ?  data.activity.sessions[0].avg_heart_rate: null;

          if(!date) reject();
          if(!sport) reject();

          sport = sport.substring(0,1).toUpperCase() + sport.substring(1);
          date = dayjs(new Date(date)).format("DD.MM.YYYY");

          resolve(new ExerciseData(sport, date, null, null, time, calories, avg_hearth_rate));
        } catch (e) {
          console.log(e);
          reject(e);
        }

      });

    })
  }
};