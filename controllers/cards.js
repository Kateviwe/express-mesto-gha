// Файл контроллеров

const { IncorrectInputError } = require('../errors/incorrect-input-error');
const { NotFoundError } = require('../errors/not-found-error');
const { BadRequestError } = require('../errors/bad-request');
const { NoPermissionError } = require('../errors/no-permission-error');
// Импортируем модель 'card'
const Card = require('../models/card');

module.exports.getAllCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.send(cards))
    // catch(next) аналогична catch(err => next(err))
    .catch(next);
};

module.exports.deleteNecessaryCard = (req, res, next) => {
  Card.findById(req.params.cardId)
  // Если, например, карточка была удалена, и мы делаем запрос
  // на ее повторное удаление, появится ошибка
    // orFail только кидает ошибку - не обрабатывает
    .orFail(() => new NotFoundError('Запрашиваемая карточка не найдена'))
    .then((card) => {
      if (JSON.stringify(card.owner) === JSON.stringify(req.user._id)) {
        card.remove();
        return res.send({ message: `Удалена карточка с id: ${card._id}` });
      }
      // 403
      next(new NoPermissionError('Удаление невозможно: это не ваша карточка'));
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        // 400
        next(new BadRequestError('Некорректный id карточки'));
      }
      if (err.name === 'NotFoundError') {
        // 404
        next(new NotFoundError('Запрашиваемая карточка не найдена'));
      }
      next(err);
    });
};

module.exports.postNewCard = (req, res, next) => {
  // Получим из объекта запроса название и ссылку на карточку
  const { name, link } = req.body;

  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.send(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        // 400
        next(new IncorrectInputError(`Некорректные входные данные. ${err}`));
      }
      next(err);
    });
};
// "new: true" - вернет видоизмененный массив, а не оригинал
module.exports.putLikeToCard = (req, res, next) => {
  Card.findByIdAndUpdate(req.params.cardId, {
    // Если пользователь еще не лайкал карточку - добавим лайк, иначе - нет
    $addToSet: { likes: req.user._id },
    // "new: true" вернет видоизмененный массив, а не оригинал
  }, { new: true })
    .orFail(() => new NotFoundError('Запрашиваемая карточка не найдена'))
    .then((card) => res.send({ message: `Вы поставили лайк карточке с id: ${card._id}` }))
    .catch((err) => {
      if (err.name === 'CastError') {
        // 400
        next(new BadRequestError('Некорректный id карточки'));
      }
      if (err.name === 'NotFoundError') {
        // 404
        next(new NotFoundError('Запрашиваемая карточка не найдена'));
      }
      next(err);
    });
};

module.exports.deleteLikeOfCard = (req, res, next) => {
  Card.findByIdAndUpdate(req.params.cardId, {
    // Если пользователь уже лайкал карточку - удалим лайк, иначе - нет
    $pull: { likes: req.user._id },
  }, { new: true })
    .orFail(() => new NotFoundError('Запрашиваемая карточка не найдена'))
    .then((card) => res.send({ message: `Вы убрали лайк с карточки с id: ${card._id}` }))
    .catch((err) => {
      if (err.name === 'CastError') {
        // 400
        next(new BadRequestError('Некорректный id карточки'));
      }
      if (err.name === 'NotFoundError') {
        // 404
        next(new NotFoundError('Запрашиваемая карточка не найдена'));
      }
      next(err);
    });
};
