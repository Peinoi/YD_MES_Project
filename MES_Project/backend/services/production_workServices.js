const { getConnection } = require("../database/mapper.js");
const sqlList = require("../database/sqlList.js");

// 생산 진행 조회
exports.production_work = async (code) => {
  const conn = await getConnection();
  try {
    const result = await conn.query(sqlList.work, [code]);
    return { result };
  } finally {
    conn.release();
  }
};
//실적 코드 생성용 조회
exports.prdr_info = async () => {
  const conn = await getConnection();
  try {
    const result = await conn.query(sqlList.prdr_info, []);
    return { result };
  } finally {
    conn.release();
  }
};
// 작업 진행 목록
exports.production_task = async () => {
  const conn = await getConnection();
  try {
    const result = await conn.query(sqlList.task_all);
    return { result };
  } finally {
    conn.release();
  }
};

// 생산 실적 목록
exports.production_performance = async () => {
  const conn = await getConnection();
  try {
    const result = await conn.query(sqlList.work_performance);
    return { result };
  } finally {
    conn.release();
  }
};

// 사용 가능 설비 목록
exports.availableEquipmentList = async () => {
  const conn = await getConnection();
  try {
    const result = await conn.query(sqlList.availableEquipment);
    return { result };
  } finally {
    conn.release();
  }
};

// 설비 상태 업데이트
exports.availableEquipmentUpdate = async ({ code, stat }) => {
  const conn = await getConnection();
  try {
    const result = await conn.query(sqlList.availableEquipmentUpdate, [
      stat,
      code,
    ]);
    return { result };
  } finally {
    conn.release();
  }
};

// 실적 상태 업데이트
exports.prdrUpdate = async ({ prdr_code, stat }) => {
  const conn = await getConnection();
  try {
    const result = await conn.query(sqlList.prdrUpdate, [stat, prdr_code]);
    return { result };
  } finally {
    conn.release();
  }
};

// 실적 등록
exports.prdrInsert = async ({
  prdr_code,
  note,
  work_order_code,
  emp_code,
  prod_code,
  ord_qtt,
}) => {
  const conn = await getConnection();
  try {
    const result = await conn.query(sqlList.prdrInsert, [
      prdr_code,
      note,
      work_order_code,
      emp_code,
      prod_code,
      ord_qtt,
    ]);
    return { result };
  } finally {
    conn.release();
  }
};

// 작업 종료
exports.prdrEnd = async ({
  prdr_code,
  end_date,
  total_time,
  qtt,
  rate,
  stat,
}) => {
  const conn = await getConnection();
  try {
    const result = await conn.query(sqlList.prdrEnd, [
      end_date,
      total_time,
      qtt,
      rate,
      stat,
      prdr_code,
    ]);
    return { result };
  } finally {
    conn.release();
  }
};

// 공정 진행률 업데이트
exports.updateProcessRate = async ({ rate, start_date, prdr_d_code }) => {
  const conn = await getConnection();
  try {
    const result = await conn.query(sqlList.update_process_rate, [
      rate,
      start_date,
      prdr_d_code,
    ]);
    return { result };
  } finally {
    conn.release();
  }
};

// 공정 완료 처리
exports.updateProcessEnd = async ({ end_date, prdr_d_code }) => {
  const conn = await getConnection();
  try {
    const result = await conn.query(sqlList.update_process_end, [
      end_date,
      prdr_d_code,
    ]);
    return { result };
  } finally {
    conn.release();
  }
};
