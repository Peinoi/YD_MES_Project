const express = require('express');
const router = express.Router();
const qcService = require('../services/qcService');

router.get('/', async (req, res) => {
  try {
    const result = await qcService.testService();
    res.json({ ok: true, data: result });
  } catch (err) {
    res.status(500).json({ ok: false, message: 'Error Route' });
  }
});

module.exports = router;
