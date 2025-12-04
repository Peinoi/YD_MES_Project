const express = require("express");
const router = express.Router();
const orderService = require("../services/orderService.js");

// GET /order/list - 주문 목록 전체 조회
router.get("/list", async (req, res, next) => {
  try {
    // 쿼리스트링에서 검색 조건 받기
    const filters = {
      ord_code: req.query.ord_code || null,
      ord_name: req.query.ord_name || null,
      ord_date_from: req.query.ord_date_from || null,
      ord_date_to: req.query.ord_date_to || null,
      client_name: req.query.client_name || null,
      ord_amount_from: req.query.ord_amount_from || null,
      ord_amount_to: req.query.ord_amount_to || null,
      delivery_date_from: req.query.delivery_date_from || null,
      delivery_date_to: req.query.delivery_date_to || null,
      ord_stat_name: req.query.ord_stat_name || null,
    };

    const orders = await orderService.getOrderList(filters);

    res.json({ code: "S200", data: orders });
  } catch (err) {
    next(err); // 에러를 전역 오류 처리 미들웨어로 전달
  }
});

// GET /order/search - 주문 모달창 조회
router.get("/search", async (req, res, next) => {
  try {
    // 쿼리스트링에서 검색 조건 받기
    const filters = {
      ord_code: req.query.ord_code || null,
      ord_name: req.query.ord_name || null,
      client_name: req.query.client_name || null,
    };

    const searchs = await orderService.getOrderSearch(filters);

    res.json({ code: "S200", data: searchs });
  } catch (err) {
    next(err); // 에러를 전역 오류 처리 미들웨어로 전달
  }
});

// GET /order/client/list - 거래처 목록 전체 조회
router.get("/client/list", async (req, res, next) => {
  try {
    const clients = await orderService.getClientList();

    res.json({ code: "S200", data: clients });
  } catch (err) {
    next(err); // 에러를 전역 오류 처리 미들웨어로 전달
  }
});

// GET /order/stat/list - 상태 목록 전체 조회
router.get("/stat/list", async (req, res, next) => {
  try {
    const notes = await orderService.getStatList();

    res.json({ code: "S200", data: notes });
  } catch (err) {
    next(err); // 에러를 전역 오류 처리 미들웨어로 전달
  }
});

// GET /order/manager/list - 영업팀 거래처 담당자 목록 전체 조회
router.get("/manager/list", async (req, res, next) => {
  try {
    const managers = await orderService.getManagerList();

    res.json({ code: "S200", data: managers });
  } catch (err) {
    next(err); // 에러를 전역 오류 처리 미들웨어로 전달
  }
});

module.exports = router;
