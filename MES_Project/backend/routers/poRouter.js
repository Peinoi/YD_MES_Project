const express = require("express");
const router = express.Router();
const poService = require("../services/poService.js");

// 발주 단건 조회 (발주정보 불러오기 버튼에서 사용)
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

// 발주 저장 (신규/수정)
router.post("/", async (req, res, next) => {
  try {
    const poDto = req.body; // { header: {...}, items: [...] }

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
