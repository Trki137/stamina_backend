const Joi = require("joi");

const validationOptions = {
  abortEarly: false,
  allowUnknown: true,
  stripUnknown:true
};

const validate = (schema) => (payload) => schema.validate(payload,validationOptions)

const email = Joi.string().regex(new RegExp("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[a-z]{2,}$")).required();
const stringSchema = Joi.string().required();

const signUpSchema = Joi.object().keys({
  email,
  username: stringSchema,
  firstname: stringSchema,
  lastname: stringSchema,
  password: stringSchema,
});

exports.validateSingUp = validate(signUpSchema);