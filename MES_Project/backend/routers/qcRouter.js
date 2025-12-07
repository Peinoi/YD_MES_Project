const express = require('express');
const router = express.Router();
const qcService = require('../services/qcService');

// 004 목록 조회
router.post('/list', async (req, res) => {
  try {
    const result = await qcService.findQcListService(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ ok: false, message: 'list Router Error' });
  }
});

// 005 검사결과 불러오기
router.get('/pending-list', async (req, res) => {
  try {
    const result = await qcService.pendingListService();
    res.json(result);
  } catch (err) {
    res.status(500).json({ ok: false, message: 'pending-list Router Error' });
  }
});

// 005 검사지시 불러오기
router.get('/instruction/:qir_code', async (req, res) => {
  try {
    const result = await qcService.findInstructionService(req.params);
    res.json(result);
  } catch (err) {
    res.status(500).json({ ok: false, message: 'instruction Router Error' });
  }
});

// 005 저장
router.put('/save', async (req, res) => {
  try {
    const result = await qcService.saveResultService(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ ok: false, message: 'save Router Error' });
  }
});

// 005 삭제
router.delete('/:qirCode', async (req, res) => {
  try {
    const result = await qcService.deleteResultService(req.params);
    res.json(result);
  } catch (err) {
    res.status(500).json({ ok: false, message: 'delete Router Error' });
  }
});

module.exports = router;
