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
      data.note,
      data.qir_emp_code,
    ];
    const result = await query('QC_RESULT_SAVE', params);

    if (result.affectedRows == 0) {
      throw new Error('저장된 데이터가 없습니다.');
    }

    return { ok: true, affectedRows: result.affectedRows };
  } catch (err) {
    throw err;
  }
}

async function deleteResultService(params) {
  const conn = await getConnection();
  try {
    await conn.beginTransaction();

    const result = await conn.query(qcSql.QC_RESULT_DELETE, [params.qir_code]);

    if (result.affectedRows == 0) {
      throw new Error('삭제할 데이터가 없습니다.');
    }

    await conn.commit();
    return { ok: true, affectedRows: result.affectedRows };
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
