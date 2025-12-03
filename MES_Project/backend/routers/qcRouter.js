const express = require('express');
const router = express.Router();
const qcService = require('../services/qcService');

// 004 목록 조회
router.get('/list', async (req, res) => {
  try {
    const result = await qcService.qcFindAllService();
    res.json(result);
  } catch (err) {
    res.status(500).json({ ok: false, message: 'list Route Error' });
  }
});

// 005 검사결과 불러오기
router.get('/pending-list', async (req, res) => {
  try {
    const result = await qcService.pendingListService();
    res.json(result);
  } catch (err) {
    res.status(500).json({ ok: false, message: 'pending-list Route Error' });
  }
});

// 005 검사지시 불러오기
router.get('/instruction/:qirCode', async (req, res) => {
  try {
    const result = await qcService.findInstructionService(req.params);
    res.json(result);
  } catch (err) {
    res.status(500).json({ ok: false, message: 'instruction Route Error' });
  }
});

// 005 저장
router.post('/save', async (req, res) => {
  try {
    const result = await qcService.saveInstructionService(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ ok: false, message: 'save Route Error' });
  }
});

// 005 삭제
router.delete('/:qirCode', async (req, res) => {
  try {
    const result = await qcService.deleteInstructionService(req.params);
    res.json(result);
  } catch (err) {
    res.status(500).json({ ok: false, message: 'delete Route Error' });
  }
});

module.exports = router;
