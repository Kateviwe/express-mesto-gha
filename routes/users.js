// Создадим роутер
const router = require('express').Router();

const {
  getAllUsers,
  getNecessaryUser,
  patchUserInfo,
  patchUserAvatar,
  getInfoAboutMe,
} = require('../controllers/users');

router.get('/', getAllUsers);
router.patch('/me', patchUserInfo);
router.patch('/me/avatar', patchUserAvatar);
router.get('/me', getInfoAboutMe);
router.get('/:userId', getNecessaryUser);

module.exports = router;
