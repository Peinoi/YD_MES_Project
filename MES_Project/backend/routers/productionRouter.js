const express = require("express");
const router = express.Router();
const productionService = require("../services/productionService.js");

router.get("/plan", async (req, res) => {
  try {
    // 서비스 계층의 getProductionPlan 함수를 호출합니다.
    const planList = await productionService.getProductionPlan();

    // 결과를 JSON 형태로 응답합니다.
    res.status(200).json({
      success: true,
      data: planList,
    });
  } catch (error) {
    console.error("생산 계획 조회 라우트 에러:", error);
    res.status(500).json({
      success: false,
      message: error.message || "서버 내부 오류로 생산 계획 조회 실패",
    });
  }
});

module.exports = router;
