const Joi = require("joi");

const validationOptions = {
  abortEarly: false,
  allowUnknown: true,
  stripUnknown:true
};

const validate = (schema) => (payload) => schema.validate(payload,validationOptions)

const name = Joi.string().required();
const description = Joi.string().max(5000);
const id = Joi.number().min(0).required();
const max_space =  Joi.number().min(1).required();
const date_time = Joi.string().required();
const street = Joi.string().required();
const pbr = Joi.number().required();
const cityName = Joi.string().required();
const longitude = Joi.number().min(-180).max(180).required();
const latitude = Joi.number().min(-90).max(90).required();

const updateGroupEventSchema = Joi.object().keys({
  name: cityName,
  description,
  userId: id,
  max_space,
  date_time,
  street,
  pbr,
  latitude,
  longitude,
  eventId: id,
  cityId: id,
  addressId: id,
});

const saveGroupEventSchema = Joi.object().keys({
  name,
  description,
  userId: id,
  max_space,
  date_time,
  street,
  pbr,
  cityName,
  latitude,
  longitude
});

const userIdSchema = Joi.object().keys({
  id
});
exports.validateSaveGroupEvent = validate(saveGroupEventSchema);
exports.validateUserId = validate(userIdSchema);
exports.validateUpdateGroupeEvent = validate(updateGroupEventSchema);