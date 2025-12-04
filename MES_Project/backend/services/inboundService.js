const pool = require("../database/db");
const sqls = require("../database/sql/inboundSql");

// ID 생성 헬퍼 함수 (예: 001, 002...)
const generateSeq = (lastCode, prefixLength) => {
  if (!lastCode) return 1;
  const lastSeq = parseInt(lastCode.slice(-3)); // 뒤 3자리 추출
  return lastSeq + 1;
};

// 날짜 포맷 헬퍼 (YYYYMMDD)
const getTodayStr = () => {
  const d = new Date();
  return d.toISOString().slice(0, 10).replace(/-/g, "");
};

const registerInboundItems = async (items) => {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction(); // 트랜잭션 시작

    const todayStr = getTodayStr(); // 20250704

    // 1. 현재 DB의 마지막 시퀀스 번호 조회
    const [lastMinRows] = await conn.query(sqls.getLastMinbndSeq);
    const [lastLotRows] = await conn.query(sqls.getLastLotSeq);

    let minSeq = generateSeq(lastMinRows ? lastMinRows.minbnd_code : null);
    let lotSeq = generateSeq(lastLotRows ? lastLotRows.lot_num : null);

    // 2. 데이터 가공 (배열 -> 이중 배열)
    const lotDataList = [];
    const inboundDataList = [];

    for (const item of items) {
      // 2-1. ID 생성
      const seqStr = String(minSeq++).padStart(3, "0");
      const lotSeqStr = String(lotSeq++).padStart(3, "0");

      const newMinbndCode = `MIN-${todayStr}-${seqStr}`;
      // 자재유형코드(item_type)가 없으면 '100' 기본값 처리 (DDL 예시 기준)
      const matTypePrefix = item.mat_type_code || "100";
      const newLotNum = `LOT-${matTypePrefix}-${todayStr}-${lotSeqStr}`;

      // 2-2. LOT 테이블 데이터 준비
      lotDataList.push([
        newLotNum,
        new Date(), // issdate
        "i4", // item_type_code (i4: 원자재 - DDL common_code 참조)
        item.matCode, // mat_code
      ]);

      // 2-3. 입고 테이블 데이터 준비
      // ★ 중요: qio_code(수입검사코드)는 DDL상 NOT NULL입니다.
      // 프론트에서 넘어오지 않았다면 더미 데이터를 넣거나 에러를 뱉어야 합니다.
      // 여기서는 프론트에서 qioCode를 보냈다고 가정하거나, 없다면 임시값을 넣습니다.
      const qioCode = item.qioCode || "QIO-DEFAULT-TEMP";

      inboundDataList.push([
        newMinbndCode,
        item.matCode,
        "i4", // mat_type (원자재)
        item.unit,
        Number(item.inQty), // inbnd_qtt
        item.inboundDate, // inbnd_date
        Number(item.inQty), // ord_qtt (발주수량=입고수량 가정)
        qioCode, // qio_code (FK Check 주의)
        newLotNum, // lot_num (방금 만든 LOT 번호 연결)
        item.client, // mat_sup
        item.manager, // mcode
      ]);
    }

    // 3. 쿼리 실행 (순서 중요: LOT -> Inbound)
    if (lotDataList.length > 0) {
      await conn.query(sqls.insertMatLot, [lotDataList]);
    }

    if (inboundDataList.length > 0) {
      await conn.query(sqls.insertMinbnd, [inboundDataList]);
    }

    await conn.commit(); // 커밋

    return {
      success: true,
      message: `${inboundDataList.length}건 입고 및 LOT 발행 완료`,
      details: {
        inboundCodes: inboundDataList.map((v) => v[0]),
        lotNumbers: lotDataList.map((v) => v[0]),
      },
    };
  } catch (err) {
    if (conn) await conn.rollback(); // 에러 시 롤백
    console.error("Inbound Transaction Error:", err);
    throw new Error(`입고 등록 실패: ${err.message}`);
  } finally {
    if (conn) conn.release(); // 연결 반환
  }
};

module.exports = { registerInboundItems };
