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
    const result = await query('QC_SEARCH', params);
    return result;
  } catch (err) {
    throw err;
  }
}

// 005 검사지시 불러오기
async function pendingListService() {
  try {
    return await query('QC_QIO_NULL_LIST');
  } catch (err) {
    throw err;
  }
}

// 005 QirList 불러오기
async function findQirList(params) {
  try {
    const result = await query('QC_QIR_LIST', [params.qio_code]);
    return result;
  } catch (err) {
    throw err;
  }
}

// 005 저장
async function saveResultService(list) {
  let isFail = false; // g1 존재 여부
  let qioCode = list[0].qio_code;
  let inspVol = list[0].insp_vol;
  let isPrdr = list[0].prdr_code !== null; // PRDR 검사 여부 체크
  console.log(list[0].prdr_code);
  // 1) QIR 개별 저장
  for (const item of list) {
    // g1 존재 여부 기록
    if (item.result === 'g1') {
      isFail = true;
    }

    if (item.type === 'mpr') {
      const params = [
        item.start_date,
        item.end_date,
        item.result,
        item.note,
        item.qir_emp_code,
        item.qir_code,
      ];
      await query('QC_RESULT_SAVE_MPR_D', params);
      continue;
    }

    // prdr (제품)
    const params = [
      item.qir_code,
      item.start_date,
      item.end_date,
      item.result,
      item.note,
      item.qir_emp_code,
    ];

    await query('QC_RESULT_SAVE', params);
  }

  // 2) 저장 완료 후 QIO의 pass/unpass 업데이트
  if (isFail) {
    // 불합격 → unpass_qtt 업데이트
    await query('QC_UNPASS_QTT', [inspVol, qioCode]);
  } else {
    // 합격 → pass_qtt 업데이트
    await query('QC_PASS_QTT', [inspVol, qioCode]);

    // PRDR이면 완제품 입고 프로시저 실행
    if (!isPrdr) {
      const params = [
        list[0].qir_code,
        list[0].start_date,
        list[0].end_date,
        'g2',
        list[0].note,
        list[0].qir_emp_code,
      ];
      await query(qcSql.QC_RESULT_SAVE, params);
    }
  }

  return { ok: true };
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
  findQirList,
  saveResultService,
  deleteResultService,
};
