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

//  발주 저장 (신규/수정 공통)
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

module.exports = router;
