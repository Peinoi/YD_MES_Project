// MES_Project/backend/routers/release/fwdRouter.js
const express = require("express");
const router = express.Router();
const fwdService = require("../../services/release/fwdService.js");

/* ===========================
 *  주문 관련
 * =========================== */

/**
 * 주문 리스트 조회 (모달용)
 * GET /api/release/fwd/orders
 */
router.get("/orders", async (req, res) => {
  const { keyword = "" } = req.query;

  try {
    const rows = await fwdService.getOrderList(keyword);

    return res.json({
      status: "success",
      data: rows,
    });
  } catch (err) {
    console.error("[Forwarding] 주문 목록 조회 실패:", err);
    return res.status(500).json({
      status: "error",
      message: "주문 목록 조회 중 오류가 발생했습니다.",
    });
  }
});

/**
 * 단일 주문 상세 조회 (헤더 + 라인)
 * GET /orders/:orderNo
 */
router.get("/orders/:orderNo", async (req, res) => {
  try {
    const { orderNo } = req.params;

    if (!orderNo) {
      return res.status(400).json({
        status: "fail",
        message: "orderNo가 필요합니다.",
      });
    }

    const result = await fwdService.getOrderDetail(orderNo);
    console.log("[fwdRouter] /orders/:orderNo result:", result);

    if (!result) {
      // 개발 단계에서는 200 + data: null 로 처리
      return res.json({
        status: "success",
        data: null,
      });
    }

    return res.json({
      status: "success",
      data: result, // { header, items }
    });
  } catch (err) {
    console.error("[fwdRouter] GET /orders/:orderNo error:", err);
    return res.status(500).json({
      status: "error",
      message: "주문 상세 조회 중 오류가 발생했습니다.",
    });
  }
});

/* ===========================
 *  출고(Forwarding) 관련
 * =========================== */

/**
 * 출고요청 리스트 조회 (모달용)
 * GET /api/release/fwd
 * query: keyword, fromDate, toDate, client, status
 */
router.get("/", async (req, res) => {
  try {
    const {
      keyword = "",
      fromDate = "",
      toDate = "",
      client = "",
      status = "",
    } = req.query;

    const result = await fwdService.getReleaseList({
      keyword,
      fromDate,
      toDate,
      client,
      status,
    });

    return res.json({
      status: "success",
      data: result, // 배열 rows 그대로
    });
  } catch (err) {
    console.error("[fwdRouter] GET / (release list) error:", err);
    return res.status(500).json({
      status: "error",
      message: "출고전표 목록 조회 중 오류가 발생했습니다.",
    });
  }
});

/**
 * 출고요청 조회 (ForwardingCheck)
 * GET /api/release/fwd/check
 */
router.get("/check", async (req, res) => {
  try {
    const {
      releaseNo = "",
      productName = "",
      productCode = "",
      qtyFrom = "",
      qtyTo = "",
      dateFrom = "",
      dateTo = "",
      manager = "",
      client = "",
    } = req.query;

    const rows = await fwdService.getForwardingCheckList({
      releaseNo,
      productName,
      productCode,
      qtyFrom,
      qtyTo,
      dateFrom,
      dateTo,
      manager,
      client,
    });

    return res.json({
      status: "success",
      data: rows,
    });
  } catch (err) {
    console.error("[fwdRouter] GET /check error:", err);
    return res.status(500).json({
      status: "error",
      message: "출고요청 조회 중 오류가 발생했습니다.",
    });
  }
});

/**
 * 등록자(직원) 목록 조회
 * GET /api/release/fwd/employees
 */
router.get("/employees", async (req, res) => {
  try {
    const rows = await fwdService.getEmployeeList();

    return res.json({
      status: "success",
      data: rows, // [{ empCode, empName }, ...]
    });
  } catch (err) {
    console.error("[Forwarding] 직원 목록 조회 실패:", err);
    return res.status(500).json({
      status: "error",
      message: "직원 목록 조회 중 오류가 발생했습니다.",
    });
  }
});

/* ===========================
 *  출고제품 목록 조회 (모달)
 *  GET /api/release/fwd/products?keyword=...
 * =========================== */
router.get("/products", async (req, res) => {
  try {
    const { keyword = "" } = req.query;

    const rows = await fwdService.getProductList(keyword);

    return res.json({
      status: "success",
      data: rows, // [{ productCode, productName, ... }]
    });
  } catch (err) {
    console.error("[Forwarding] 제품 목록 조회 실패:", err);
    return res.status(500).json({
      status: "error",
      message: "제품 목록 조회 중 오류가 발생했습니다.",
    });
  }
});

// 출고요청 목록 조회 (전체 – 출고조회 페이지 모달용)
router.get("/all", async (req, res) => {
  try {
    const rows = await fwdService.getReleaseListAll(req.query);
    return res.json({ status: "success", data: rows });
  } catch (err) {
    console.error("[Forwarding] 출고 목록(전체) 조회 실패:", err);
    return res.status(500).json({
      status: "error",
      message: "출고 목록(전체) 조회 중 오류가 발생했습니다.",
    });
  }
});

/* ===========================
 *  거래처 목록 조회 (모달)
 *  GET /api/release/fwd/clients?keyword=...
 * =========================== */
router.get("/clients", async (req, res) => {
  try {
    const { keyword = "" } = req.query;

    const rows = await fwdService.getClientList(keyword);

    return res.json({
      status: "success",
      data: rows, // [{ clientCode, clientName, ... }]
    });
  } catch (err) {
    console.error("[Forwarding] 거래처 목록 조회 실패:", err);
    return res.status(500).json({
      status: "error",
      message: "거래처 목록 조회 중 오류가 발생했습니다.",
    });
  }
});

// 출고 화면 공통코드 조회
// GET /api/release/fwd/codes
router.get("/codes", async (req, res) => {
  try {
    const data = await fwdService.getForwardingCommonCodes();
    return res.json({
      status: "success",
      data,
    });
  } catch (err) {
    console.error("[Forwarding] 공통코드 조회 실패:", err);
    return res.status(500).json({
      status: "error",
      message: "공통코드 조회 중 오류가 발생했습니다.",
    });
  }
});

/**
 * 출고전표 단건 조회 (헤더 + 라인)
 * GET /api/release/fwd/:releaseCode
 */
router.get("/:releaseCode", async (req, res) => {
  try {
    const { releaseCode } = req.params;

    if (!releaseCode) {
      return res.status(400).json({
        status: "fail",
        message: "releaseCode가 필요합니다.",
      });
    }

    const result = await fwdService.getReleaseDetail(releaseCode);
    console.log("[fwdRouter] /:releaseCode result:", result);

    if (!result) {
      return res.json({
        status: "success",
        data: null,
      });
    }

    return res.json({
      status: "success",
      data: result, // { header, lines }
    });
  } catch (err) {
    console.error("[fwdRouter] GET /:releaseCode error:", err);
    return res.status(500).json({
      status: "error",
      message: "출고전표 상세 조회 중 오류가 발생했습니다.",
    });
  }
});

// 출고요청 등록
router.post("/", async (req, res) => {
  try {
    const { header, lines } = req.body;

    if (!header || !Array.isArray(lines) || lines.length === 0) {
      return res.status(400).json({
        status: "fail",
        message: "header 및 lines 데이터가 필요합니다.",
      });
    }

    const created = await fwdService.createRelease({ header, lines });

    return res.status(201).json({
      status: "success",
      data: created, // { outReqCode }
    });
  } catch (err) {
    console.error("[fwdRouter] POST / (create release) error:", err);
    return res.status(500).json({
      status: "error",
      message: "출고전표 생성 중 오류가 발생했습니다.",
    });
  }
});

// 출고전표 수정
router.put("/:releaseCode", async (req, res) => {
  try {
    const { releaseCode } = req.params;
    const { header, lines } = req.body;
    if (!releaseCode) {
      return res.status(400).json({
        status: "fail",
        message: "releaseCode가 필요합니다.",
      });
    }
    if (!header || !Array.isArray(lines) || lines.length === 0) {
      return res.status(400).json({
        status: "fail",
        message: "header 및 lines 데이터가 필요합니다.",
      });
    }

    const updated = await fwdService.updateRelease(releaseCode, {
      header,
      lines,
    });

    return res.json({
      status: "success",
      data: updated,
    });
  } catch (err) {
    console.error("[fwdRouter] PUT /:releaseCode error:", err);
    return res.status(500).json({
      status: "error",
      message: "출고전표 수정 중 오류가 발생했습니다.",
    });
  }
});

// 출고전표 삭제
router.delete("/:releaseCode", async (req, res) => {
  try {
    const { releaseCode } = req.params;

    if (!releaseCode) {
      return res.status(400).json({
        status: "fail",
        message: "releaseCode가 필요합니다.",
      });
    }

    const result = await fwdService.deleteRelease(releaseCode);

    return res.json({
      status: "success",
      data: result, // { releaseCode, deletedDetails, deletedHeader }
    });
  } catch (err) {
    console.error("[fwdRouter] DELETE /:releaseCode error:", err);
    return res.status(500).json({
      status: "error",
      message: "출고전표 삭제 중 오류가 발생했습니다.",
    });
  }
});

// 실출고 처리
// POST /api/release/fwd/outbound
router.post("/outbound", async (req, res) => {
  try {
    const { header, lines } = req.body;

    const result = await fwdService.createOutboundRelease({
      header,
      lines,
    });

    return res.json({
      status: "success",
      data: result,
    });
  } catch (err) {
    console.error("[Forwarding] 실출고 처리 실패:", err);
    return res.status(500).json({
      status: "error",
      message: err.message || "실출고 처리 중 오류가 발생했습니다.",
    });
  }
});

module.exports = router;
