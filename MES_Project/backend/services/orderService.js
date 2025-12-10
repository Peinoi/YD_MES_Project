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

// 거래처 모달창 조회
exports.getClientSearch = async (filters) => {
  try {
    const params = [
      filters.client_code,
      filters.client_code,
      filters.client_code,
      filters.client_name,
      filters.client_name,
      filters.client_name,
    ];

    const rows = await query("selectClientSearch", params);
    if (!rows || !rows.length) return [];

    for (const c of rows) {
      c.client_type_name = await commonService.getNote("0L", c.client_type);
    }

    return rows;
  } catch (err) {
    console.error("[orderService.js || 거래처 모달창 조회 실패]", err.message);
    throw err;
  }
};

// 거래처 담당자 모달창 조회
exports.getManagerSearch = async (filters) => {
  try {
    const params = [
      filters.emp_code,
      filters.emp_code,
      filters.emp_code,
      filters.emp_name,
      filters.emp_name,
      filters.emp_name,
    ];

    const rows = await query("selectManagerSearch", params);
    if (!rows || !rows.length) return [];

    return rows;
  } catch (err) {
    console.error(
      "[orderService.js || 거래처 담당자 모달창 조회 실패]",
      err.message
    );
    throw err;
  }
};

// 상품 모달창 조회
exports.getProductSearch = async (filters) => {
  try {
    const params = [
      filters.prod_code,
      filters.prod_code,
      filters.prod_code,
      filters.prod_name,
      filters.prod_name,
      filters.prod_name,
      filters.com_value_name,
      filters.com_value_name,
      filters.com_value_name,
    ];

    const rows = await query("selectProductSearch", params);
    if (!rows || !rows.length) return [];

    for (const prod of rows) {
      prod.unit_name = await commonService.getNote("0H", prod.unit);
      if (prod.spec.startsWith("x")) {
        prod.spec_name = await commonService.getNote("0X", prod.spec);
      } else if (prod.spec.startsWith("z")) {
        prod.spec_name = await commonService.getNote("0Z", prod.spec);
      } else {
        prod.spec_name = await commonService.getNote("0O", prod.spec);
      }
    }

    return rows;
  } catch (err) {
    console.error("[orderService.js || 상품 모달창 조회 실패]", err.message);
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
      if (order.spec.startsWith("x")) {
        order.spec_name = await commonService.getNote("0X", order.spec);
      } else if (order.spec.startsWith("z")) {
        order.spec_name = await commonService.getNote("0Z", order.spec);
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

    // 1. 주문 상세 정보 삭제
    await query("deleteOrderDetail", ord_code);

    // 2. 주문 정보 삭제
    await query("deleteOrder", ord_code);

    await conn.commit();

    return { ord_code: ord_code };
  } catch (err) {
    await conn.rollback();
    console.error("[orderService.js || 주문 삭제 실패]", err.message);
    throw err;
  } finally {
    conn.release();
  }
};

// 주문 정보, 상세 정보 저장(등록/수정)
exports.saveOrder = async (payload) => {
  const conn = await getConnection();
  try {
    await conn.beginTransaction();

    const { order, orderDetailList } = payload;
    let { ord_code, ord_name, ord_date, ord_stat, note, mcode, client_code } =
      order;

    // ------------------------------
    // 1. 주문 필수 값 검증
    // ------------------------------
    if (!ord_name || !ord_date || !ord_stat || !mcode || !client_code) {
      throw new Error("필수 주문 정보 누락");
    }

    ord_stat = ord_stat || "a1";

    let new_ord_code = ord_code;

    // ------------------------------
    // 2. 주문 등록 OR 수정
    // ------------------------------
    if (!new_ord_code) {
      // 신규 주문번호 생성
      const currentYear = new Date().getFullYear().toString();
      const codeLength = 4;

      const oRows = await query("selectMaxOrderCode");
      const oMaxCode = oRows[0]?.max_ord_code || null;

      let nextNum = 1;
      if (oMaxCode) nextNum = parseInt(oMaxCode.slice(-codeLength)) + 1;

      new_ord_code = `ORD-${currentYear}${String(nextNum).padStart(
        codeLength,
        "0"
      )}`;

      // 주문 INSERT
      await query("insertOrder", [
        new_ord_code,
        ord_name,
        ord_date,
        ord_stat,
        note,
        mcode,
        client_code,
      ]);
    } else {
      // 주문 UPDATE
      await query("updateOrder", [
        ord_name,
        ord_date,
        ord_stat,
        note,
        mcode,
        client_code,
        new_ord_code,
      ]);
    }

    // ------------------------------
    // 3-1. 선택 삭제된 제품 삭제
    // ------------------------------
    if (payload.removedProductIds && payload.removedProductIds.length > 0) {
      for (const delId of payload.removedProductIds) {
        await query("deleteProduct", [delId]);
      }
    }

    // ------------------------------
    // 3-2. 주문 상세 다중 저장 처리
    // ------------------------------
    for (const d of orderDetailList) {
      let {
        ord_d_code,
        unit,
        spec,
        ord_amount,
        prod_price,
        delivery_date,
        ord_priority,
        total_price,
        prod_code,
      } = d;

      // 상세 필수값 체크
      if (
        !unit ||
        !ord_amount ||
        !prod_price ||
        !delivery_date ||
        !total_price ||
        !prod_code
      ) {
        throw new Error("상세 정보 누락");
      }

      // 신규 상세등록
      if (!ord_d_code) {
        const dRows = await query("selectMaxOrderDetailCode");
        const dMaxCode = dRows[0]?.max_ord_d_code || null;

        let nextNum = 1;
        if (dMaxCode) nextNum = parseInt(dMaxCode.slice(-4)) + 1;

        ord_d_code = `ORD-D-${String(nextNum).padStart(4, "0")}`;

        await query("insertOrderDetail", [
          ord_d_code,
          unit,
          spec,
          ord_amount,
          prod_price,
          delivery_date,
          ord_priority,
          total_price,
          new_ord_code,
          prod_code,
        ]);
      } else {
        // 수정 상세
        await query("updateOrderDetail", [
          unit,
          spec,
          ord_amount,
          prod_price,
          delivery_date,
          ord_priority,
          total_price,
          prod_code,
          ord_d_code,
        ]);
      }
    }

    // ------------------------------
    // 4. 커밋
    // ------------------------------
    await conn.commit();

    return { ord_code: new_ord_code };
  } catch (err) {
    await conn.rollback();
    console.error("[orderService.js || 주문 정보 저장 실패]", err);
    throw err;
  } finally {
    conn.release();
  }
};

// 주문 단건 조회
exports.getOrder = async (ordCode) => {
  try {
    const rows = await query("selectOrder", ordCode);
    if (!rows || !rows.length) return [];

    for (const order of rows) {
      // 규격 공통 코드 0O인데 왜 0X에 16 추가되어 있는걸까...
      // 일단 x1일 경우에 예외처리함
      order.com_value_name = await commonService.getNote("0J", order.com_value);
      if (order.spec.startsWith("x")) {
        order.spec_name = await commonService.getNote("0X", order.spec);
      } else if (order.spec.startsWith("z")) {
        order.spec_name = await commonService.getNote("0Z", order.spec);
      } else {
        order.spec_name = await commonService.getNote("0O", order.spec);
      }
      order.unit_name = await commonService.getNote("0H", order.unit);
    }

    return rows;
  } catch (err) {
    console.error("[orderService.js || 주문 단건 조회 실패]", err.message);
    throw err;
  }
};

// 신규 주문번호, 주문상세번호 생성
exports.addCode = async () => {
  try {
    // 신규 주문번호 생성
    const currentYear = new Date().getFullYear().toString(); // 현재 연도(YYYY)
    const codeLength = 4; // 주문번호 끝자리 숫자 길이

    // DB에서 기존 주문번호 중 최대값 조회
    const oRows = await query("selectMaxOrderCode");
    const oMaxCode = oRows[0]?.max_ord_code || null; // 최대 주문번호 없으면 null

    // 신규 주문번호 끝자리 숫자 계산
    let oNextNum = 1; // 기본값: 1
    if (oMaxCode) oNextNum = parseInt(oMaxCode.slice(-codeLength)) + 1; // 기존 최대값 +1

    // 신규 주문번호 포맷: ORD-YYYY0001
    new_ord_code = `ORD-${currentYear}${String(oNextNum).padStart(
      codeLength,
      "0"
    )}`;

    // 신규 주문상세번호 생성
    const dRows = await query("selectMaxOrderDetailCode");
    const dMaxCode = dRows[0]?.max_ord_d_code || null; // 최대 주문상세번호 없으면 null

    // 신규 주문상세번호 끝자리 숫자 계산
    let dNextNum = 1; // 기본값: 1
    if (dMaxCode) dNextNum = parseInt(dMaxCode.slice(-4)) + 1; // 기존 최대값 +1

    // 신규 주문상세번호 포맷: ORD-D-0001
    new_ord_d_code = `ORD-D-${String(dNextNum).padStart(4, "0")}`;

    return { new_ord_code, new_ord_d_code };
  } catch (err) {
    await conn.rollback();
    console.error(
      "[orderService.js || 신규 주문번호, 주문상세번호 생성 실패]",
      err
    );
    throw err;
  }
};
