const express = require("express");
const router = express.Router();
const inboundService = require("../services/inboundService");

// 1. 자재 목록 조회 (GET /api/inbound/materials)
router.get("/materials", async (req, res) => {
  try {
    const result = await inboundService.getMaterialList();

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. 공급업체 목록 조회 (GET /api/inbound/clients)
router.get("/clients", async (req, res) => {
  try {
    const result = await inboundService.getClientList();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. 담당자 목록 조회 (GET /api/inbound/managers)
router.get("/managers", async (req, res) => {
  try {
    const result = await inboundService.getEmployeeList();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. 입고 등록 (POST /api/inbound/register)
router.post("/register", async (req, res) => {
  try {
    const { items } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ error: "등록할 데이터가 없습니다." });
    }

    const result = await inboundService.registerInboundItems(items);
    res.status(201).json(result);
  } catch (error) {
    // FK 에러 처리
    if (error.message.includes("foreign key constraint fails")) {
      return res.status(400).json({
        error: "데이터 무결성 오류: 자재, 거래처, 담당자 코드를 확인하세요.",
      });
    }
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
