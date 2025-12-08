// backend/routers/dashboardRouter.js
const express = require("express");
const router = express.Router();

const dashboardService = require("../services/dashboardService");

// 1) 생산 현황
router.get("/production", async (req, res) => {
  try {
    const data = await dashboardService.getProduction();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Production load failed" });
  }
});

// 2) 라면 종류별 생산량
router.get("/ramen", async (req, res) => {
  try {
    const data = await dashboardService.getRamen();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ramen load failed" });
  }
});

// 3) 설비 가동 정보
router.get("/equipments", async (req, res) => {
  try {
    const data = await dashboardService.getEquipments();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Equip load failed" });
  }
});

// 4) 알림 리스트
router.get("/order", async (req, res) => {
  try {
    // 💡 try 블록 추가
    const data = await dashboardService.getOrders();
    res.json(data);
  } catch (err) {
    // 💡 catch 블록 추가
    console.error(err);
    res.status(500).json({ error: "Order load failed" });
  }
});

module.exports = router;
