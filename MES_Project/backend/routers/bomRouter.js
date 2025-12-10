// routers/bomRouter.js
const express = require("express");
const router = express.Router();
const bomService = require("../services/bomService.js");
const { bomExcelDownload } = require("../services/bomService");

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
    const { bom_code, prod_code, is_used, materials, deleted } = req.body;

    const result = await bomService.saveBomMaterials(
      bom_code,
      materials,
      deleted,
      prod_code,
      is_used
    );

    res.json(result);
  } catch (err) {
    console.error("Router Error:", err);
    res.status(500).json({ error: "BOM 저장 실패" });
  }
});
// ==========================
// 📌 엑셀 다운로드 엔드포인트
// ==========================
router.get("/download", async (req, res) => {
  try {
    const workbook = await bomExcelDownload();

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=bom_export.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("엑셀 다운로드 오류:", err);
    res.status(500).json({ message: "엑셀 생성 실패" });
  }
});
router.post("/create", async (req, res) => {
  try {
    const result = await bomService.createBom(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Create failed" });
  }
});

module.exports = router; // 이렇게 변경해 주세요.
