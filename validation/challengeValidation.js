const Joi = require("joi");

const validationOptions = {
  abortEarly: false,
  allowUnknown: true,
  stripUnknown:true
};

const validate = (schema) => (payload) => schema.validate(payload,validationOptions)

const name = Joi.string().required();
const description = Joi.string().allow("").required();
const date = Joi.string().min(10).max(10).regex(/^\d{1,2}\.\d{1,2}\.\d{4}$/).required();
const id = Joi.number().min(0).required();

const addChallengeSchema = Joi.object().keys({
  name,
  description,
  date,
  userId: id
});

const updateChallengeSchema = Joi.object().keys({
  eventId: id,
  date,
  name,
  description
});

const getChallengeSchema = Joi.object().keys({
  id
}) ;

exports.validateAddChallenge = validate(addChallengeSchema);
exports.validateUpdateChallenge = validate(updateChallengeSchema);
exports.validateGetChallenge = validate(getChallengeSchema);