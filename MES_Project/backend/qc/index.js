const express = require('express');
const router = express.Router();

const qcRouter = require('./routers/sampleRouter.js');

router.use('/qc', qcRouter);

module.exports = router;
