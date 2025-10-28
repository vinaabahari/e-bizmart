const mongoose = require("mongoose");

const detailTransaksiSchema = new mongoose.Schema({
  id_barang: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Barang",
    required: true,
  },
  id_penjualan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Penjualan",
    required: false,
  },
  jumlah: {
    type: Number,
    required: true,
  },
  harga_satuan: {
    type: Number,
    required: true,
  },
  sub_total: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("DetailTransaksi", detailTransaksiSchema);