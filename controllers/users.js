// Файл контроллеров

// Импортируем модель 'user'
const User = require('../models/user');

module.exports.getAllUsers = (req, res) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch(() => res.status(500).send({ message: 'Произошла ошибка' }));
};

module.exports.getNecessaryUser = (req, res) => {
  User.findById(req.params.userId)
    .then((user) => res.send({ data: user }))
    .catch(() => res.status(500).send({ message: 'Произошла ошибка' }));
};

module.exports.postNewUser = (req, res) => {
  // Получим из объекта запроса имя, характеристику и аватар пользователя
  const { name, about, avatar } = req.body;

  User.create({ name, about, avatar })
    .then((user) => res.send({ data: user }))
    .catch(() => res.status(500).send({ message: 'Произошла ошибка' }));
};

module.exports.patchUserInfo = (req, res) => {
  // Получим из объекта запроса имя и характеристику пользователя
  const { name, about } = req.body;

  User.findByIdAndUpdate(req.user._id, {
    name,
    about
  }, { new: true })
    .then((user) => res.send({ data: user }))
    .catch(() => res.status(500).send({ message: 'Произошла ошибка' }));
};

module.exports.patchUserAvatar = (req, res) => {
  // Получим из объекта запроса аватар пользователя
  const { avatar } = req.body;

  User.findByIdAndUpdate(req.user._id, {
    avatar
  }, { new: true })
    .then((user) => res.send({ data: user }))
    .catch(() => res.status(500).send({ message: 'Произошла ошибка' }));
};
