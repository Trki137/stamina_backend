const Joi = require("joi");

const validationOptions = {
  abortEarly: false,
  allowUnknown: true,
  stripUnknown:true
};

const validate = (schema) => (payload) => schema.validate(payload,validationOptions);


const time = Joi.string().required().regex(/^\d+$/);
const name = Joi.string().required();
const intensity = Joi.string().valid("low","moderate","high", "extreme").required();
const description = Joi.string().required().allow("");
const avg_calories = Joi.number();
const numberSchema = Joi.number().required();
const workouts = Joi.array().items(Joi.object().keys({
  workoutid: Joi.number().required(),
  time: Joi.number().allow(null),
  repetition: Joi.number().allow(null),
}));
const id = Joi.number().required();

const saveTrainingSchema = Joi.object().keys({
  time,
  name,
  intensity,
  description,
  avg_calories,
  numOfSets: numberSchema,
  restBetweenSets: numberSchema,
  restBetweenWorkouts: numberSchema,
  workouts
});

const trainingIdSchema =  Joi.object().keys({
  trainingId: id
});

exports.validateSaveTraining = validate(saveTrainingSchema);
exports.validateTrainingId = validate(trainingIdSchema)