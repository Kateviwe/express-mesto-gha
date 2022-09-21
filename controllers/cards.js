// Файл контроллеров

const { IncorrectInputError, NotFoundError } = require('../errors/errors');
// Импортируем модель 'card'
const Card = require('../models/card');

const ERROR_CODE = 500;
// Данные для обработки ошибок
const incorrectInputError = new IncorrectInputError('Некорректные входные данные');
const notFoundError = new NotFoundError('Запрашиваемый пользователь не найден');

module.exports.getAllCards = (req, res) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch(() => {
      return res.status(ERROR_CODE).send({ message: 'Произошла ошибка' });
    });
};

module.exports.deleteNecessaryCard = (req, res) => {
  Card.findByIdAndRemove(req.params.cardId)
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'NotFoundError') {
        // 404
        return res.status(notFoundError.statusCode).send(notFoundError.message);
      } else {
        return res.status(ERROR_CODE).send({ message: 'Произошла ошибка' });
      }
    });
};

module.exports.postNewCard = (req, res) => {
  // Получим из объекта запроса название и ссылку на карточку
  const { name, link } = req.body;

  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'IncorrectInputError') {
        // 400
        return res.status(incorrectInputError.statusCode).send(incorrectInputError.message);
      } else {
        return res.status(ERROR_CODE).send({ message: 'Произошла ошибка' });
      }
    });
};

// "new: true" - вернет видоизмененный массив, а не оригинал
module.exports.putLikeToCard = (req, res) => {
  Card.findByIdAndUpdate(req.params.cardId, {
    $addToSet: { likes: req.user._id }
  }, { new: true })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'IncorrectInputError') {
        // 400
        return res.status(incorrectInputError.statusCode).send(incorrectInputError.message);
      } else if (err.name === 'NotFoundError') {
        // 404
        return res.status(notFoundError.statusCode).send(notFoundError.message);
      } else {
        return res.status(ERROR_CODE).send({ message: 'Произошла ошибка' });
      }
    });
};

module.exports.deleteLikeOfCard = (req, res) => {
  Card.findByIdAndUpdate(req.params.cardId, {
    $pull: { likes: req.user._id }
  }, { new: true })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'IncorrectInputError') {
        // 400
        return res.status(incorrectInputError.statusCode).send(incorrectInputError.message);
      } else if (err.name === 'NotFoundError') {
        // 404
        return res.status(notFoundError.statusCode).send(notFoundError.message);
      } else {
        return res.status(ERROR_CODE).send({ message: 'Произошла ошибка' });
      }
    });
};
