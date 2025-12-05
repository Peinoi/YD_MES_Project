const { query, getConnection } = require("../database/mapper.js");
const commonService = require("../services/commonService.js");

// 주문 목록 전체 조회
exports.getOrderList = async (filters) => {
  try {
    const params = [
      filters.ord_code,
      filters.ord_code,
      filters.ord_code,
      filters.ord_name,
      filters.ord_name,
      filters.ord_name,
      filters.ord_date_from,
      filters.ord_date_from,
      filters.ord_date_to,
      filters.ord_date_to,
      filters.client_name,
      filters.client_name,
      filters.client_name,
      filters.ord_amount_from,
      filters.ord_amount_from,
      filters.ord_amount_to,
      filters.ord_amount_to,
      filters.delivery_date_from,
      filters.delivery_date_from,
      filters.delivery_date_to,
      filters.delivery_date_to,
      filters.ord_stat_name,
      filters.ord_stat_name,
      filters.ord_stat_name,
    ];

    const rows = await query("selectOrderList", params);
    if (!rows || !rows.length) return [];

    return rows;
  } catch (err) {
    console.error("[orderService.js || 주문 목록 전체 조회 실패]", err.message);
    throw err;
  }
};

// 주문 모달창 조회
exports.getOrderSearch = async (filters) => {
  try {
    const params = [
      filters.ord_code,
      filters.ord_code,
      filters.ord_code,
      filters.ord_name,
      filters.ord_name,
      filters.ord_name,
      filters.client_name,
      filters.client_name,
      filters.client_name,
    ];

    const rows = await query("selectOrderSearch", params);
    if (!rows || !rows.length) return [];

    return rows;
  } catch (err) {
    console.error("[orderService.js || 주문 모달창 조회 실패]", err.message);
    throw err;
  }
};

// 주문 정보, 제품 정보 조회
exports.getOrderProduction = async (ord_code) => {
  try {
    const rows = await query("selectOrderProduction", ord_code);
    if (!rows || !rows.length) return [];

    for (const order of rows) {
      order.com_value_name = await commonService.getNote("0J", order.com_value);
      // 규격 공통 코드 0O인데 왜 0X에 16 추가되어 있는걸까...
      // 일단 x1일 경우에 예외처리함
      if (order.spec == "x1") {
        order.spec_name = await commonService.getNote("0X", order.spec);
      } else {
        order.spec_name = await commonService.getNote("0O", order.spec);
      }
      order.unit_name = await commonService.getNote("0H", order.unit);
    }

    return rows;
  } catch (err) {
    console.error(
      "[orderService.js || 주문 정보, 제품 정보 조회 실패]",
      err.message
    );
    throw err;
  }
};

// 거래처 목록 전체 조회
exports.getClientList = async () => {
  try {
    const rows = await query("selectClientList");

    return rows;
  } catch (err) {
    console.error(
      "[orderService.js || 거래처 목록 전체 조회 실패]",
      err.message
    );
    throw err;
  }
};

// 상태 목록 전체 조회
exports.getStatList = async () => {
  try {
    const rows = await commonService.getNoteList("0A");

    return rows;
  } catch (err) {
    console.error("[orderService.js || 상태 목록 전체 조회 실패]", err.message);
    throw err;
  }
};

// 영업팀 거래처 담당자 목록 전체 조회
exports.getManagerList = async () => {
  try {
    const rows = await query("selectManagerList");

    return rows;
  } catch (err) {
    console.error(
      "[orderService.js || 영업팀 거래처 담당자 목록 전체 조회 실패]",
      err.message
    );
    throw err;
  }
};

// 주문 삭제
exports.removeOrder = async (ord_code) => {
  const conn = await getConnection();
  try {
    await conn.beginTransaction();

    const res = await query("deleteOrder", ord_code);
    return res;
  } catch (err) {
    console.error("[orderService.js || 주문 삭제 실패]", err.message);
    throw err;
  }
};

// 주문 정보, 상세 정보 저장(등록/수정)
exports.saveOrder = async (payload) => {
  const conn = await getConnection();
  try {
    await conn.beginTransaction();

    const { order, products } = payload;
    let { ord_code, ord_name, ord_date, ord_stat, note, mcode, client_code } =
      order;

    // 1. 주문 코드 및 상태값 준비
    // 필수 값 검증
    if (!ord_name || !ord_date || !ord_stat || !mcode || !client_code) {
      throw new Error(
        "필수 정보(주문명, 주문일자, 주문상태, 담당자 코드, 거래처 코드)가 누락되어 주문 정보를 저장할 수 없습니다."
      );
    }
    ord_stat = ord_stat || "a1"; // 상태값 (없으면 기본값 'a1': 주문전달 사용)

    let new_ord_code = ord_code;

    // 2. 주문 정보 처리: 등록 + 수정
    // 등록(주문번호 없을 때)
    if (!new_ord_code) {
      // 새로운 주문번호 생성 (ORD-YYYYXXXX)
      const currentYear = new Date().getFullYear().toString();
      const codeLength = 4;

      // 최대 주문 코드 조회 및 새 번호 생성
      const oRows = await conn.query("selectMaxOrderCode");
      const oMaxCode = oRows[0]?.max_ord_code || null;
      let oNextCodeNum = 1;

      if (oMaxCode) {
        // 최대 주문 번호에서 마지막 숫자를 추출하여 +1
        const lastNumStr = oMaxCode.slice(-codeLength);
        oNextCodeNum = parseInt(lastNumStr) + 1;
      }

      // 새로운 주문 코드 생성: ORD-YYYY + 순번
      new_ord_code = `ORD-${currentYear}${String(oNextCodeNum).padStart(
        codeLength,
        "0"
      )}`;

      // 최대 주문 상세 코드 조회 및 새 번호 생성
      const dRows = await conn.query("selectMaxOrderDetailCode");
      const dMaxCode = dRows[0]?.max_ord_d_code || null;
      let dNextCodeNum = 1;

      if (dMaxCode) {
        // 최대 주문 상세 번호에서 마지막 숫자를 추출하여 +1
        const lastNumStr = dMaxCode.slice(-codeLength);
        dNextCodeNum = parseInt(lastNumStr) + 1;
      }
      // 새로운 주문 상세 코드 생성: ORD-D- + 순번
      new_ord_d_code = `ORD-D-${String(dNextCodeNum).padStart(
        codeLength,
        "0"
      )}`;

      // 주문 정보 등록 (insertOrder)
      const orderParams = [
        new_ord_code,
        ord_name,
        ord_date,
        ord_stat,
        note,
        mcode,
        client_code,
      ];
      await conn.query("insertOrder", orderParams);

      // 주문 상세 정보 등록 (insertOrderDetail)
      const orderDetailParams = [
        new_ord_d_code,
        unit,
        spec,
        ord_amount,
        prod_price,
        delivery_date,
        ord_priority,
        total_price,
        new_ord_code,
        prod_code,
      ];
      await conn.query("insertOrderDetail", orderDetailParams);
    } else {
      // 3. 수정 모드: UPDATE 및 상세 삭제 처리 (선택 삭제)
      // 주문 기본 정보 수정 (updateOrder)
      const orderParams = [
        ord_name,
        ord_date,
        ord_stat,
        note,
        mcode,
        client_code,
        ord_code,
      ];
      await conn.query("updateOrder", orderParams);

      // **주문 상세 선택 삭제 로직**
      // 기존 상세 정보 ID 목록 조회 (DB에 현재 저장된 목록)
      const realOrdCode = new_ord_code || ord_code;

      const [existingDetails] = await conn.query(
        "SELECT ord_d_code FROM ord_d_tbl WHERE ord_code = ?",
        [realOrdCode]
      );
      const existingDetailCodes = existingDetails.map((d) => d.ord_d_code);

      // ii) 프론트에서 넘어온 상세 ID 목록 (ord_d_code가 있는 항목)
      const + = products
        .map((p) => p.ord_d_code)
        .filter((c) => c);

      // iii) 🗑️ 삭제할 목록 식별: DB에는 있지만, 넘어오지 않은 ID
      const codesToDelete = existingDetailCodes.filter(
        (code) => !incomingDetailCodes.includes(code)
      );

      // iv) 상세 정보 삭제 실행 (ord_d_code 기준으로 DELETE IN 쿼리 동적 생성)
      if (codesToDelete.length > 0) {
        const codesPlaceholder = codesToDelete.map(() => "?").join(",");
        const deleteQuery = `DELETE FROM ord_d_tbl WHERE ord_d_code IN (${codesPlaceholder})`;

        await conn.query(deleteQuery, codesToDelete);
      }
    }

    // **************************************************
    // 3. 주문 상세 정보 (제품 목록) 처리: 신규 등록 및 수정
    // **************************************************

    // 3-1. 주문 상세 코드 (ord_d_code) 자동 생성에 필요한 다음 번호 준비
    const detailCodeLength = 4;
    const detailRows = await conn.query("selectMaxOrderDetailCode");
    let maxOrdDCode = detailRows[0]?.max_ord_d_code || null;
    let nextOrdDNum = 1;

    if (maxOrdDCode) {
      // ORD-D-000X 형태에서 순번 추출
      const lastNumStr = maxOrdDCode.slice(-detailCodeLength);
      nextOrdDNum = parseInt(lastNumStr) + 1;
    }

    for (const p of products) {
      // 수량 0 또는 제품 코드가 없는 행은 건너뜀 (필수 항목으로 가정)
      if (Number(p.ord_amount) === 0 || !p.prod_code) continue;

      const prod_code = p.prod_code; // 프론트에서 받은 제품 코드를 사용
      const total_price =
        (Number(p.ord_amount) || 0) * (Number(p.prod_price) || 0);

      if (p.ord_d_code) {
        // 3-2. 🔄 기존 제품 수정 (updateOrderDetail)
        const updateParams = [
          p.unit,
          p.spec,
          p.ord_amount,
          p.prod_price,
          p.delivery_date,
          p.ord_priority,
          total_price,
          prod_code,
          p.ord_d_code, // WHERE 조건
        ];
        await conn.query("updateOrderDetail", updateParams);
      } else {
        // 3-3. ✨ 신규 제품 등록 (insertOrderDetail)

        // 새로운 상세 코드 생성: ORD-D- + 순번
        const nextOrdDNumStr = String(nextOrdDNum++).padStart(
          detailCodeLength,
          "0"
        );
        const ord_d_code = `ORD-D-${nextOrdDNumStr}`;

        const insertParams = [
          ord_d_code,
          p.unit,
          p.spec,
          p.ord_amount,
          p.prod_price,
          p.delivery_date,
          p.ord_priority,
          total_price,
          new_ord_code, // 메인 주문 코드
          prod_code,
        ];

        await conn.query("insertOrderDetail", insertParams);
      }
    }

    // 트랜잭션 커밋
    await conn.commit();
    return { ord_code: new_ord_code };
  } catch (err) {
    // 오류 발생 시 롤백
    await conn.rollback();
    // 콘솔 에러 메시지 수정
    console.error("[orderService.js || 주문 정보 저장 실패]", err.message);
    throw err;
  } finally {
    conn.release();
  }
};
