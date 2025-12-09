const express = require("express");
const router = express.Router();
const production_workServices = require("../services/production_workServices.js");

// 생산 진행 조회
router.get("/work/process/:wko_code/:prod_code", async (req, res, next) => {
  try {
    const { wko_code, prod_code } = req.params;
    const plans = await production_workServices.production_work(
      wko_code,
      prod_code
    );
    console.log(plans);
    res.json({ code: "S200", data: plans });
  } catch (err) {
    next(err);
  }
});

// 작업 진행 목록
router.get("/work/task", async (req, res, next) => {
  try {
    const plans = await production_workServices.production_task();
    res.json({ code: "S200", data: plans });
  } catch (err) {
    next(err);
  }
});

// 생산 실적 목록
router.get("/work/performance", async (req, res, next) => {
  try {
    const plans = await production_workServices.production_performance();
    res.json({ code: "S200", data: plans });
  } catch (err) {
    next(err);
  }
});
//실적 코드 생성용 조회
router.get("/work/prdrmax", async (req, res, next) => {
  try {
    const plans = await production_workServices.prdr_info();
    res.json({ code: "S200", data: plans });
  } catch (err) {
    next(err);
  }
});
// 사용 가능 설비 목록
router.get("/work/availableequipmentlist", async (req, res, next) => {
  try {
    const plans = await production_workServices.availableEquipmentList();
    res.json({ code: "S200", data: plans });
  } catch (err) {
    next(err);
  }
});

// 설비 상태 업데이트
router.put("/work/availableequipmentupdate/:code", async (req, res, next) => {
  try {
    const { code } = req.params;
    const { stat } = req.body; // body에서 stat 받아야 함

    const result = await production_workServices.availableEquipmentUpdate({
      code,
      stat,
    });

    res.json({ code: "S200", data: result });
  } catch (err) {
    next(err);
  }
});

// 실적 상태 업데이트
router.put("/work/prdrupdate/:code", async (req, res, next) => {
  try {
    const { code } = req.params;
    const { stat } = req.body;

    const result = await production_workServices.prdrUpdate({
      prdr_code: code,
      stat,
    });

    res.json({ code: "S200", data: result });
  } catch (err) {
    next(err);
  }
});
//진행도 업데이트
router.put("/work/process/finish", async (req, res, next) => {
  try {
    const { prdr_code, qtt, details } = req.body;

    const result = await production_workServices.finishAllProcesses({
      prdr_code,
      qtt,
      details,
    });

    res.json({ code: "S200", data: result });
  } catch (err) {
    next(err);
  }
});

// 실적 등록 (INSERT)
router.post("/work/prdrinsert", async (req, res, next) => {
  try {
    const data = req.body; // body로 전달해야 함

    const result = await production_workServices.prdrInsert(data);

    res.json({ code: "S200", data: result });
  } catch (err) {
    next(err);
  }
});
// 작업지시 상태 업데이트
router.put("/work/wkoupdate/:code", async (req, res, next) => {
  try {
    const { code } = req.params; // wko_code
    const { stat } = req.body; // 변경할 상태값

    const result = await production_workServices.wkoUpdate({
      wko_code: code,
      stat,
    });

    res.json({ code: "S200", data: result });
  } catch (err) {
    next(err);
  }
});

// 작업 종료
router.put("/work/prdrend/:code", async (req, res, next) => {
  try {
    const { code } = req.params;
    const { end_date, total_time, qtt, rate, stat } = req.body;
    const formattedEndDate = toMysqlDatetime(end_date);
    const result = await production_workServices.prdrEnd({
      prdr_code: code,
      end_date: formattedEndDate,
      total_time,
      qtt,
      rate,
      stat,
    });

    res.json({ code: "S200", data: result });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
function toMysqlDatetime(date) {
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, "0");

  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  );
}
