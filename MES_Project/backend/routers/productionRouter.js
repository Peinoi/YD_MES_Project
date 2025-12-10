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

// 🔥 PK 존재 여부 확인 라우팅
router.get("/check", async (req, res) => {
  try {
    const { workOrderNo } = req.query;

    const result = await productionService.checkProductionPlanExists(
      workOrderNo
    );

    res.status(200).json(result); // { exists: true/false }
  } catch (error) {
    console.error("PK 체크 중 오류:", error);
    res.status(500).json({
      success: false,
      message: "PK 확인 중 서버 오류",
    });
  }
});

router.put("/update", async (req, res) => {
  try {
    console.log("payload:", req.body); // 여기 찍어서 실제 값 확인
    await productionService.updateProductionPlan(req.body);
    res.status(200).json({ success: true, message: "업데이트 완료" });
  } catch (error) {
    console.error("업데이트 중 오류:", error);
    res.status(500).json({ success: false, message: "업데이트 중 서버 오류" });
  }
});

router.post("/insert", async (req, res) => {
  try {
    const payload = req.body;
    console.log("insert payload:", payload);

    const result = await productionService.insertProductionPlan(payload);

    res.status(200).json({
      success: true,
      message: "작업지시 등록 완료",
      result,
    });
  } catch (error) {
    console.error("INSERT 오류:", error);
    res.status(500).json({
      success: false,
      message: "작업지시 등록 실패",
    });
  }
});

router.get("/line", async (req, res) => {
  try {
    // 서비스 계층의 getProductionPlan 함수를 호출합니다.
    const LineList = await productionService.getSelectLine();

    // 결과를 JSON 형태로 응답합니다.
    res.status(200).json({
      success: true,
      data: LineList,
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
