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
      ord_date: req.query.ord_date || null,
      client_name: req.query.client_name || null,
      ord_amount: req.query.ord_amount || null,
      delivery_date: req.query.delivery_date || null,
      ord_stat: req.query.ord_stat || null,
    };

    const orders = await orderService.getOrderList(filters);

    res.json({ code: "S200", data: orders });
  } catch (err) {
    next(err); // 에러를 전역 오류 처리 미들웨어로 전달
  }
});

// GET /order/client/list - 거래처 목록 전체 조회
router.get("/client/list", async (req, res, next) => {
  try {
    // 쿼리스트링에서 검색 조건 받기
    const filters = {
      ord_code: req.query.ord_code || null,
      ord_name: req.query.ord_name || null,
      ord_date: req.query.ord_date || null,
      client_name: req.query.client_name || null,
      ord_amount: req.query.ord_amount || null,
      delivery_date: req.query.delivery_date || null,
      ord_stat: req.query.ord_stat || null,
    };

    const orders = await orderService.getOrderList(filters);

    res.json({ code: "S200", data: orders });
  } catch (err) {
    next(err); // 에러를 전역 오류 처리 미들웨어로 전달
  }
});

module.exports = router;
