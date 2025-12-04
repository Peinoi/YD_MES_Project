const { getConnection, query } = require("../database/mapper.js");

// 바인딩 값 변환 로직 내부 함수
const createProcessFlowBindingValues = (params) => {
  // Vue에서 받은 검색 조건 객체의 값을 추출 값이 없으면 null
  const pc = params.processCode || null;
  const pn = params.processName || null;
  const ic = params.itemCode || null;
  const iname = params.itemName || null;
  const sDate = params.startDate || null;
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
    sDate,
    sDate,
  ];
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
    console.error("processService.js오류", err.message);
    throw err;
  }
};
