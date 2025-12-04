const express = require("express");
const router = express.Router();
const production_workServices = require("../services/production_workServices.js");

// GET /api/productions - 생산 계획 목록 조회
router.get("/work/list", async (req, res, next) => {
  try {
    console.log("생산 현황 체크 불러오는중");
    const plans = await production_workServices.production_work();
    res.json({ code: "S200", data: plans });
  } catch (err) {
    next(err); // 에러를 전역 오류 처리 미들웨어로 전달
  }
});

// 작업 진행 목록
router.get("/work/task", async (req, res, next) => {
  try {
    console.log("작업 진행 목록 불러오는중");
    const plans = await production_workServices.production_task();
    console.log(plans);
    res.json({ code: "S200", data: plans });
  } catch (err) {
    next(err); // 에러를 전역 오류 처리 미들웨어로 전달
  }
});

module.exports = router;
