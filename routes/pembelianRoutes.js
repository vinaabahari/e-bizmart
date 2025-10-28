const express = require('express');
const router = express.Router();
const pembelianController = require('../controllers/pembelianController');
const checkSession = require('../middleware/checkSession');
const checkRole = require('../middleware/checkRole');

router.use(checkSession);
router.get('/daftar',checkRole('pelanggan'), pembelianController.getDaftarPembelian);

module.exports = router;
