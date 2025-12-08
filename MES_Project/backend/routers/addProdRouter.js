const express = require("express");
const router = express.Router();
const productService = require("../services/addProductService.js");

// 제품코드 자동 생성 API
router.get("/next-code", async (req, res) => {
  const code = await productService.getNextProdCode();
  res.json({ code });
});

// 제품 등록 API
router.post("/", async (req, res) => {
  try {
    const result = await productService.insertProduct(req.body);
    res.json({ success: true });
  } catch (err) {
    console.error("Product Insert Error >>>", err);
    res.status(500).json({ error: "Insert failed" });
  }
});

module.exports = router;

module.exports = router;
