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
        ,o.ord_name -- 주문명
        ,o.ord_date -- 주문일자
        ,c.client_name -- 거래처
        ,e.emp_name -- 거래처 담당자명
        ,o.note -- 비고
  FROM ord_tbl o
  JOIN client_tbl c ON c.client_code = o.client_code
  JOIN emp_tbl e ON e.emp_code = o.mcode
  WHERE 1 = 1
  /* 주문번호 */
  AND ( ? IS NULL OR ? = '' OR o.ord_code LIKE CONCAT('%', ?, '%') )
  /* 주문명 */
  AND ( ? IS NULL OR ? = '' OR o.ord_name LIKE CONCAT('%', ?, '%') )
  /* 거래처 */
  AND ( ? IS NULL OR ? = '' OR c.client_name LIKE CONCAT('%', ?, '%') )
  `,

  // 주문 정보, 제품 정보 조회
  selectOrderProduction: `
  SELECT o.ord_code -- 주문번호
        ,od.ord_d_code -- 주문상세번호
        ,p.prod_name -- 제품명
        ,p.com_value -- 유형: 봉지라면 or 컵라면
		    ,p.spec -- 규격
		    ,p.unit -- 단위
		    ,od.ord_amount -- 수량
        ,od.prod_price -- 단가
        ,od.delivery_date -- 납기일
        ,od.ord_priority -- 우선순위
  FROM ord_tbl o
  JOIN ord_d_tbl od ON o.ord_code = od.ord_code
  JOIN prod_tbl p ON p.prod_code = od.prod_code
  WHERE o.ord_code = ?
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

  // 주문 정보 삭제(삭제)
  deleteOrder: `
  DELETE FROM ord_tbl
  WHERE ord_code = ?
  `,

  // 주문 상세 정보 삭제(삭제)
  deleteOrderDetail: `
  DELETE FROM ord_d_tbl
  WHERE ord_code = ?
  `,

  // 가장 큰 주문 코드 조회
  selectMaxOrderCode: `
  SELECT MAX(ord_code) AS max_ord_code
  FROM ord_tbl
  WHERE ord_code LIKE 'ORD-%'
  `,

  // 가장 큰 주문 상세 코드 조회
  selectMaxOrderDetailCode: `
  SELECT MAX(ord_d_code) AS max_ord_d_code
  FROM ord_d_tbl
  WHERE ord_d_code LIKE 'ORD-D-%'
  `,

  // 주문 정보 등록(저장)
  insertOrder: `
  INSERT INTO ord_tbl (
      ord_code
     ,ord_name
     ,ord_date
     ,ord_stat
     ,note
     ,mcode
     ,client_code)
  VALUES ( ?, ?, ?, ?, ?, ?, ? )
  `,

  // 주문 상세 정보 등록(저장)
  insertOrderDetail: `
  INSERT INTO ord_d_tbl (
      ord_d_code
     ,unit
     ,spec
     ,ord_amount
     ,prod_price
     ,delivery_date
     ,ord_priority
     ,total_price
     ,ord_code
     ,prod_code)
  VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ? )
  `,

  // 주문 정보 수정(저장)
  updateOrder: `
  UPDATE ord_tbl 
  SET ord_name = ?
     ,ord_date = ?
     ,ord_stat = ?
     ,note = ?
     ,mcode = ?
     ,client_code = ?
  WHERE ord_code = ?
  `,

  // 주문 상세 정보 수정(저장)
  updateOrderDetail: `
  UPDATE ord_d_tbl 
  SET unit = ?
     ,spec = ?
     ,ord_amount = ?
     ,prod_price = ?
     ,delivery_date = ?
     ,ord_priority = ?
     ,total_price = ?
     ,prod_code = ?
  WHERE ord_d_code = ?
  `,

  // 주문 상세 정보 선택 삭제(저장)
  deleteOrderDetailChoice: `
  DELETE FROM ord_d_tbl
  WHERE ord_d_code IN ( ? )
  `,
};
