const express = require("express");
const router = express.Router();
const inboundService = require("../services/inboundService");

// POST /api/inbound/register
router.post("/register", async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "등록할 입고 데이터가 없습니다." });
    }

    // 서비스 호출
    const result = await inboundService.registerInboundItems(items);

    // 201 Created 응답
    res.status(201).json(result);
  } catch (error) {
    // DB 제약조건 에러 (FK 위배 등) 처리
    if (error.message.includes("foreign key constraint fails")) {
      return res.status(400).json({
        error:
          "데이터 무결성 오류: 자재코드, 거래처, 또는 수입검사 코드를 확인하세요.",
      });
    }
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
