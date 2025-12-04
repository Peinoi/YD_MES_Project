// 각 테이블 별로 실행한 SQL문을 별도 파일로 작성

const Productionwork = require("./sqls/production/production_work.js");
const order = require("./sqls/orderSQL.js");
const common = require("./sqls/commonSQL.js");
const po = require("./sqls/po.js");
const inbound = require("./sqls/inbound.js");
module.exports = {
  // ...sample,
  ...Productionwork,
  ...order,
  ...common,
  ...po,
  ...inbound,
};
