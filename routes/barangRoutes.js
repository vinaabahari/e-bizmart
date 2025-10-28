const express = require('express');
const router = express.Router();
const barangController = require('../controllers/barangController');
const uploadImage = require('../middleware/uploadImage');
const checkSession = require('../middleware/checkSession');
const checkRole = require('../middleware/checkRole');

router.use(checkSession);

router.get('/daftar', checkRole('admin'), barangController.getDaftarBarang);
router.get('/tambah', checkRole('admin'), barangController.getTambahBarang);
router.get('/transaksi', barangController.getDaftarBarangForHomePage);
router.post('/tambah', uploadImage.single("foto"), barangController.tambahBarang);
router.get('/edit/:id',checkRole('admin'), barangController.getEditBarang);
router.post('/edit/:id',checkRole('admin'), uploadImage.single("foto"), barangController.editBarang);
router.get('/delete/:id', checkRole('admin'), barangController.deleteBarang);
router.post('/beli/:id', barangController.beliBarang);
router.get("/struk/:id", barangController.getStrukBeliBarang);
router.get('/cetak-struk/:id', barangController.cetakStruk);

module.exports = router;