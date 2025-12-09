// MES_Project/backend/database/sqls/release/fwdSQL.js

/* ===========================
 *  주문 목록 조회 (모달)
 *  - 미출고수량(전체 주문수량 - 이미 출고요청된 수량)이 0 이하인 주문은 제외
 * =========================== */
const SELECT_ORDER_LIST = `
  SELECT
      o.ord_code                           AS orderNo,
      DATE_FORMAT(o.ord_date, '%Y-%m-%d')  AS orderDate,
      o.ord_name                           AS orderName,
      c.client_name                        AS client,
      MIN(od.delivery_date)                AS dueDate,
      MIN(od.ord_priority)                 AS priority,

      /* 전체 주문수량 */
      SUM(od.ord_amount)                   AS totalOrderQty,

      /* 이미 출고요청된 수량 (out_req 기준) */
      COALESCE(rel.totalReleaseQty, 0)     AS totalReleaseQty,

      /* 남은 미출고 수량 */
      (SUM(od.ord_amount) - COALESCE(rel.totalReleaseQty, 0)) AS remainingQty
  FROM ord_tbl o
  JOIN client_tbl c
    ON o.client_code = c.client_code
  LEFT JOIN ord_d_tbl od
    ON o.ord_code = od.ord_code

  /* 🔹 이 주문에 대해 지금까지 출고요청된 수량 합계 */
  LEFT JOIN (
    SELECT
      r.ord_code,
      SUM(d.out_req_d_amount) AS totalReleaseQty
    FROM out_req_d_tbl d
    JOIN out_req_tbl r
      ON r.out_req_code = d.out_req_code
    GROUP BY r.ord_code
  ) rel
    ON rel.ord_code = o.ord_code

  WHERE 
      (o.ord_code   LIKE ?
       OR o.ord_name   LIKE ?
       OR c.client_name LIKE ?)

  GROUP BY
      o.ord_code,
      o.ord_date,
      o.ord_name,
      c.client_name

  /* 🔹 남은 수량이 0 이하인 주문은 목록에서 제외 */
  HAVING
      remainingQty > 0

  ORDER BY
      o.ord_date DESC,
      o.ord_code DESC
`;

/* ===========================
 *  출고요청 목록 (모달) - 전체
 * =========================== */
const SELECT_RELEASE_LIST_ALL = `
  SELECT
    orq.out_req_code                          AS releaseCode,
    DATE_FORMAT(orq.out_req_date, '%Y-%m-%d') AS releaseDate,
    orq.ord_code                              AS orderCode,
    c.client_name                             AS client,

    odtot.totalOrderQty                       AS orderQty,

    /* 총 요청수량 */
    SUM(ord.out_req_d_amount)                 AS totalQty,

    /* 총 실출고수량 */
    COALESCE(SUM(ship.shipped_qty), 0)        AS shippedQty,

    /* 요청 잔량 */
    GREATEST(
      0,
      SUM(ord.out_req_d_amount) - COALESCE(SUM(ship.shipped_qty), 0)
    )                                         AS remainingQty,

    CASE
      WHEN COALESCE(SUM(ship.shipped_qty), 0) <= 0
        THEN '요청'
      WHEN COALESCE(SUM(ship.shipped_qty), 0) < SUM(ord.out_req_d_amount)
        THEN '부분 출고'
      ELSE '출고완료'
    END                                       AS status,

    CASE
      WHEN COALESCE(SUM(ship.shipped_qty), 0) <= 0
        THEN 'q1'
      WHEN COALESCE(SUM(ship.shipped_qty), 0) < SUM(ord.out_req_d_amount)
        THEN 'q2'
      ELSE 'q3'
    END                                       AS statusCode
  FROM out_req_tbl orq
  LEFT JOIN client_tbl c
    ON c.client_code = orq.client_code
  LEFT JOIN out_req_d_tbl ord
    ON ord.out_req_code = orq.out_req_code
  LEFT JOIN (
    SELECT
      od.ord_code,
      SUM(od.ord_amount) AS totalOrderQty
    FROM ord_d_tbl od
    GROUP BY od.ord_code
  ) odtot
    ON odtot.ord_code = orq.ord_code
  LEFT JOIN (
    SELECT
      outbound_request_code,
      prod_code,
      SUM(outbnd_qtt) AS shipped_qty
    FROM poutbnd_tbl
    GROUP BY outbound_request_code, prod_code
  ) ship
    ON ship.outbound_request_code = ord.out_req_code
   AND ship.prod_code              = ord.prod_code

  /*WHERE*/
  GROUP BY
    orq.out_req_code,
    orq.out_req_date,
    orq.ord_code,
    c.client_name,
    odtot.totalOrderQty,
    rel.totalReleaseQty

  -- 🔹 전체 표시 (HAVING 없음)
  ORDER BY
    releaseDate DESC,
    releaseCode DESC
`;

/* ===========================
 *  주문 상세 헤더
 *   - 프론트에서 기대하는 필드:
 *     orderNo, orderDate, client, dueDate, status, priority
 * =========================== */
const SELECT_ORDER_HEADER = `
  SELECT
    o.ord_code                         AS orderNo,
    DATE_FORMAT(o.ord_date, '%Y-%m-%d') AS orderDate,
    c.client_name                      AS client,
    MIN(od.delivery_date)              AS dueDate,
    o.ord_stat                         AS status,
    MIN(od.ord_priority)               AS priority
  FROM ord_tbl o
  LEFT JOIN client_tbl c
    ON c.client_code = o.client_code
  LEFT JOIN ord_d_tbl od
    ON od.ord_code = o.ord_code
  WHERE o.ord_code = ?
  GROUP BY
    o.ord_code,
    o.ord_date,
    c.client_name,
    o.ord_stat
`;

/* ===========================
 *  주문 상세 아이템
 *   - 프론트에서 기대하는 필드:
 *     productCode, productName, type, spec, unit,
 *     orderQty, stockQty/currentStock, notReleasedQty, dueDate
 * =========================== */
const SELECT_ORDER_ITEMS = `
  SELECT
    od.prod_code                                AS productCode,
    p.prod_name                                 AS productName,
    p.com_value                                 AS type,
    od.spec                                     AS spec,
    od.unit                                     AS unit,
    od.ord_amount                               AS orderQty,

    /* 재고 (입고 - 출고) */
    COALESCE(stock.stock_qty, 0)                AS stockQty,
    COALESCE(stock.stock_qty, 0)                AS currentStock,

    /* 미출고 수량 = 주문수량 - 요청수량 */
    (od.ord_amount - COALESCE(rel.release_qty, 0)) AS notReleasedQty,

    od.delivery_date                            AS dueDate
  FROM ord_d_tbl od
  JOIN prod_tbl p
    ON p.prod_code = od.prod_code

  /* 재고 계산: pinbnd_tbl - poutbnd_tbl */
  LEFT JOIN (
    SELECT
      i.prod_code,
      (i.in_qty - COALESCE(o.out_qty, 0)) AS stock_qty
    FROM (
      SELECT prod_code, SUM(qtt) AS in_qty
      FROM pinbnd_tbl
      GROUP BY prod_code
    ) i
    LEFT JOIN (
      SELECT prod_code, SUM(outbnd_qtt) AS out_qty
      FROM poutbnd_tbl
      GROUP BY prod_code
    ) o
      ON o.prod_code = i.prod_code
  ) stock
    ON stock.prod_code = od.prod_code

  /* 이미 요청된 출고요청 수량 (출고요청 기준) */
  LEFT JOIN (
  SELECT
    d.prod_code,
    r.ord_code,
    SUM(d.out_req_d_amount) AS release_qty   -- 출고요청수량 합
  FROM out_req_d_tbl d
  JOIN out_req_tbl r
    ON r.out_req_code = d.out_req_code
  GROUP BY d.prod_code, r.ord_code
) rel
  ON rel.prod_code = od.prod_code
 AND rel.ord_code = od.ord_code

  WHERE od.ord_code = ?
  ORDER BY od.ord_d_code
`;

/* ===========================
 *  출고요청 목록 (출고 불러오기 모달)
 *  - 기준: 출고요청 수량 vs 실출고 수량
 *  - 남은 요청수량(remainingQty) > 0 인 것만 노출
 *  프론트 컬럼 예:
 *   - releaseCode, releaseDate, orderCode, client,
 *     orderQty, totalQty(요청합), shippedQty, remainingQty,
 *     status, statusCode
 * =========================== */
const SELECT_RELEASE_LIST = `
  SELECT
    orq.out_req_code                          AS releaseCode,
    DATE_FORMAT(orq.out_req_date, '%Y-%m-%d') AS releaseDate,
    orq.ord_code                              AS orderCode,
    c.client_name                             AS client,

    /* 주문 전체 수량 (참고용) */
    odtot.totalOrderQty                       AS orderQty,

    /* 이 출고요청의 총 "요청수량" (out_req_d_tbl 합계) */
    SUM(ord.out_req_d_amount)                 AS totalQty,

    /* 이 출고요청의 총 "실출고수량" (poutbnd_tbl 기준) */
    COALESCE(SUM(ship.shipped_qty), 0)        AS shippedQty,

    /* 요청 잔량 = 요청수량 - 실출고수량 */
    GREATEST(
      0,
      SUM(ord.out_req_d_amount) - COALESCE(SUM(ship.shipped_qty), 0)
    )                                         AS remainingQty,

    /* 상태(문자) */
    CASE
      WHEN COALESCE(SUM(ship.shipped_qty), 0) <= 0
        THEN '요청'        -- 아직 실출고 0
      WHEN COALESCE(SUM(ship.shipped_qty), 0) < SUM(ord.out_req_d_amount)
        THEN '부분 출고'   -- 일부만 실출고
      ELSE '출고완료'      -- 전부 실출고
    END                                       AS status,

    /* 상태 코드 (0Q 그룹) - 필요하면 사용 */
    CASE
      WHEN COALESCE(SUM(ship.shipped_qty), 0) <= 0
        THEN 'q1'          -- 출고 대기
      WHEN COALESCE(SUM(ship.shipped_qty), 0) < SUM(ord.out_req_d_amount)
        THEN 'q2'          -- 부분 출고
      ELSE 'q3'            -- 출고 완료
    END                                       AS statusCode
  FROM out_req_tbl orq
  LEFT JOIN client_tbl c
    ON c.client_code = orq.client_code

  /* 이 출고요청(헤더)의 요청 라인 */
  LEFT JOIN out_req_d_tbl ord
    ON ord.out_req_code = orq.out_req_code

  /* 주문 전체 수량: ord_d_tbl 기준 (참고용) */
  LEFT JOIN (
    SELECT
      od.ord_code,
      SUM(od.ord_amount) AS totalOrderQty
    FROM ord_d_tbl od
    GROUP BY od.ord_code
  ) odtot
    ON odtot.ord_code = orq.ord_code

  /* 이 출고요청 + 제품별 실출고수량 합계 */
  LEFT JOIN (
    SELECT
      outbound_request_code,
      prod_code,
      SUM(outbnd_qtt) AS shipped_qty
    FROM poutbnd_tbl
    GROUP BY outbound_request_code, prod_code
  ) ship
    ON ship.outbound_request_code = ord.out_req_code
   AND ship.prod_code              = ord.prod_code

  /*WHERE*/
  GROUP BY
    orq.out_req_code,
    orq.out_req_date,
    orq.ord_code,
    c.client_name,
    odtot.totalOrderQty

  /* 🔹 출고완료(remainingQty = 0)는 모달에서 제외 */
  HAVING
    remainingQty > 0

  ORDER BY
    releaseDate DESC,
    releaseCode DESC
`;

/* ===========================
 *  출고요청 헤더 조회
 *  프론트에서 기대하는 필드:
 *    releaseCode, releaseDate, orderCode, client,
 *    remark, status, orderDate,
 *    registrantCode, registrantName
 * =========================== */
const SELECT_RELEASE_HEADER = `
  SELECT
    orq.out_req_code                          AS releaseCode,
    DATE_FORMAT(orq.out_req_date, '%Y-%m-%d') AS releaseDate,
    orq.ord_code                              AS orderCode,
    c.client_name                             AS client,
    orq.note                                  AS remark,
    o.note                                    AS orderRemark,   -- 주문 비고
    NULL                                      AS status,       -- 상태 필요하면 나중에 컬럼 추가
    DATE_FORMAT(o.ord_date, '%Y-%m-%d')       AS orderDate,

    orq.mcode                                 AS registrantCode,
    e.emp_name                                AS registrantName,

    o.mcode                                   AS order_manager_code,
    em.emp_name                               AS order_manager_name
  FROM out_req_tbl orq
  LEFT JOIN ord_tbl o
    ON o.ord_code = orq.ord_code
  LEFT JOIN client_tbl c
    ON c.client_code = orq.client_code
  LEFT JOIN emp_tbl e
    ON e.emp_code = orq.mcode
  LEFT JOIN emp_tbl em
    ON em.emp_code = o.mcode
  WHERE orq.out_req_code = ?
`;

/* ===========================
 *  출고요청 라인 (상세목록)
 *  프론트에서 기대하는 필드:
 *   - productCode, productName, product_type(type),
 *     spec, unit,
 *     orderQty, requestQty, releaseQty, shippedQty,
 *     current_stock, due_date
 * =========================== */
const SELECT_RELEASE_LINES = `
  SELECT
    ord.out_req_d_code                     AS line_no,
    ord.prod_code                          AS product_code,
    p.prod_name                            AS product_name,
    p.com_value                            AS product_type,
    od.spec                                AS spec,
    od.unit                                AS unit,

    /* 주문수량 */
    ord.ord_amount                         AS order_qty,

    /* 출고요청 수량 (요청 기준) */
    ord.out_req_d_amount                   AS requestQty,

    /* 실출고 수량 (poutbnd 기준) */
    COALESCE(ship.shipped_qty, 0)          AS shippedQty,

    /* 현재 재고 */
    COALESCE(stock.stock_qty, 0)           AS current_stock,

    od.delivery_date                       AS due_date
  FROM out_req_d_tbl ord
  JOIN out_req_tbl orq
    ON orq.out_req_code = ord.out_req_code
  LEFT JOIN ord_d_tbl od
    ON od.ord_code = orq.ord_code
   AND od.prod_code = ord.prod_code
  LEFT JOIN prod_tbl p
    ON p.prod_code = ord.prod_code

  /* 재고 계산: pinbnd_tbl - poutbnd_tbl */
  LEFT JOIN (
    SELECT
      i.prod_code,
      (i.in_qty - COALESCE(o.out_qty, 0)) AS stock_qty
    FROM (
      SELECT prod_code, SUM(qtt) AS in_qty
      FROM pinbnd_tbl
      GROUP BY prod_code
    ) i
    LEFT JOIN (
      SELECT prod_code, SUM(outbnd_qtt) AS out_qty
      FROM poutbnd_tbl
      GROUP BY prod_code
    ) o
      ON o.prod_code = i.prod_code
  ) stock
    ON stock.prod_code = ord.prod_code

  /* 이 출고요청 + 제품별 실출고수량 */
  LEFT JOIN (
    SELECT
      outbound_request_code,
      prod_code,
      SUM(outbnd_qtt) AS shipped_qty
    FROM poutbnd_tbl
    GROUP BY outbound_request_code, prod_code
  ) ship
    ON ship.outbound_request_code = ord.out_req_code
   AND ship.prod_code              = ord.prod_code

  WHERE ord.out_req_code = ?
  ORDER BY ord.out_req_d_code
`;

/* ===========================
 *      출고요청 자동채번
 * =========================== */
const GENERATE_OUT_REQ_CODE = `
  SELECT CONCAT(
    'OUT-',
    DATE_FORMAT(NOW(), '%Y%m%d'),
    '-',
    LPAD(
      IFNULL(
        MAX(CAST(SUBSTRING(out_req_code, 14, 4) AS UNSIGNED)) + 1,
        1
      ),
      4,
      '0'
    )
  ) AS out_req_code
  FROM out_req_tbl
  WHERE out_req_code LIKE CONCAT('OUT-', DATE_FORMAT(NOW(), '%Y%m%d'), '%')
`;

/* ===========================
 *    출고요청상세 자동채번
 * =========================== */
const GENERATE_OUT_REQ_D_CODE = `
  SELECT CONCAT(
    'OUT-',
    DATE_FORMAT(NOW(), '%Y%m%d'),
    '-D',
    LPAD(
      IFNULL(
        MAX(CAST(SUBSTRING(out_req_d_code, 15, 4) AS UNSIGNED)) + 1,
        1
      ),
      4,
      '0'
    )
  ) AS out_req_d_code
  FROM out_req_d_tbl
  WHERE out_req_d_code LIKE CONCAT('OUT-', DATE_FORMAT(NOW(), '%Y%m%d'), '-D%')
`;

/* ===========================
 *  등록자(직원) 목록 조회
 *  프론트에서 기대하는 필드:
 *    empCode, empName
 * =========================== */
const SELECT_EMPLOYEE_LIST = `
  SELECT
    e.emp_code AS empCode,
    e.emp_name AS empName
  FROM emp_tbl e
  ORDER BY e.emp_name ASC
`;

/* ===========================
 *  주문코드로 거래처코드 조회
 *  - 출고요청 헤더 INSERT 시 client_code 필요
 * =========================== */
const SELECT_ORDER_CLIENT_CODE = `
  SELECT
    o.client_code
  FROM ord_tbl o
  WHERE o.ord_code = ?
`;

/* ===========================
 *  출고요청 헤더 INSERT
 *  - out_req_tbl
 * =========================== */
const INSERT_OUT_REQ = `
  INSERT INTO out_req_tbl (
    out_req_code,
    out_req_date,
    ord_predict_date,
    note,
    ord_code,
    mcode,
    client_code
  )
  VALUES (?, ?, ?, ?, ?, ?, ?)
`;

/* ===========================
 *  출고요청 상세 INSERT
 *  - out_req_d_tbl
 * =========================== */
const INSERT_OUT_REQ_D = `
  INSERT INTO out_req_d_tbl (
    out_req_d_code,
    out_req_d_amount,
    ord_amount,
    out_req_code,
    prod_code,
    com_value
  )
  VALUES (?, ?, ?, ?, ?, ?)
`;

/* ===========================
 *  출고요청 헤더 수정
 * =========================== */
const UPDATE_OUT_REQ = `
  UPDATE out_req_tbl
  SET
    out_req_date     = ?,   -- 출고요청일
    ord_predict_date = ?,   -- 예측납기일(최소 납기)
    note             = ?,   -- 비고
    mcode            = ?    -- 담당자(등록자)
  WHERE out_req_code = ?
`;

/* ===========================
 *  출고요청 + 상세 삭제
 * =========================== */

const DELETE_OUT_REQ_HEADER = `
  DELETE FROM out_req_tbl
  WHERE out_req_code = ?
`;

const DELETE_OUT_REQ_D_BY_HEADER = `
  DELETE FROM out_req_d_tbl
  WHERE out_req_code = ?
`;

/* ===========================
 *  제품 목록 조회 (모달)
 *  - 프론트 컬럼:
 *    productCode, productName
 * =========================== */
const SELECT_PRODUCT_LIST = `
  SELECT
    p.prod_code AS productCode,
    p.prod_name AS productName,
    p.com_value AS productType,
    p.unit      AS unit,
    p.spec      AS spec
  FROM prod_tbl p
  WHERE
    (p.prod_code LIKE ? OR p.prod_name LIKE ?)
  ORDER BY
    p.prod_name ASC,
    p.prod_code ASC
`;

/* ===========================
 *  거래처 목록 조회 (모달)
 *  - 프론트 컬럼:
 *    clientCode, clientName
 * =========================== */
const SELECT_CLIENT_LIST = `
  SELECT
    c.client_code AS clientCode,
    c.client_name AS clientName,
    c.client_pnum AS phone,
    c.client_addr AS address
  FROM client_tbl c
  WHERE
    (c.client_code LIKE ? OR c.client_name LIKE ?)
  ORDER BY
    c.client_name ASC
`;

/* ===========================
 *  출고요청 조회 리스트 (ForwardingCheck)
 *  프론트 컬럼:
 *   - releaseNo, releaseDate,
 *     firstProductName, productCount,
 *     requestedQty, shippedQty, remainingQty,
 *     manager, client, status, statusCode
 * =========================== */
const SELECT_FORWARDING_CHECK_LIST = `
  SELECT
    orq.out_req_code                          AS releaseNo,
    DATE_FORMAT(orq.out_req_date, '%Y-%m-%d') AS releaseDate,

    /* 대표 제품명 + 제품 개수 */
    MIN(p.prod_name)                          AS firstProductName,
    COUNT(DISTINCT ord.prod_code)             AS productCount,

    /* 이 출고요청의 총 요청수량 (요청한 수량 합) */
    SUM(ord.out_req_d_amount)                 AS requestedQty,

    /* 이 출고요청의 총 실출고수량 (poutbnd 기준) */
    COALESCE(SUM(ship.shipped_qty), 0)        AS shippedQty,

    /* 요청 잔량 = 요청 - 실출고 */
    GREATEST(
      0,
      SUM(ord.out_req_d_amount) - COALESCE(SUM(ship.shipped_qty), 0)
    )                                         AS remainingQty,

    e.emp_name                                AS manager,
    c.client_name                             AS client,

    /* 상태(문자) */
    CASE
      WHEN COALESCE(SUM(ship.shipped_qty), 0) <= 0
        THEN '출고 대기'
      WHEN COALESCE(SUM(ship.shipped_qty), 0) < SUM(ord.out_req_d_amount)
        THEN '부분 출고'
      ELSE '출고 완료'
    END                                       AS status,

    /* 상태 코드 (0Q 그룹) - 필요하면 사용 */
    CASE
      WHEN COALESCE(SUM(ship.shipped_qty), 0) <= 0
        THEN 'q1'
      WHEN COALESCE(SUM(ship.shipped_qty), 0) < SUM(ord.out_req_d_amount)
        THEN 'q2'
      ELSE 'q3'
    END                                       AS statusCode
  FROM out_req_tbl orq
  LEFT JOIN out_req_d_tbl ord
    ON ord.out_req_code = orq.out_req_code
  LEFT JOIN prod_tbl p
    ON p.prod_code = ord.prod_code
  LEFT JOIN emp_tbl e
    ON e.emp_code = orq.mcode
  LEFT JOIN client_tbl c
    ON c.client_code = orq.client_code

  /* 라인별 실출고수량 집계 */
  LEFT JOIN (
    SELECT
      outbound_request_code,
      prod_code,
      SUM(outbnd_qtt) AS shipped_qty
    FROM poutbnd_tbl
    GROUP BY outbound_request_code, prod_code
  ) ship
    ON ship.outbound_request_code = ord.out_req_code
   AND ship.prod_code              = ord.prod_code

  /*WHERE*/
  GROUP BY
    orq.out_req_code,
    orq.out_req_date,
    e.emp_name,
    c.client_name
  /*HAVING*/
  ORDER BY
    orq.out_req_date DESC,
    orq.out_req_code DESC
`;

/* ===========================
 *  실출고 코드 자동채번 (poutbnd_tbl)
 *  예: OUT-20250625-P0001
 * =========================== */
const GENERATE_POUTBND_CODE = `
  SELECT CONCAT(
    'OUT-',
    DATE_FORMAT(NOW(), '%Y%m%d'),
    '-P',
    LPAD(
      IFNULL(
        MAX(CAST(SUBSTRING(poutbnd_code, 15, 4) AS UNSIGNED)) + 1,
        1
      ),
      4,
      '0'
    )
  ) AS poutbnd_code
  FROM poutbnd_tbl
  WHERE poutbnd_code LIKE CONCAT('OUT-', DATE_FORMAT(NOW(), '%Y%m%d'), '-P%')
`;

/* ===========================
 *  제품별 LOT 재고 조회 (FIFO용)
 *  - pinbnd_tbl 기준
 *  - remainQty > 0 인 lot만
 *  - pinbnd_date 오름차순 = 선입선출
 * =========================== */
const SELECT_LOT_FIFO_LIST = `
  SELECT
    p.lot_num    AS lotNum,
    p.prod_code  AS productCode,
    (p.qtt - COALESCE(o.out_qty, 0)) AS remainQty
  FROM pinbnd_tbl p
  LEFT JOIN (
    SELECT
      lot_num,
      prod_code,
      SUM(outbnd_qtt) AS out_qty
    FROM poutbnd_tbl
    WHERE prod_code = ?
    GROUP BY lot_num, prod_code
  ) o
    ON o.lot_num   = p.lot_num
   AND o.prod_code = p.prod_code
  WHERE p.prod_code = ?
    AND (p.qtt - COALESCE(o.out_qty, 0)) > 0
  ORDER BY
    p.pinbnd_date ASC,
    p.pinbnd_code ASC
`;

/* ===========================
 *  실출고 INSERT (poutbnd_tbl)
 * =========================== */
const INSERT_POUTBND = `
  INSERT INTO poutbnd_tbl (
    poutbnd_code,
    req_qtt,
    outbnd_qtt,
    deadline,
    stat,
    outbound_request_code,
    lot_num,
    prod_code,
    client_code,
    mcode
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

/* ===========================
 *  출고요청 코드로 주문/거래처 조회
 *  (out_req_tbl 기준)
 * =========================== */
const SELECT_RELEASE_ORDER_CLIENT = `
  SELECT
    o.ord_code,
    o.client_code
  FROM out_req_tbl r
  JOIN ord_tbl o
    ON o.ord_code = r.ord_code
  WHERE r.out_req_code = ?
`;

/* ===========================
 *  특정 출고요청 + 제품 기준
 *  요청수량 / 누적 출고수량 / 남은 수량 조회
 * =========================== */
const SELECT_RELEASE_LINE_SUMMARY = `
  SELECT
    d.out_req_code                        AS releaseCode,
    d.prod_code                           AS productCode,
    d.out_req_d_amount                    AS requestedQty,
    COALESCE(ship.shipped_qty, 0)         AS shippedQty,
    GREATEST(
      0,
      d.out_req_d_amount - COALESCE(ship.shipped_qty, 0)
    )                                     AS remainingQty
  FROM out_req_d_tbl d
  LEFT JOIN (
    SELECT
      outbound_request_code,
      prod_code,
      SUM(outbnd_qtt) AS shipped_qty
    FROM poutbnd_tbl
    WHERE outbound_request_code = ?
      AND prod_code = ?
    GROUP BY outbound_request_code, prod_code
  ) ship
    ON ship.outbound_request_code = d.out_req_code
   AND ship.prod_code = d.prod_code
  WHERE d.out_req_code = ?
    AND d.prod_code = ?
`;

module.exports = {
  SELECT_ORDER_LIST,
  SELECT_ORDER_HEADER,
  SELECT_ORDER_ITEMS,
  SELECT_RELEASE_LIST,
  SELECT_RELEASE_HEADER,
  SELECT_RELEASE_LINES,
  GENERATE_OUT_REQ_CODE,
  GENERATE_OUT_REQ_D_CODE,
  SELECT_EMPLOYEE_LIST,
  SELECT_ORDER_CLIENT_CODE,
  INSERT_OUT_REQ,
  INSERT_OUT_REQ_D,
  UPDATE_OUT_REQ,
  DELETE_OUT_REQ_HEADER,
  DELETE_OUT_REQ_D_BY_HEADER,
  SELECT_PRODUCT_LIST,
  SELECT_CLIENT_LIST,
  SELECT_FORWARDING_CHECK_LIST,
  SELECT_RELEASE_LIST_ALL,
  GENERATE_POUTBND_CODE,
  INSERT_POUTBND,
  SELECT_RELEASE_ORDER_CLIENT,
  SELECT_RELEASE_LINE_SUMMARY,
  SELECT_LOT_FIFO_LIST,
};
