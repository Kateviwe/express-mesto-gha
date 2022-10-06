// Создадим роутер
const router = require('express').Router();

const {
  postNewCardValidation,
  defineCardIdValidation,
} = require('../middlewares/validation');

const {
  getAllCards,
  deleteNecessaryCard,
  postNewCard,
  putLikeToCard,
  deleteLikeOfCard,
} = require('../controllers/cards');

router.get('/', getAllCards);
router.delete('/:cardId', defineCardIdValidation, deleteNecessaryCard);
router.post('/', postNewCardValidation, postNewCard);
router.put('/:cardId/likes', defineCardIdValidation, putLikeToCard);
router.delete('/:cardId/likes', defineCardIdValidation, deleteLikeOfCard);

module.exports = router;
