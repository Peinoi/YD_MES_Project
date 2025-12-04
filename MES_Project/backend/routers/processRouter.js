const express = require("express");
const router = express.Router();
const processService = require("../services/processService.js");

// GET /api/process/list - 공정 흐름도 조회
router.get("/list", async (req, res, next) => {
  try {
    const searchParams = req.query;
    const results = await processService.getProcessFlowList(searchParams);
    res.json(results);
  } catch (err) {
    next(err); // 에러를 전역 오류 처리 미들웨어로 전달
  }
});

module.exports = router;
