// Создадим роутер
const router = require('express').Router();

const { getAllCards, deleteNecessaryCard, postNewCard, putLikeToCard, deleteLikeOfCard } = require('../controllers/cards');

router.get('/', getAllCards);
router.delete('/:cardId', deleteNecessaryCard);
router.post('/', postNewCard);
router.put('/:cardId/likes', putLikeToCard);
router.delete('/:cardId/likes', deleteLikeOfCard);

module.exports = router;
