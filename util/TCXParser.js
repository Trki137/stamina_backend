const TCX = require("tcx-js");
const fs = require("fs");
const { XMLParser } = require("fast-xml-parser");
const ExerciseData = require("../models/ExerciseDataModel");
module.exports = class TCXParser{
  constructor(path){
    this.path = path;
  }

  parseAndGetData(){
    try{
      const parser = new TCX.Parser(this.path);
      let sport = parser.activity.sport ? parser.activity.sport.split(".")[0] : "Unknown";
      let date = parser.activity.trackpoints[0].time.split("T")[0];
      if(date != null)
        date = this.formatDate(date)

      sport = sport === "Calisthenics" ? "Running" : sport;

      const xmlString =  fs.readFileSync(this.path, "utf-8");

      const xmlParser = new XMLParser();
      const xmlParsed = xmlParser.parse(xmlString);

      const time = xmlParsed.TrainingCenterDatabase.Activities.Activity.Lap.TotalTimeSeconds;
      const avg_hearth_rate = xmlParsed.TrainingCenterDatabase.Activities.Activity.Lap?.AverageHeartRateBpm?.Value;
      const calories = xmlParsed.TrainingCenterDatabase.Activities.Activity.Lap.Calories;
      return new ExerciseData(sport,date.replaceAll("-", "."),null,null,time,calories ? Math.ceil(calories) : null,avg_hearth_rate ? Math.trunc(avg_hearth_rate) : null);
    }catch (e){
      console.log(e);
      return null;
    }
    finally {
      fs.unlinkSync(this.path);
    }
  };


  formatDate(oldDate){
    console.log(oldDate);
    const split = oldDate.split("-");

    return split[2]+"."+split[1]+"."+split[0];
  }
}