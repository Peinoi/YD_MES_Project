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
  try {
    const {
      keyword = "",
      fromDate = "",
      toDate = "",
      client = "",
      status = "",
    } = req.query;

    // ✅ 페이징 없이 단순 리스트만
    const result = await fwdService.getOrderList({
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
    console.error("[fwdRouter] GET /orders error:", err);
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
    if (!result) {
      return res.status(404).json({
        status: "fail",
        message: "해당 주문을 찾을 수 없습니다.",
      });
    }

    return res.json({
      status: "success",
      data: result, // { header, items: [] }
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
 * 출고전표 리스트 조회 (모달용)
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

    // ✅ 페이징 없이 단순 리스트만
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
    if (!result) {
      return res.status(404).json({
        status: "fail",
        message: "해당 출고전표를 찾을 수 없습니다.",
      });
    }

    return res.json({
      status: "success",
      data: result, // { header, lines: [] }
    });
  } catch (err) {
    console.error("[fwdRouter] GET /:releaseCode error:", err);
    return res.status(500).json({
      status: "error",
      message: "출고전표 상세 조회 중 오류가 발생했습니다.",
    });
  }
});

/**
 * 출고전표 등록
 * POST /api/release/fwd
 * body: { header: {...}, lines: [...] }
 */
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
      data: created, // { releaseCode, ... }
    });
  } catch (err) {
    console.error("[fwdRouter] POST / (create release) error:", err);
    return res.status(500).json({
      status: "error",
      message: "출고전표 생성 중 오류가 발생했습니다.",
    });
  }
});

/**
 * 출고전표 수정
 * PUT /api/release/fwd/:releaseCode
 * body: { header: {...}, lines: [...] }
 */
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

/**
 * 출고전표 삭제(또는 취소 플래그 업데이트)
 * DELETE /api/release/fwd/:releaseCode
 */
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
      data: result, // { affectedRows }
    });
  } catch (err) {
    console.error("[fwdRouter] DELETE /:releaseCode error:", err);
    return res.status(500).json({
      status: "error",
      message: "출고전표 삭제 중 오류가 발생했습니다.",
    });
  }
});

module.exports = router;
