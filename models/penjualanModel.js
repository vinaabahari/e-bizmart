const mongoose = require("mongoose");

const penjualanSchema = new mongoose.Schema({
  pembayaran: {
    type: String,
    enum: ["Cash", "Transfer", "Kredit"],
    required: true,
  },
  id_user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  tanggal: {
    type: Date,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  status_transaksi: {
    type: String,
    enum: ["Belum bayar", "Dalam proses", "Selesai", "Gagal"],
    required: true,
  },
});

module.exports = mongoose.model("Penjualan", penjualanSchema);