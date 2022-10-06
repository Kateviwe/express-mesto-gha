// Создадим роутер
const router = require('express').Router();

const {
  defineUserIdValidation,
  patchUserInfoValidation,
  patchUserAvatarValidation,
} = require('../middlewares/validation');

const {
  getAllUsers,
  getNecessaryUser,
  patchUserInfo,
  patchUserAvatar,
  getInfoAboutMe,
} = require('../controllers/users');

router.get('/', getAllUsers);
router.patch('/me', patchUserInfoValidation, patchUserInfo);
router.patch('/me/avatar', patchUserAvatarValidation, patchUserAvatar);
router.get('/me', getInfoAboutMe);
router.get('/:userId', defineUserIdValidation, getNecessaryUser);

module.exports = router;
