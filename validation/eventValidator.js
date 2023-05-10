const Joi = require("joi");

const validationOptions = {
  abortEarly: false,
  allowUnknown: true,
  stripUnknown:true
};

const validate = (schema) => (payload) => schema.validate(payload,validationOptions)

const id = Joi.number().integer().greater(-1).required();

const eventSchema = Joi.object().keys({
  userId: id,
  eventId: id
})

const getMyEventsSchema = Joi.object().keys({

})

exports.validateEvent = validate(eventSchema);