const express = require("express");
const router = express.Router();
const qualityService = require("../services/qualityService.js");

// GET /api/quality/inspection-orders - 생산 계획 전체 목록 조회
router.get("/inspection-orders", async (req, res, next) => {
  try {
    const orders = await qualityService.getInspectionOrders();
    res.json({ code: "Q200", data: orders });
  } catch (err) {
    next(err); // 에러를 전역 오류 처리 미들웨어로 전달
  }
});

// POST /api/productions/:planId/mrp - 특정 생산 계획으로 MRP 계산
// router.post("/:planId/mrp", async (req, res, next) => {
//   try {
//     const { planId } = req.params;
//     const result = await qualityService.calculateMRP(planId);
//     res.json({ code: "Q200", data: result });
//   } catch (err) {
//     next(err); // 에러를 전역 오류 처리 미들웨어로 전달
//   }
// });

module.exports = router;
