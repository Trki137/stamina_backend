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

const getEventsByUserIdSchema = Joi.object().keys({
  id
});

exports.validateEvent = validate(eventSchema);
exports.validateGetUsersEvents = validate(getEventsByUserIdSchema)