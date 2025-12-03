// 환경변수 로드
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:3000`);
});

// 전역 오류 처리 미들웨어
app.use((err, req, res, next) => {
  console.error(err.stack); // 서버 콘솔에 에러 스택 출력
  res.status(err.statusCode || 500).json({
    code: err.statusCode || 500,
    msg: err.message || 'Internal Server Error',
  });
});

// 라우터 연결
const sampleRouter = require('./routers/sampleRouter.js');
const poRouter = require('./routers/poRouter.js');
const qualityRouter = require('./routers/qualityRouter.js');
const orderRouter = require('./routers/orderRouter.js');
const qcRouter = require('./qc/routers/qcRouter.js');

// 라우터 연결
app.use(`/api/productions`, sampleRouter);
app.use(`/api/quality`, qualityRouter);
app.use(`/poder`, poRouter);
app.use(`/order`, orderRouter);
app.use('/qc', qcRouter);
