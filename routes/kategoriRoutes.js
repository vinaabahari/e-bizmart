const express = require('express');
const router = express.Router();
const kategoriController = require('../controllers/kategoriController');
const checkSession = require('../middleware/checkSession');
const checkRole = require('../middleware/checkRole');

router.use(checkSession);
router.get("/daftar",checkRole('admin'), kategoriController.getDaftarKategori);
router.get("/tambah",checkRole('admin'), kategoriController.getTambahKategori);
router.post("/tambah",checkRole('admin'), kategoriController.tambahKategori);
router.get("/edit/:id",checkRole('admin'), kategoriController.getEditKategori);
router.post("/edit/:id",checkRole('admin'), kategoriController.editKategori);
router.get("/delete/:id",checkRole('admin'), kategoriController.deleteKategori);


module.exports = router;