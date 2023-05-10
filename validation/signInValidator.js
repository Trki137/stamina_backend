const Joi = require("joi");

const validationOptions = {
  abortEarly: false,
  allowUnknown: true,
  stripUnknown:true
};

const validate = (schema) => (payload) => schema.validate(payload,validationOptions)

const username = Joi.string().required();
const password = Joi.string().min(8).required();
const googlePassword = Joi.allow(null);
const image =  Joi.string().allow(null);

const signInSchema = Joi.object().keys({
  username,
  password
})

const googleSignInSchema = Joi.object().keys({
  username,
  password: googlePassword,
  firstname: username,
  lastname: username,
  image
})
exports.signIn = validate(signInSchema);
exports.googleSignIn = validate(googleSignInSchema);