const express = require("express");
const router = express.Router();
const qualityService = require("../services/qualityService.js");

// GET /api/quality/qcrs - qcr_tbl목록 전체 조회
router.get("/qcrs", async (req, res, next) => {
  try {
    const orders = await qualityService.getQCRList();
    res.json({ code: "Q200", data: orders });
  } catch (err) {
    next(err); // 에러를 전역 오류 처리 미들웨어로 전달
  }
});

// GET /api/quality/qio - qio_tbl목록 전체 조회
router.get("/qio", async (req, res, next) => {
  try {
    const orders = await qualityService.getQIOList();
    res.json({ code: "Q200", data: orders });
  } catch (err) {
    next(err); // 에러를 전역 오류 처리 미들웨어로 전달
  }
});

// GET /api/quality/prdrs - prdr_tbl목록 전체 조회
router.get("/prdrs", async (req, res, next) => {
  try {
    const orders = await qualityService.getPrdrList();
    res.json({ code: "Q200", data: orders });
  } catch (err) {
    next(err); // 에러를 전역 오류 처리 미들웨어로 전달
  }
});

// GET /api/quality/mpr_ds - mpr_d_tbl목록 전체 조회
router.get("/mpr_ds", async (req, res, next) => {
  try {
    const orders = await qualityService.getMpr_dList();
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
