const express = require("express");
const router = express.Router();
const poService = require("../services/poService.js");

// 자재 모달 조회
router.get("/mate", async (req, res, next) => {
  try {
    const { keyword } = req.query;
    const list = await poService.getMateList(keyword);

    res.json({
      code: "S200",
      data: list,
    });
  } catch (err) {
    next(err);
  }
});

// 발주 자재별 목록 조회
router.get("/list", async (req, res) => {
  try {
    const { purchaseCode } = req.query;
    const rows = await poService.getPoListFlat(purchaseCode);

    res.json({
      success: true,
      data: rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "발주 목록 조회 중 오류가 발생했습니다.",
    });
  }
});

// 발주 삭제
router.delete("/:purchaseCode", async (req, res, next) => {
  try {
    const { purchaseCode } = req.params;

    if (!purchaseCode) {
      return res.status(400).json({
        code: "E400",
        message: "purchaseCode가 필요합니다.",
      });
    }

    await poService.deletePo(purchaseCode);

    res.json({
      code: "S200",
      message: "발주서가 삭제되었습니다.",
    });
  } catch (err) {
    next(err);
  }
});

// 발주서 목록 조회
router.get("/", async (req, res, next) => {
  try {
    const { purchaseCode } = req.query;
    const list = await poService.getPoList(purchaseCode);

    res.json({
      code: "S200",
      data: list,
    });
  } catch (err) {
    next(err);
  }
});

//  발주 저장/수정
router.post("/", async (req, res, next) => {
  try {
    const poDto = req.body;
    const result = await poService.savePo(poDto);

    res.json({
      code: "S200",
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/mpr/next-code", async (req, res) => {
  try {
    const code = await poService.getNextReqCode();
    res.json({ success: true, code });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "요청번호 생성 실패" });
  }
});

// 직원 부서 조회
router.get("/emp/dept", async (req, res) => {
  try {
    const empCode = req.query.empCode;

    if (!empCode) {
      return res.status(400).json({
        success: false,
        message: "empCode is required",
      });
    }

    const deptName = await poService.getDeptByEmpCode(empCode);

    res.json({
      success: true,
      deptName: deptName || "",
    });
  } catch (err) {
    console.error("부서 조회 실패:", err);
    res.status(500).json({
      success: false,
      message: "부서 조회 중 오류 발생",
    });
  }
});

//자재 구매 요청 저장
router.post("/mpr", async (req, res) => {
  try {
    const result = await poService.saveMpr(req.body); // { header, items }
    res.json({ success: true, data: result });
  } catch (err) {
    console.error("saveMpr error:", err);
    res.status(500).json({
      success: false,
      message: "자재 구매 요청 저장 실패",
    });
  }
});

// 자재 구매요청서 목록 조회
router.get("/mpr/list", async (req, res) => {
  try {
    const { mprCode } = req.query;
    const rows = await poService.getMprList(mprCode);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "자재 구매요청서 목록 조회 실패",
    });
  }
});

router.get("/mpr/list-for-po", async (req, res) => {
  try {
    const { mprCode } = req.query;
    const rows = await poService.getMprListForPo(mprCode || null);

    res.json({
      success: true,
      data: rows,
    });
  } catch (err) {
    console.error("발주용 요청 목록 조회 오류:", err);
    res.status(500).json({
      success: false,
      message: "발주용 요청 목록 조회 중 오류가 발생했습니다.",
    });
  }
});

// 자재 구매요청서 자재별 목록 조회
router.get("/mpr/req-items", async (req, res) => {
  try {
    const rows = await poService.getMprRequestItemList();

    res.json({
      success: true,
      data: rows,
    });
  } catch (err) {
    console.error("요청 자재 목록 조회 오류:", err);
    res.status(500).json({
      success: false,
      message: "요청 자재 목록 조회 중 오류가 발생했습니다.",
    });
  }
});

// 자재 구매요청서 단건 조회
router.get("/mpr/:mprCode", async (req, res) => {
  try {
    const { mprCode } = req.params;
    const data = await poService.getMprByCode(mprCode);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "해당 요청서를 찾을 수 없습니다.",
      });
    }

    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "자재 구매요청서 조회 실패",
    });
  }
});

// 요청 상세 조회
router.get("/mpr/detail/:mprCode", async (req, res) => {
  try {
    const { mprCode } = req.params;

    if (!mprCode) {
      return res.status(400).json({
        success: false,
        message: "mprCode가 필요합니다.",
      });
    }

    // 병렬 조회
    const [header, detail] = await Promise.all([
      poService.getMprDetailHeader(mprCode),
      poService.getMprDetailItems(mprCode), // { items, history }
    ]);

    if (!header) {
      return res.status(404).json({
        success: false,
        message: "해당 요청서를 찾을 수 없습니다.",
      });
    }

    res.json({
      success: true,
      data: {
        header,
        items: detail.items || [],
        history: detail.history || [],
      },
    });
  } catch (err) {
    console.error("요청 상세 조회 오류:", err);
    res.status(500).json({
      success: false,
      message: "요청 상세 조회 중 오류가 발생했습니다.",
    });
  }
});

//공급업체 목록
router.get("/client", async (req, res) => {
  try {
    const keyword = req.query.keyword || "";

    const data = await poService.getClientList(keyword);

    res.json({ success: true, data });
  } catch (err) {
    console.error(" 공급업체 조회 오류:", err);
    res.status(500).json({ success: false, message: "공급업체 조회 실패" });
  }
});

router.get("/emp/list", async (req, res) => {
  const keyword = req.query.keyword || "";

  try {
    const rows = await poService.getEmpList(keyword);
    res.json({
      success: true,
      data: rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "사원 목록 조회 중 오류 발생",
      error: err.message,
    });
  }
});

// 발주 단건 조회
router.get("/:purchaseCode", async (req, res, next) => {
  try {
    const { purchaseCode } = req.params;
    const data = await poService.getPoByCode(purchaseCode);

    if (!data) {
      return res.status(404).json({
        code: "E404",
        message: "해당 발주서를 찾을 수 없습니다.",
      });
    }

    res.json({
      code: "S200",
      data,
    });
  } catch (err) {
    next(err);
  }
});
module.exports = router;
