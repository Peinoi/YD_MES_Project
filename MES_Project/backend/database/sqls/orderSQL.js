// backend/database/sqls/orderSQL.js
module.exports = {
  // 주문 목록 전체 조회
  selectOrderList: `
  SELECT o.ord_code -- 주문번호
	  ,o.ord_name -- 주문명
    ,o.ord_date -- 주문일자
    ,p.prod_name -- 제품명
    ,od.ord_amount -- 수량
    ,c.client_name -- 거래처
    ,od.delivery_date -- 납기일
    ,o.ord_stat -- 상태
    ,cc.note AS ord_stat_name -- 상태명
    ,o.note -- 비고
  FROM ord_tbl o
  JOIN ord_d_tbl od ON o.ord_code = od.ord_code
  JOIN prod_tbl p ON p.prod_code = od.prod_code
  JOIN client_tbl c ON c.client_code = o.client_code
  JOIN common_code cc ON cc.com_value = o.ord_stat
  WHERE 1 = 1
  /* 주문번호 */
  AND ( ? IS NULL OR ? = '' OR o.ord_code LIKE CONCAT('%', ?, '%') )
  /* 주문명 */
  AND ( ? IS NULL OR ? = '' OR o.ord_name LIKE CONCAT('%', ?, '%') )
  /* 주문일자 */
  AND ( ? IS NULL OR DATE(o.ord_date) >= ? )
  AND ( ? IS NULL OR DATE(o.ord_date) <= ? )
  /* 거래처 */
  AND ( ? IS NULL OR ? = '' OR c.client_name LIKE CONCAT('%', ?, '%') )
  /* 수량 */
  AND ( ? IS NULL OR od.ord_amount = ? )
  AND ( ? IS NULL OR od.ord_amount = ? )
  /* 납기일 */
  AND ( ? IS NULL OR DATE(od.delivery_date) >= ? )
  AND ( ? IS NULL OR DATE(od.delivery_date) <= ? )
  /* 상태 */
  AND ( ? IS NULL OR ? = '' OR cc.note LIKE CONCAT('%', ?, '%') )
`,

  // 주문 모달창 조회
  selectOrderSearch: `
  SELECT o.ord_code -- 주문번호
        ,o.ord_date -- 주문일자
        ,o.ord_name -- 주문명
        ,c.client_name -- 거래처
        ,od.delivery_date -- 납기일
        ,od.ord_priority -- 우선순위
        ,e.emp_name -- 거래처 담당자명
        ,o.note -- 비고
        ,p.prod_name -- 제품명
  FROM ord_tbl o
  JOIN ord_d_tbl od ON o.ord_code = od.ord_code
  JOIN client_tbl c ON c.client_code = o.client_code
  JOIN emp_tbl e ON e.emp_code = o.mcode
  JOIN prod_tbl p ON p.prod_code = od.prod_code
  WHERE 1 = 1
  /* 주문번호 */
  AND ( ? IS NULL OR ? = '' OR o.ord_code LIKE CONCAT('%', ?, '%') )
  /* 주문명 */
  AND ( ? IS NULL OR ? = '' OR o.ord_name LIKE CONCAT('%', ?, '%') )
  /* 거래처 */
  AND ( ? IS NULL OR ? = '' OR c.client_name LIKE CONCAT('%', ?, '%') )
  `,

  // 거래처 목록 전체 조회
  selectClientList: `
  SELECT client_code
        ,client_name
  FROM client_tbl
  `,

  // 영업팀 거래처 담당자 목록 전체 조회
  selectManagerList: `
  SELECT e.emp_code
      ,e.emp_name
      ,e.dept_code
      ,d.dept_name
  FROM emp_tbl e
  JOIN dept_tbl d ON e.dept_code = d.dept_code
  WHERE dept_name = '영업팀'
  AND emp_name != '시스템관리자'
  `,
};
