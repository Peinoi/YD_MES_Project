// routers/bomRouter.js
const express = require("express");
const router = express.Router();
const bomService = require("../services/bomService.js");

/** GET /api/bom - 전체 BOM 리스트 조회 */
//전체 조회
router.get("/", async (req, res) => {
  console.log("[bomRouter] GET / 요청받음");

  try {
    const data = await bomService.getBomList();
    res.json(data);
  } catch (err) {
    console.error("[bomRouter] 조회 실패:", err);
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
});
//필터 검색 post
router.post("/search", async (req, res) => {
  try {
    const data = await bomService.searchBom(req.body);
    res.json(data);
  } catch (err) {
    console.error("검색 실패:", err);
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
});
//제품 필터 모달
router.get("/prodmodal", async (req, res) => {
  console.log("[bomRouter] GET / 요청받음");

  try {
    const data = await bomService.prodSelect();
    res.json(data);
  } catch (err) {
    console.error("[bomRouter] 조회 실패:", err);
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
});
//bom_mat
router.get("/mat", async (req, res) => {
  try {
    const data = await bomService.allBomMatList();

    res.json(data);
  } catch (err) {
    console.error("전체 자재 조회 실패:", err);
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
});
//product 한개당 bom_mat
router.get("/mat/:prodCode", async (req, res) => {
  try {
    const prodCode = req.params.prodCode;
    const data = await bomService.getBomMatList(prodCode);
    res.json(data);
  } catch (err) {
    console.error("자재 조회 실패:", err);
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
});
router.post("/save", async (req, res) => {
  try {
    const { bom_code, materials } = req.body;

    if (!bom_code) return res.status(400).json({ message: "bom_code 누락됨" });
    if (!materials || !materials.length)
      return res.status(400).json({ message: "재료 목록이 비어 있음" });

    const result = await bomService.saveBomMaterials(bom_code, materials);

    res.json(result);
  } catch (err) {
    console.error("Router Error:", err);
    res.status(500).json({ message: "서버 오류", error: err });
  }
});

module.exports = router; // 이렇게 변경해 주세요.
