// Создадим роутер
const router = require('express').Router();

const { getAllUsers, getNecessaryUser, postNewUser, patchUserInfo, patchUserAvatar } = require('../controllers/users');

router.get('/', getAllUsers);
router.get('/:userId', getNecessaryUser);
router.post('/', postNewUser);
router.patch('/me', patchUserInfo);
router.patch('/me/avatar', patchUserAvatar);

module.exports = router;
