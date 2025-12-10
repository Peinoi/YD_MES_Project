// HTTP의 요청을 받아 서비스 로직으로 전달하고 결과를 응답
// Express를 사용 웹서버 구축할 수 있는 라이브러리
const express = require("express");
// Express의 라우터 객체를 생성
const router = express.Router();
// processService.js 모듈을 불러옴
const processService = require("../services/processService.js");

// GET /api/process/list - 공정 흐름도 조회
router.get("/list", async (req, res, next) => {
  try {
    // req: request 클라이언트가 서버로 데이터를 보낼 때
    // 그 요청에 관련된 모든 정보를 담는 하나의 큰 객체

    // req.query: URL의 ?기호 뒤에 오는 모든 문자열을 찾아냄
    // parsing: 이 문자열을 & 를 기준으로 나누고 = 를 기준으로 key와 value를 분리
    // 객체 생성: 분석한 key와 value를 모아서 새로운 자바스크립트 객체를 만듬
    // req 객체에 주입 req객체의 query라는 이름의 속성을 추가
    const searchParams = req.query;

    // processService.js에 있는 getProcessFlowList함수를 호출
    // DB조회 await는 비동기 작업
    const results = await processService.getProcessFlowList(searchParams);

    // JavaScript Object Notation
    res.json(results);
  } catch (err) {
    // 코드 실행중 에러가 발생하면 catch 블록으로 이동 하여 서버가 멈추지 않도록 함
    next(err); // 에러를 전역 오류 처리 미들웨어로 전달
  }
});

// GET /api/process/detail - 공정 흐름도 상세 목록 조회
router.get("/detail", async (req, res, next) => {
  try {
    // 객체 비구조화당할당  req.query 객체에서 processCode 속성의 값만 추출
    // 흐름도 코드 받아옴
    const { processCode } = req.query;

    // 유효성 검사
    if (!processCode) {
      // 400 Bad Request
      // 클라이언트가 서버에 요청한 내용에 문제가 있다
      // 서버가 request를 이해하지 못 하고 처리할 수 없다
      return res.status(400).json({ message: "processCode 가 없습니다" });
    }
    const subProcess = await processService.getSubProcessList(processCode);
    res.json(subProcess);
  } catch (err) {
    next(err); // 에러를 전역 오류 처리 미들웨어로 전달
  }
});

// GET /api/process/podetail - 공정 코드 전체 정보
router.get("/podetail", async (req, res, next) => {
  try {
    const searchParams = req.query;

    const result = await processService.getSubProcessCode(searchParams);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/process/line - 라인 흐름도 조회
router.get("/line", async (req, res, next) => {
  try {
    // { lineCode: 'LINE-001' } 같은 객체를 추출
    const searchParams = req.query;
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

// GET /api/process/itemlist
router.get("/itemlist", async (req, res, next) => {
  try {
    const searchParams = req.query;

    const result = await processService.getItemList(searchParams);
    res.json(result);
  } catch (err) {
    next(err); // 에러를 전역 오류 처리 미들웨어로 전달
  }
});

module.exports = router;
