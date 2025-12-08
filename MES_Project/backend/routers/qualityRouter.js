const express = require("express");
const router = express.Router();
const qualityService = require("../services/qualityService.js");

// 0. GET /api/quality/qcrs - qcr_tbl목록 전체 조회
router.get("/qcrs", async (req, res, next) => {
  try {
    const orders = await qualityService.getQCRList();
    res.json({ code: "Q200", data: orders });
  } catch (err) {
    next(err); // 에러를 전역 오류 처리 미들웨어로 전달
  }
});

// 1. GET /api/quality/prdrs - prdr_tbl목록 전체 조회
router.get("/prdrs", async (req, res, next) => {
  try {
    const orders = await qualityService.getPrdrList();
    res.json({ code: "Q200", data: orders });
  } catch (err) {
    next(err); // 에러를 전역 오류 처리 미들웨어로 전달
  }
});

// 2. GET /api/quality/mpr_ds - mpr_d_tbl목록 전체 조회
router.get("/mpr_ds", async (req, res, next) => {
  try {
    const orders = await qualityService.getMpr_dList();
    res.json({ code: "Q200", data: orders });
  } catch (err) {
    next(err); // 에러를 전역 오류 처리 미들웨어로 전달
  }
});

// 3. GET /api/quality/es - 품질 팀의 사원 목록 조회
router.get("/es", async (req, res, next) => {
  try {
    const orders = await qualityService.getQualityEmployeeList();
    res.json({ code: "Q200", data: orders });
  } catch (err) {
    next(err); // 에러를 전역 오류 처리 미들웨어로 전달
  }
});

// 4. GET /api/quality/qio - qio_tbl목록 전체 조회
router.get("/qios", async (req, res, next) => {
  try {
    const orders = await qualityService.getQIOList();
    res.json({ code: "Q200", data: orders });
  } catch (err) {
    next(err); // 에러를 전역 오류 처리 미들웨어로 전달
  }
});

// 4. GET /api/quality/qiodetail - qio_tbl단건을 기반으로 품질검사지시 상세 조회
router.get("/qiodetail", async (req, res, next) => {
  const { qio_code, prdr_code, mpr_d_code } = req.query;
  try {
    const orders = await qualityService.getQIODetail(
      qio_code,
      prdr_code,
      mpr_d_code
    );
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
