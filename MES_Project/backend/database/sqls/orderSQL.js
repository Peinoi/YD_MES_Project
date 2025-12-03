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
    ,o.note -- 비고
  FROM ord_tbl o
  JOIN ord_d_tbl od ON o.ord_code = od.ord_code
  JOIN prod_tbl p ON p.prod_code = od.prod_code
  JOIN client_tbl c ON c.client_code = o.client_code
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
  AND ( ? IS NULL OR ? = '' OR o.ord_stat LIKE CONCAT('%', ?, '%') )
`,
};
