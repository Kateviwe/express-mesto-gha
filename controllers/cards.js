// Файл контроллеров

const { IncorrectInputError } = require('../errors/incorrect-input-error');
const { NotFoundError } = require('../errors/not-found-error');
const { NoPermissionError } = require('../errors/no-permission-error');
// Импортируем модель 'card'
const Card = require('../models/card');

const ERROR_CODE = 500;
// Данные для обработки ошибок
const CastError = new NotFoundError('Запрашиваемая карточка не найдена');
const NotOwnerError = new NoPermissionError('Удаление невозможно: это не ваша карточка');

module.exports.getAllCards = (req, res) => {
  Card.find({})
    .then((cards) => res.send(cards))
    .catch(() => {
      return res.status(ERROR_CODE).send({ message: 'Произошла ошибка' });
    });
};

module.exports.deleteNecessaryCard = (req, res) => {
  Card.findById(req.params.cardId)
  // Если, например, карточка была удалена, и мы делаем запрос на ее повторное удаление, появится ошибка
    // orFail только кидает ошибку - не обрабатывает
    .orFail(() => CastError)
    .then((card) => {
      if (JSON.stringify(card.owner) === JSON.stringify(req.user._id)) {
        card.remove()
          .then(res.send(`Удалена карточка с id: ${card._id}`));
      } else {
        // 403
        return res.status(NotOwnerError.statusCode).send(NotOwnerError.message);
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        // 404
        return res.status(CastError.statusCode).send(CastError.message);
      } else {
        return res.status(ERROR_CODE).send({ message: 'Произошла ошибка' });
      }
    });
};

module.exports.postNewCard = (req, res) => {
  // Получим из объекта запроса название и ссылку на карточку
  const { name, link } = req.body;

  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.send(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        const ValidationError = new IncorrectInputError(`Некорректные входные данные. ${err}`);
        // 400
        return res.status(ValidationError.statusCode).send(ValidationError.message);
      } else {
        return res.status(ERROR_CODE).send({ message: 'Произошла ошибка' });
      }
    });
};

// "new: true" - вернет видоизмененный массив, а не оригинал
module.exports.putLikeToCard = (req, res) => {
  Card.findByIdAndUpdate(req.params.cardId, {
    // Если пользователь еще не лайкал карточку - добавим лайк, иначе - нет
    $addToSet: { likes: req.user._id },
    // "new: true" вернет видоизмененный массив, а не оригинал
  }, { new: true })
    .orFail(() => CastError)
    .then((card) => res.send(`Вы поставили лайк карточке с id: ${card._id}`))
    .catch((err) => {
      if (err.name === 'CastError') {
        // 404
        return res.status(CastError.statusCode).send(CastError.message);
      } else {
        return res.status(ERROR_CODE).send({ message: 'Произошла ошибка' });
      }
    });
};

module.exports.deleteLikeOfCard = (req, res) => {
  Card.findByIdAndUpdate(req.params.cardId, {
    // Если пользователь уже лайкал карточку - удалим лайк, иначе - нет
    $pull: { likes: req.user._id },
  }, { new: true })
    .orFail(() => CastError)
    .then((card) => res.send(`Вы убрали лайк с карточки с id: ${card._id}`))
    .catch((err) => {
      if (err.name === 'CastError') {
        // 404
        return res.status(CastError.statusCode).send(CastError.message);
      } else {
        return res.status(ERROR_CODE).send({ message: 'Произошла ошибка' });
      }
    });
};
