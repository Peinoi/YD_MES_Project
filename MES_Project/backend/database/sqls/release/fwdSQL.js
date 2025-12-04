// MES_Project/backend/database/sqls/release/fwdSQL.js

/* ===========================
 *  주문 목록 조회 (모달)
 *  프론트 컬럼:
 *   - orderNo, orderDate, orderName, client, dueDate, priority
 * =========================== */
const SELECT_ORDER_LIST = `
  SELECT
      o.ord_code AS orderNo,
      DATE_FORMAT(o.ord_date, '%Y-%m-%d') AS orderDate,
      o.ord_name AS orderName,
      c.client_name AS client,
      MIN(od.delivery_date) AS dueDate,
      MIN(od.ord_priority) AS priority
  FROM ord_tbl o
  JOIN client_tbl c
    ON o.client_code = c.client_code
  LEFT JOIN ord_d_tbl od
    ON o.ord_code = od.ord_code
  WHERE 
      (o.ord_code LIKE ? OR o.ord_name LIKE ? OR c.client_name LIKE ?)
  GROUP BY
      o.ord_code,
      o.ord_date,
      o.ord_name,
      c.client_name
  ORDER BY
      o.ord_date DESC,
      o.ord_code DESC
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
    p.prod_type                                 AS type,
    od.spec                                     AS spec,
    od.unit                                     AS unit,
    od.ord_amount                               AS orderQty,

    /* 재고 (입고 - 출고) */
    COALESCE(stock.stock_qty, 0)                AS stockQty,
    COALESCE(stock.stock_qty, 0)                AS currentStock,

    /* 미출고 수량 = 주문수량 - 이미 출고된 수량 */
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

  /* 이미 출고된 수량: 주문 기준 */
  LEFT JOIN (
    SELECT
      pb.prod_code,
      orq.ord_code,
      SUM(pb.outbnd_qtt) AS release_qty
    FROM poutbnd_tbl pb
    JOIN out_req_tbl orq
      ON orq.out_req_code = pb.outbound_request_code
    GROUP BY pb.prod_code, orq.ord_code
  ) rel
    ON rel.prod_code = od.prod_code
   AND rel.ord_code = od.ord_code

  WHERE od.ord_code = ?
  ORDER BY od.ord_d_code
`;

/* ===========================
 *  출고전표 목록 (모달)
 *  프론트 컬럼:
 *   - releaseCode, releaseDate, orderCode, client, status, totalQty
 * =========================== */
const SELECT_RELEASE_LIST = `
  SELECT
    pb.poutbnd_code                    AS releaseCode,
    MIN(pb.deadline)                   AS releaseDate,
    orq.ord_code                       AS orderCode,
    c.client_name                      AS client,
    pb.stat                            AS status,
    SUM(pb.outbnd_qtt)                 AS totalQty
  FROM poutbnd_tbl pb
  LEFT JOIN out_req_tbl orq
    ON orq.out_req_code = pb.outbound_request_code
  LEFT JOIN client_tbl c
    ON c.client_code = pb.client_code
  /*WHERE*/
  GROUP BY
    pb.poutbnd_code,
    orq.ord_code,
    c.client_name,
    pb.stat
  ORDER BY
    releaseDate DESC,
    releaseCode DESC
`;

/* ===========================
 *  출고전표 헤더 조회
 *  프론트에서 기대하는 필드:
 *    releaseCode, releaseDate, orderCode, client,
 *    remark, status, orderDate,
 *    registrantCode, registrantName  ← 추가
 * =========================== */
const SELECT_RELEASE_HEADER = `
  SELECT
    pb.poutbnd_code                              AS releaseCode,
    DATE_FORMAT(pb.deadline, '%Y-%m-%d')         AS releaseDate,
    orq.ord_code                                 AS orderCode,
    c.client_name                                AS client,
    orq.note                                     AS remark,
    pb.stat                                      AS status,
    DATE_FORMAT(o.ord_date, '%Y-%m-%d')          AS orderDate,

    pb.mcode                                     AS registrantCode,  
    e.emp_name                                   AS registrantName    
  FROM poutbnd_tbl pb
  LEFT JOIN out_req_tbl orq
    ON orq.out_req_code = pb.outbound_request_code
  LEFT JOIN ord_tbl o
    ON o.ord_code = orq.ord_code
  LEFT JOIN client_tbl c
    ON c.client_code = pb.client_code
  LEFT JOIN emp_tbl e       
    ON e.emp_code = pb.mcode
  WHERE pb.poutbnd_code = ?
`;

/* ===========================
 *  출고전표 라인 (상세목록)
 * =========================== */
const SELECT_RELEASE_LINES = `
  SELECT
    1                                     AS line_no,
    pb.prod_code                          AS product_code,
    p.prod_name                           AS product_name,
    p.prod_type                           AS product_type,
    p.spec                                AS spec,
    p.unit                                AS unit,
    od.ord_amount                         AS order_qty,
    pb.outbnd_qtt                         AS release_qty,
    COALESCE(stock.stock_qty, 0)          AS current_stock,
    od.delivery_date                      AS due_date
  FROM poutbnd_tbl pb
  LEFT JOIN prod_tbl p
    ON p.prod_code = pb.prod_code
  LEFT JOIN out_req_tbl orq
    ON orq.out_req_code = pb.outbound_request_code
  LEFT JOIN ord_d_tbl od
    ON od.ord_code = orq.ord_code
   AND od.prod_code = pb.prod_code

  /* 재고 계산 */
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
    ON stock.prod_code = pb.prod_code

  WHERE pb.poutbnd_code = ?
`;

/* ===========================
 *  출고번호 자동채번 (옵션)
 * =========================== */
const GENERATE_RELEASE_CODE = `
  SELECT CONCAT(
    'R',
    DATE_FORMAT(NOW(), '%Y%m%d'),
    LPAD(
      IFNULL(MAX(CAST(SUBSTRING(poutbnd_code, 10, 4) AS UNSIGNED)) + 1, 1),
      4,
      '0'
    )
  ) AS release_code
  FROM poutbnd_tbl
  WHERE poutbnd_code LIKE CONCAT('R', DATE_FORMAT(NOW(), '%Y%m%d'), '%')
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

module.exports = {
  SELECT_ORDER_LIST,
  SELECT_ORDER_HEADER,
  SELECT_ORDER_ITEMS,
  SELECT_RELEASE_LIST,
  SELECT_RELEASE_HEADER,
  SELECT_RELEASE_LINES,
  GENERATE_RELEASE_CODE,
  SELECT_EMPLOYEE_LIST,
};
