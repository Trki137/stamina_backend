const Joi = require("joi");

const validationOptions = {
  abortEarly: false,
  allowUnknown: true,
  stripUnknown:true
};

const validate = (schema) => (payload) => schema.validate(payload,validationOptions)

const id = Joi.number().min(0).required();
const firstname = Joi.string().required();
const lastname = Joi.string().required();
const username = Joi.string().required();
const email = Joi.string().regex(new RegExp("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[a-z]{2,}$")).required();
const description = Joi.string().allow( "").required();
const paramUserIdSchema = Joi.object().keys({
  id
});

const followUnfollowSchema = Joi.object().keys({
  followed: id,
  followedBy: id
});

const updateWithoutImageSchema = {
  firstname,
  lastname,
  username,
  email,
  description
}


exports.validateParamUserId = validate(paramUserIdSchema);
exports.validateFollowUnfollow = validate(followUnfollowSchema);
exports.validateUpdateWithoutImage = validate(updateWithoutImageSchema);