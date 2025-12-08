const express = require("express");
const router = express.Router();
const materialService = require("../services/materialService"); // 서비스 임포트

// ... (기존 입고 관련 라우터들)

// ------------------------------------------------
// [자재 재고 관리]
// ------------------------------------------------

// 1. 재고 목록 조회 (검색 조건 포함)
// GET /api/inbound/stocks
router.get("/stocks", async (req, res) => {
  try {
    // 쿼리 스트링으로 필터 조건 받기
    const params = {
      keyword: req.query.keyword,
      type: req.query.type,
      status: req.query.status,
    };

    const result = await materialService.getStockList(params);
    res.status(200).json(result);
  } catch (error) {
    console.error("재고 목록 조회 에러:", error);
    res.status(500).json({ message: "서버 에러가 발생했습니다." });
  }
});

// 2. 자재 상세 정보 조회 (단건)
// GET /api/inbound/stocks/:code
router.get("/stocks/:code", async (req, res) => {
  try {
    const matCode = req.params.code;
    const result = await materialService.getStockDetail(matCode);

    if (!result) {
      return res.status(404).json({ message: "자재 정보를 찾을 수 없습니다." });
    }
    res.status(200).json(result);
  } catch (error) {
    console.error("재고 상세 조회 에러:", error);
    res.status(500).json({ message: "서버 에러가 발생했습니다." });
  }
});

module.exports = router;
