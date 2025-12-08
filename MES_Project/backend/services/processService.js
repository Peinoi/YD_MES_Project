const { getConnection, query } = require("../database/mapper.js");

// 바인딩 값 변환 로직 내부 함수
const createProcessFlowBindingValues = (params) => {
  // Vue에서 받은 검색 조건 객체의 값을 추출 값이 없으면 null
  const pc = params.processCode || null;
  const pn = params.processName || null;
  const ic = params.itemCode || null;
  const iname = params.itemName || null;
  const rDate = params.regDate || null;
  // SQl 템플릿의 ? 순서에 맞춰 값을 나열
  const values = [
    pc,
    pc,
    pc,
    pn,
    pn,
    pn,
    ic,
    ic,
    ic,
    iname,
    iname,
    iname,
    rDate,
    rDate,
  ];
  return values;
};

// 바인딩 값 변환 로직 내부 함수
const createListFlowBindingValues = (params) => {
  // Vue에서 받은 검색 조건 객체의 값을 추출 값이 없으면 null
  const pc = params.lineCode || null;
  // SQl 템플릿의 ? 순서에 맞춰 값을 나열
  const values = [pc, pc];
  return values;
};

// 공정 흐름도 목록 가져오기
exports.getProcessFlowList = async (searchParams) => {
  const sqlAlias = "getProcessFlowList";
  const values = createProcessFlowBindingValues(searchParams);

  try {
    const rows = await query(sqlAlias, values);
    return rows;
  } catch (err) {
    console.error("processService.js공정흐름도오류", err.message);
    throw err;
  }
};

// 흐름도 상세 공정 가져오기
exports.getSubProcessList = async (processCode) => {
  const sqlAlias = "getSubProcessList";
  const values = [processCode];

  try {
    const rows = await query(sqlAlias, values);
    return rows;
  } catch (err) {
    console.error("processService.js흐름도상세오류", err.message);
    throw err;
  }
};

// 공정 코드 상세 정보
exports.getSubProcessCode = async (poCode) => {
  const sqlAlias = "getSubProcessCode";
  const values = [poCode];

  try {
    const rows = await query(sqlAlias, values);
    return rows;
  } catch (err) {
    console.error("processService.js공정코드 상세 오류", err.message);
    throw err;
  }
};

// 라인 흐름도 목록 가져오기
exports.getLineFlowList = async (searchParams) => {
  const sqlAlias = "getLineFlowList";
  const values = createListFlowBindingValues(searchParams);

  try {
    const rows = await query(sqlAlias, values);
    return rows;
  } catch (err) {
    console.error("processService.js 라인흐름도 오류", err.message);
    throw err;
  }
};

// 라인 상세 공정 가져오기
exports.getLineDetailList = async (lineCode) => {
  const sqlAlias = "getLineDetailList";
  const values = [lineCode];

  try {
    const rows = await query(sqlAlias, values);
    return rows;
  } catch (err) {
    console.error("processService.js 라인 상세정보 오류", err.message);
    throw err;
  }
};
