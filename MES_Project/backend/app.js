// 환경변수 로드
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// 각 모듈별 라우터 불러오기
const sampleRouter = require("./routers/sampleRouter.js");
const poRouter = require("./routers/poRouter.js");
const qualityRouter = require("./routers/qualityRouter.js");
const orderRouter = require("./routers/orderRouter.js");
const fwdRouter = require("./routers/release/fwdRouter.js");
const processRouter = require("./routers/processRouter.js");
const production_workRouter = require("./routers/production_workRouter.js");
const qcRouter = require("./routers/qcRouter.js");
const inboundRouter = require("./routers/inboundRouter.js");
const bomRouter = require("./routers/bomRouter.js");
const productionRouter = require("./routers/productionRouter.js");
const materialRouter = require("./routers/materialRouter");
const dashboardRouter = require("./routers/dashboardRouter");
const addProdRouter = require("./routers/addProdRouter.js");

// 라우터 연결
app.use("/dashboard", dashboardRouter);
app.use(`/api/productions`, sampleRouter);
app.use(`/poder`, poRouter);
app.use(`/quality`, qualityRouter);
app.use(`/order`, orderRouter);
app.use(`/release/fwd`, fwdRouter);
app.use(`/process`, processRouter);
app.use(`/productionwork`, production_workRouter);
app.use("/qc", qcRouter);
app.use(`/inbound`, inboundRouter);
app.use(`/baseinfo/bom`, bomRouter);
app.use(`/production`, productionRouter);
app.use(`/material`, materialRouter);

app.use(`/add-product`, addProdRouter);
// 전역 오류 처리 미들웨어
app.use((err, req, res, next) => {
  console.error(err.stack); // 서버 콘솔에 에러 스택 출력
  res.status(err.statusCode || 500).json({
    code: err.statusCode || 500,
    msg: err.message || "Internal Server Error",
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:3000`);
});
