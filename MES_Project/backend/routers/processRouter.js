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

// GET /api/process/detail - 공정 흐름도 상세 목록 조회
router.get("/detail", async (req, res, next) => {
  try {
    // 흐름도 코드 받아옴
    const { processCode } = req.query;

    if (!processCode) {
      return res.status(400).json({ message: "processCode 가 없습니다" });
    }

    const subProcess = await processService.getSubProcessList(processCode);
    res.json(subProcess);
  } catch (err) {
    next(err); // 에러를 전역 오류 처리 미들웨어로 전달
  }
});

module.exports = router;
