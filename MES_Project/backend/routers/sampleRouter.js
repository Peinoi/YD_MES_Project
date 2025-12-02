const express = require("express");
const router = express.Router();
const sampleService = require("../services/sampleService.js");

// GET /api/productions - 생산 계획 전체 목록 조회
router.get("/", async (req, res, next) => {
  try {
    const plans = await sampleService.getProductionPlans();
    res.json({ code: "S200", data: plans });
  } catch (err) {
    next(err); // 에러를 전역 오류 처리 미들웨어로 전달
  }
});

// POST /api/productions/:planId/mrp - 특정 생산 계획으로 MRP 계산
router.post("/:planId/mrp", async (req, res, next) => {
  try {
    const { planId } = req.params;
    const result = await sampleService.calculateMRP(planId);
    res.json({ code: "S200", data: result });
  } catch (err) {
    next(err); // 에러를 전역 오류 처리 미들웨어로 전달
  }
});

module.exports = router;
