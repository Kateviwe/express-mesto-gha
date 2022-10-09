// Мидлвэр для валидации данных с помощью библиотеки Joi
// celebrate позволяет валидировать тело запроса, заголовки, параметры или req.query
const { celebrate, Joi } = require('celebrate');

const regExpUrl = /^(http)s?:\/\/(www\.)?[a-zA-Z0-9-]+\.([\w\-.~:/?#[\]@!$&'()*+,;=]+)/;

const postNewCardValidation = celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30).required(),
    link: Joi.string().required().regex(RegExp(regExpUrl)),
  }),
});

const defineCardIdValidation = celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().alphanum().length(24).required()
      .hex(),
  }),
});

const defineUserIdValidation = celebrate({
  params: Joi.object().keys({
    userId: Joi.string().alphanum().length(24).required()
      .hex(),
  }),
});

const patchUserInfoValidation = celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
  }),
});

const patchUserAvatarValidation = celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().regex(RegExp(regExpUrl)),
  }),
});

const postNewUserValidation = celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30).default('Жак-Ив Кусто'),
    about: Joi.string().min(2).max(30).default('Исследователь'),
    avatar: Joi.string().default('https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png').regex(RegExp(regExpUrl)),
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
});

const loginValidation = celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
});

module.exports = {
  postNewCardValidation,
  defineCardIdValidation,
  defineUserIdValidation,
  patchUserInfoValidation,
  patchUserAvatarValidation,
  postNewUserValidation,
  loginValidation,
  regExpUrl,
};
