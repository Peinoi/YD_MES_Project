const { query, getConnection } = require('../database/mapper.js');
const qcSql = require('../database/sqls/qc/qcSQL');

// 004 목록 조회
async function findQcrList(params) {
  try {
    return await query('QCR_CODE_LIST');
  } catch (err) {
    throw err;
  }
}

async function findQcListService(params) {
  try {
    return await query('QC_SEARCH', params);
  } catch (err) {
    throw err;
  }
}

// 005 검사결과 불러오기
async function pendingListService() {
  try {
    return await query('QC_PENDING_LIST');
  } catch (err) {
    throw err;
  }
}

// 005 검사지시 불러오기
async function findInstructionService(params) {
  try {
    const result = await query('QC_INSTRUCTION', [params.qir_code]);
    return result;
  } catch (err) {
    throw err;
  }
}

// 005 저장
async function saveResultService(data) {
  try {
    const params = [
      data.qir_code,
      data.start_date,
      data.end_date,
      data.result,
      data.qir_emp_code,
    ];
    return await query('QC_RESULT_SAVE', params);
  } catch (err) {
    throw err;
  }
}

async function deleteResultService(params) {
  const conn = await getConnection();
  try {
    await conn.beginTransaction();

    const result = await conn.query(qcSql.QC_RESULT_DELETE, [params.qir_code]);

    await conn.commit();
    return { ok: true };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    await conn.release();
  }
}

module.exports = {
  findQcrList,
  findQcListService,
  pendingListService,
  findInstructionService,
  saveResultService,
  deleteResultService,
};
