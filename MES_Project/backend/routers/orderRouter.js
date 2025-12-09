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

// GET /order/client/search - 거래처 모달창 조회
router.get("/client/search", async (req, res, next) => {
  try {
    // 쿼리스트링에서 검색 조건 받기
    const filters = {
      client_code: req.query.client_code || null,
      client_name: req.query.client_name || null,
    };

    const searchs = await orderService.getClientSearch(filters);

    res.json({ code: "S200", data: searchs });
  } catch (err) {
    next(err); // 에러를 전역 오류 처리 미들웨어로 전달
  }
});

// GET /order/manager/search - 거래처 담당자 모달창 조회
router.get("/manager/search", async (req, res, next) => {
  try {
    // 쿼리스트링에서 검색 조건 받기
    const filters = {
      emp_code: req.query.emp_code || null,
      emp_name: req.query.emp_name || null,
    };

    const searchs = await orderService.getManagerSearch(filters);

    res.json({ code: "S200", data: searchs });
  } catch (err) {
    next(err); // 에러를 전역 오류 처리 미들웨어로 전달
  }
});

// GET /order/product/search - 상품 모달창 조회
router.get("/product/search", async (req, res, next) => {
  try {
    // 쿼리스트링에서 검색 조건 받기
    const filters = {
      prod_code: req.query.prod_code || null,
      prod_name: req.query.prod_name || null,
      com_value_name: req.query.com_value_name || null,
    };

    const searchs = await orderService.getProductSearch(filters);

    res.json({ code: "S200", data: searchs });
  } catch (err) {
    next(err); // 에러를 전역 오류 처리 미들웨어로 전달
  }
});

// GET /order/production - 주문 정보, 제품 정보 조회
router.get("/production", async (req, res, next) => {
  try {
    // 쿼리스트링에서 검색 조건 받기
    const ord_code = req.query.ord_code;

    const productions = await orderService.getOrderProduction(ord_code);

    res.json({ code: "S200", data: productions });
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

// DELETE /order/:ord_code - 주문 삭제
router.delete("/:ord_code", async (req, res, next) => {
  try {
    const ord_code = req.params.ord_code;

    if (!ord_code) {
      return res.status(400).json({
        code: "E400",
        message: "ord_code가 필요합니다.",
      });
    }

    const deletedOrder = await orderService.removeOrder(ord_code);

    res.json({ code: "S200", data: deletedOrder });
  } catch (err) {
    next(err); // 에러를 전역 오류 처리 미들웨어로 전달
  }
});

// POST /order - 주문 저장/수정
router.post("/", async (req, res, next) => {
  try {
    const payload = req.body;
    const result = await orderService.saveOrder(payload);

    res.json({ code: "S200", data: result });
  } catch (err) {
    next(err); // 에러를 전역 오류 처리 미들웨어로 전달
  }
});

// GET /order/:ordCode - 주문 단건 조회
router.get("/:ordCode", async (req, res, next) => {
  try {
    const ordCode = req.params.ordCode;

    const order = await orderService.getOrder(ordCode);

    res.json({ code: "S200", data: order });
  } catch (err) {
    next(err); // 에러를 전역 오류 처리 미들웨어로 전달
  }
});

module.exports = router;
