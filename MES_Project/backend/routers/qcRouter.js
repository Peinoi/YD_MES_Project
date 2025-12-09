const express = require('express');
const router = express.Router();
const qcService = require('../services/qcService');

// 004 qcr_code, check_method 조회
router.get('/list', async (req, res) => {
  try {
    const result = await qcService.findQcrList();
    res.json(result);
  } catch (err) {
    res.status(500).json({ ok: false, message: 'list Router Error' });
  }
});

// 004 검색 및 조회
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

// 005 QirList 불러오기
router.get('/QirList/:qio_code', async (req, res) => {
  try {
    const result = await qcService.findQirList(req.params);
    res.json(result);
  } catch (err) {
    res.status(500).json({ ok: false, message: 'instruction Router Error' });
  }
});

// 005 저장
router.put('/', async (req, res) => {
  try {
    const result = await qcService.saveResultService(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ ok: false, message: 'save Router Error' });
  }
});

// 005 삭제
router.post('/delete', async (req, res) => {
  try {
    const result = await qcService.deleteResultService(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ ok: false, message: 'delete Router Error' });
  }
});

module.exports = router;
