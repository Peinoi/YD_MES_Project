// Mapper 모듈에서 DB연결 및 sql쿼리문 실행
const { getConnection, query } = require("../database/mapper.js");

// getConnection: 트랜잭션을 위한 커넥션
// 트랜잭션: 전부 다 실행되거나, 아니면 전부 다 취소되거나 INSERT, UPDATE, DELETE
// 예) A계좌에서 10만원을 출금한다 B계좌에 10만원을 송금한다
// 두 가지 작업은 동시에 성공해야 한다
// 전자가 성공했는데 후자가 실패하면 A계좌에서 돈은 빠져나갔는데
// B계좌에 입금되지 않는 심각한 문제가 발생
// 트랜잭션 시작 A에서 빼기 -> 성공시 커밋하여 반영 실패시 롤백 전부 취소
// Atomicity(원자성): 모든 작업은 하나의 단위로 간주 됨, 모두 성공 혹은 모두 실패
// Consistency(일관성): 트랜잭션이 완료되면 DB는 항상 정의된 규칙을 만족하는 상태
// Isolation(격리성): 여러 트랜잭션이 동시에 실행될 때, 각각 혼자 실행되는 것 처럼
// Durability(지속성): 트랜잭션이 성공적으로 커밋된 후에는 영구적으로 저장되어야 함

// 바인딩 값 변환 로직 내부 함수
// Value Binding: sql 쿼리문에 직접 데이터를 넣지 않고 placeholder를 사용하여
// 데이터를 분리후, 실행 직전에 이 위치에 데이터를 묶어주는 과정
// placeholder는 보통 ? 사용
// 보안과 성능 때문에 사용 직접 문자열
// SELECT * FROM 테이블 WHERE 컬럼명 = '' OR 1=1; 하면 모든 정보가 다 보인다
// 값 바인딩을 사용하면 ? 를 sql명령어의 일부로 보지 않고 데이터로만 취급

// 라우터에서 받은 검색 객체 searchParmas
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
  // 실행할 sql이 sqlList.js에 어떤 이름으로 저장되어 있는지
  const sqlAlias = "getProcessFlowList";
  // 필요한 데이터를 배열로 준비
  const values = createProcessFlowBindingValues(searchParams);

  try {
    // sql실행문과 값 배열을 들고 query에게 함수를 실행해달라고 위임
    // router에서 클라이언트 요청을 받았지만, DB조회라는 복잡한
    // 비즈니스 책임을 서비스 계층에 위임 -> 다시 mapper.js에 넘김
    const rows = await query(sqlAlias, values);

    // 결과를 rows에 돌려줌
    return rows;
  } catch (err) {
    // 만약 에러가 발생하면 로그를 남기고
    console.error("processService.js공정흐름도오류", err.message);
    // 다시 상위 라우터로 던져서 클라이언트에게 오류 응답이 전달
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
exports.getSubProcessCode = async () => {
  const sqlAlias = "getSubProcessCode";
  const values = [];

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

// 전체 제품코드명 가져오기
exports.getItemList = async () => {
  const sqlAlias = "getItemList";
  const values = [];

  try {
    const rows = await query(sqlAlias, values);
    return rows;
  } catch (err) {
    console.error("processService.js 제품코드명 오류", err.message);
    throw err;
  }
};

// 공정 흐름도 헤더 등록과 상세 공정 여러 건 등록
exports.createProcessFlow = async (headerData, subProcessData) => {
  // 커넥션 가져오기 getConnection
  const connection = await getConnection();

  // 트랜잭션 시작 beginTransaction() 트랜잭션 시작 명령어
  await connection.beginTransaction();

  try {
    // 첫 번째 작업: 흐름도 정보 등록
    const headerSqlAlias = "insertProcessHeader";
    // 입력할 필드명
    const headerValues = [
      headerData.processCode,
      headerData.processName,
      headerData.itemCode,
      headerData.remark,
    ];
    // query대신 getConnection 커넥션을 사용해 쿼리 실행
    await connection.query(headerSqlAlias, headerValues);

    // 두 번째 작업: 상세 공정 정보 등록
    const detailSqlAlias = "insertProcessDetail";

    for (const detail of subProcessData) {
      // 실제 상세 공정 값
      const detailValues = [
        headerData.processCode,
        detail.poNumber,
        detail.poCode,
        detail.machine,
        null,
      ];
      await connection.query(detailSqlAlias, detailValues);
    }
    // 모든 작업 성공 시 커밋
    await connection.commit();
    // 커넥션 해제
    connection.release();
    return { success: true, message: "공정 흐름도 등록 및 상세 등록 성공" };
  } catch (err) {
    // 작업 중 실패 시 롤백
    await connection.rollback();
    // 커넥션 해제
    connection.release();
    console.error("공정 흐름도 등록 트랜잭션 오류", err.message);
    throw err;
  }
};
