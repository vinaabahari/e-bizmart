const express = require('express');
const router = express.Router();
const penjualanController = require('../controllers/penjualanController');
const checkSession = require('../middleware/checkSession');
const checkRole = require('../middleware/checkRole');


router.use(checkSession);
router.get('/daftar',checkRole('owner', 'admin'), penjualanController.getDaftarPenjualan);

module.exports = router;
