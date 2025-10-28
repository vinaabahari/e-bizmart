const express = require('express');
const router = express.Router();
const keranjangController = require('../controllers/keranjangController');
const checkSession = require('../middleware/checkSession');
const barangController = require('../controllers/barangController');

router.use(checkSession);

router.get('/', keranjangController.getDaftarKeranjang);
router.get('/tambah/:id', keranjangController.tambahBarangKedalamKeranjang);
router.get('/tambah-jumlah/:id', keranjangController.tambahJumlahBarang);
router.get('/kurangi-jumlah/:id', keranjangController.kurangiJumlahBarang);
router.get('/delete/:id', keranjangController.deleteKeranjang);
router.post('/beli', keranjangController.beliBarang);
router.get("/struk/:id", keranjangController.getStrukKeranjang);
router.get("/clear", keranjangController.clearKeranjang);
router.get('/cetak-struk/:id', keranjangController.cetakStruk);

module.exports = router;