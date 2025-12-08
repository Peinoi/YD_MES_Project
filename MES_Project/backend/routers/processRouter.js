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

// GET /api/process/podetail - 공정 코드 상세 정보
router.get("/podetail", async (req, res, next) => {
  try {
    // 공정 코드 받아옴
    const { poCode } = req.query;

    if (!poCode) {
      return res.status(400).json({ message: "poCode가 없습니다" });
    }
    const subPo = await processService.getSubProcessCode(poCode);
    res.json(subPo);
  } catch (err) {
    next(err);
  }
});

// GET /api/process/line - 라인 흐름도 조회
router.get("/line", async (req, res, next) => {
  try {
    const searchParams = req.query; // { lineCode: 'LINE-001' } 같은 객체
    const results = await processService.getLineFlowList(searchParams);
    res.json(results);
  } catch (err) {
    next(err); // 에러를 전역 오류 처리 미들웨어로 전달
  }
});

// GET /api/process/linedetail
router.get("/linedetail", async (req, res, next) => {
  try {
    // 라인 코드 받아옴
    const { lineCode } = req.query;

    if (!lineCode) {
      return res.status(400).json({ message: "lineCode가 없습니다" });
    }
    const lineDetail = await processService.getLineDetailList(lineCode);
    res.json(lineDetail);
  } catch (err) {
    next(err); // 에러를 전역 오류 처리 미들웨어로 전달
  }
});

module.exports = router;
