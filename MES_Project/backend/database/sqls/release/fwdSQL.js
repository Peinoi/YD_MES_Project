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
 *  프론트 컬럼:
 *   - releaseCode, releaseDate, orderCode, client, status, totalQty
 * =========================== */
const SELECT_RELEASE_LIST_ALL = `
  SELECT
    orq.out_req_code                          AS releaseCode,
    orq.out_req_date                          AS releaseDate,
    orq.ord_code                              AS orderCode,
    c.client_name                             AS client,

    /* 주문 전체 수량 (ord_d_tbl 기준) */
    odtot.totalOrderQty                       AS orderQty,

    /* 이 출고요청(헤더)에서 요청한 수량 합 */
    SUM(ord.out_req_d_amount)                 AS totalQty,

    /* 남은 미출고 수량 = 주문총수량 - 지금까지 전체 출고요청 수량 */
    (odtot.totalOrderQty - COALESCE(rel.totalReleaseQty, 0)) AS remainingQty,

    /* 상태: 남은 수량 없으면 출고완료, 아니면 요청 */
    CASE
      WHEN (odtot.totalOrderQty - COALESCE(rel.totalReleaseQty, 0)) <= 0
        THEN '출고완료'
      ELSE '요청'
    END                                        AS status
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
      r.ord_code,
      SUM(d.out_req_d_amount) AS totalReleaseQty
    FROM out_req_d_tbl d
    JOIN out_req_tbl r
      ON r.out_req_code = d.out_req_code
    GROUP BY r.ord_code
  ) rel
    ON rel.ord_code = orq.ord_code

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
 *  출고요청 목록 (모달)
 *  프론트 컬럼:
 *   - releaseCode, releaseDate, orderCode, client, status, totalQty
 * =========================== */
const SELECT_RELEASE_LIST = `
  SELECT
    orq.out_req_code                          AS releaseCode,
    orq.out_req_date                          AS releaseDate,
    orq.ord_code                              AS orderCode,
    c.client_name                             AS client,

    /* 주문 전체 수량 (ord_d_tbl 기준) */
    odtot.totalOrderQty                       AS orderQty,

    /* 이 출고요청(헤더)에서 요청한 수량 합 */
    SUM(ord.out_req_d_amount)                 AS totalQty,

    /* 남은 미출고 수량 = 주문총수량 - 지금까지 전체 출고요청 수량 */
    (odtot.totalOrderQty - COALESCE(rel.totalReleaseQty, 0)) AS remainingQty,

    /* 상태: 남은 수량 없으면 출고완료, 아니면 요청 */
    CASE
      WHEN (odtot.totalOrderQty - COALESCE(rel.totalReleaseQty, 0)) <= 0
        THEN '출고완료'
      ELSE '요청'
    END                                        AS status
  FROM out_req_tbl orq
  LEFT JOIN client_tbl c
    ON c.client_code = orq.client_code

  /* 이 출고요청 헤더의 상세 (이번 출고요청에서 얼마를 요청했는지) */
  LEFT JOIN out_req_d_tbl ord
    ON ord.out_req_code = orq.out_req_code

  /* 주문 전체 수량: ord_d_tbl 기준으로 한 번만 합산 */
  LEFT JOIN (
    SELECT
      od.ord_code,
      SUM(od.ord_amount) AS totalOrderQty
    FROM ord_d_tbl od
    GROUP BY od.ord_code
  ) odtot
    ON odtot.ord_code = orq.ord_code

  /* 이 주문에 대해 지금까지 모든 출고요청 수량 합 (전체 누적) */
  LEFT JOIN (
    SELECT
      r.ord_code,
      SUM(d.out_req_d_amount) AS totalReleaseQty
    FROM out_req_d_tbl d
    JOIN out_req_tbl r
      ON r.out_req_code = d.out_req_code
    GROUP BY r.ord_code
  ) rel
    ON rel.ord_code = orq.ord_code

  /*WHERE*/
  GROUP BY
    orq.out_req_code,
    orq.out_req_date,
    orq.ord_code,
    c.client_name,
    odtot.totalOrderQty,
    rel.totalReleaseQty

  /* 🔹 미출고수량 남아 있는 것만 모달에 표시 */
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
 *  out_req_d_tbl 기준
 * =========================== */
const SELECT_RELEASE_LINES = `
  SELECT
    1                                     AS line_no,
    ord.prod_code                         AS product_code,
    p.prod_name                           AS product_name,
    p.com_value                           AS product_type,
    od.spec                               AS spec,
    od.unit                               AS unit,
    ord.ord_amount                        AS order_qty,
    ord.out_req_d_amount                  AS release_qty,
    COALESCE(stock.stock_qty, 0)          AS current_stock,
    od.delivery_date                      AS due_date
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

  WHERE ord.out_req_code = ?
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
 *   - releaseNo, productName, qty, date, manager, client, status
 * =========================== */
const SELECT_FORWARDING_CHECK_LIST = `
  SELECT
    orq.out_req_code                          AS releaseNo,
    p.prod_name                               AS productName,
    ord.out_req_d_amount                      AS qty,
    DATE_FORMAT(orq.out_req_date, '%Y-%m-%d') AS date,
    e.emp_name                                AS manager,
    c.client_name                             AS client,

    /* 주문 전체 수량 - 누적 출고요청 수량 = 미출고수량 */
    (odtot.totalOrderQty - COALESCE(rel.totalReleaseQty, 0)) AS remainingQty,

    /* 상태: 미출고수량이 0 이하면 출고완료, 아니면 요청 */
    CASE
      WHEN (odtot.totalOrderQty - COALESCE(rel.totalReleaseQty, 0)) <= 0
        THEN '출고완료'
      ELSE '요청'
    END                                         AS status
  FROM out_req_tbl orq
  LEFT JOIN out_req_d_tbl ord
    ON ord.out_req_code = orq.out_req_code
  LEFT JOIN prod_tbl p
    ON p.prod_code = ord.prod_code
  LEFT JOIN emp_tbl e
    ON e.emp_code = orq.mcode
  LEFT JOIN client_tbl c
    ON c.client_code = orq.client_code

  /* 🔹 주문 전체 수량 */
  LEFT JOIN (
    SELECT
      od.ord_code,
      SUM(od.ord_amount) AS totalOrderQty
    FROM ord_d_tbl od
    GROUP BY od.ord_code
  ) odtot
    ON odtot.ord_code = orq.ord_code

  /* 🔹 이 주문에 대해 지금까지 누적된 출고요청 수량 */
  LEFT JOIN (
    SELECT
      r.ord_code,
      SUM(d.out_req_d_amount) AS totalReleaseQty
    FROM out_req_d_tbl d
    JOIN out_req_tbl r
      ON r.out_req_code = d.out_req_code
    GROUP BY r.ord_code
  ) rel
    ON rel.ord_code = orq.ord_code

  /*WHERE*/
  ORDER BY
    orq.out_req_date DESC,
    orq.out_req_code DESC,
    p.prod_name ASC
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
};
