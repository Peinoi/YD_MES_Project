// 각 테이블 별로 실행한 SQL문을 별도 파일로 작성

const Productionwork = require("./sqls/production/production_work.js");
const production = require("./sqls/production/production.js");
const order = require("./sqls/orderSQL.js");
const common = require("./sqls/commonSQL.js");
const po = require("./sqls/po.js");
const qcSQL = require("./sqls/qc/qcSQL.js");
const inbound = require("./sqls/inbound.js");
const process = require("./sqls/process.js");
module.exports = {
  ...Productionwork,
  ...production,
  ...order,
  ...common,
  ...po,
  ...qcSQL,
  ...inbound,
  ...process,
};
