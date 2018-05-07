const Joi = require('joi');

const eventSchema = Joi.object().keys({
    severity: Joi.string(),
    user: Joi.string().required(),
    id: Joi.string(),
    timeStamp: Joi.date().required(),
    category: Joi.string(),
    description: Joi.string(),
    descriptionId: Joi.string(),
    fullyQualifiedClassName: Joi.string(),
    methodName: Joi.string(),
    data: [Joi.object(), Joi.string()]

});

module.exports = eventSchema