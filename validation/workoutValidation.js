const Joi = require("joi");

const validationOptions = {
  abortEarly: false,
  allowUnknown: true,
  stripUnknown:true
};

const validate = (schema) => (payload) => schema.validate(payload,validationOptions);

const stringSchema = Joi.string().required().allow("");
const muscleTargeted = Joi.array().items(Joi.number());
const equipment = Joi.array().items(Joi.number()).allow(null);

const addWorkoutSchema = Joi.object().keys({
  name: stringSchema,
  description: stringSchema,
  intensity: stringSchema,
  muscleTargeted,
  equipment
});


exports.validateAddWorkout = validate(addWorkoutSchema);