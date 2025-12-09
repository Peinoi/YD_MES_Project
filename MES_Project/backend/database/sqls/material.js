// [재고 목록 조회]

// [재고 목록 조회]
const stockList = `
  SELECT 
    m.mat_code as code,
    m.mat_name as name,
    (SELECT note FROM common_code WHERE com_value = m.material_type_code) as category,
    -- [수정] 규격 추가 및 단위 코드 변환
    m.spec,
    (SELECT note FROM common_code WHERE com_value = m.unit) as unit,
    
    IFNULL(s.cur_qtt, 0) as stock, 
    m.save_inven as minStock,
    (SELECT MAX(inbnd_date) FROM minbnd_tbl WHERE mat_code = m.mat_code) as lastInput,
    CASE 
      WHEN IFNULL(s.cur_qtt, 0) <= m.save_inven * 0.3 THEN '발주 필요'
      WHEN IFNULL(s.cur_qtt, 0) <= m.save_inven THEN '부족'
      WHEN IFNULL(s.cur_qtt, 0) >= m.save_inven * 3 THEN '과다'
      ELSE '정상' 
    END as status
  FROM mat_tbl m
  LEFT JOIN mat_stock_v s ON m.mat_code = s.mat_code
  WHERE 1=1
`;

// [재고 상세 - 기본 정보]
const stockBasicInfo = `
  SELECT 
    m.mat_code as code,
    m.mat_name as name,
    (SELECT note FROM common_code WHERE com_value = m.material_type_code) as category,
    -- [수정] 규격 및 단위 추가
    m.spec,
    (SELECT note FROM common_code WHERE com_value = m.unit) as unit,
    
    IFNULL(s.cur_qtt, 0) as stock,
    m.save_inven as minStock,
    (SELECT MAX(inbnd_date) FROM minbnd_tbl WHERE mat_code = m.mat_code) as lastInput,
    CASE 
      WHEN IFNULL(s.cur_qtt, 0) <= m.save_inven * 0.3 THEN '발주 필요'
      WHEN IFNULL(s.cur_qtt, 0) <= m.save_inven THEN '부족'
      WHEN IFNULL(s.cur_qtt, 0) >= m.save_inven * 3 THEN '과다'
      ELSE '정상' 
    END as status
  FROM mat_tbl m
  LEFT JOIN mat_stock_v s ON m.mat_code = s.mat_code
  WHERE m.mat_code = ?
`;

// [재고 상세 - 공급업체별 LOT 내역] (최근 입고순 10건)
// 수정사항: 컬럼명 매핑 (in_qty -> inbnd_qtt, in_date -> inbnd_date)
const stockDetailBySupplier = `
  SELECT 
    c.client_name as supplier,
    i.inbnd_qtt as amount,
    i.inbnd_date as date,
    i.lot_num as lot
  FROM minbnd_tbl i
  LEFT JOIN client_tbl c ON i.mat_sup = c.client_code
  WHERE i.mat_code = ?
  ORDER BY i.inbnd_date DESC
  LIMIT 10
`;

// [재고 상세 - 최근 입출고 이력] (통합 10건)
// 수정사항: 입고/출고 테이블의 실제 컬럼명 사용 (inbnd_date, moutbnd_date 등)
const stockHistory = `
  SELECT * FROM (
    -- 입고 내역
    SELECT 
      i.inbnd_date as date,
      '입고' as type,
      i.inbnd_qtt as amount,
      IFNULL(c.client_name, '기타') as supplier,
      e.emp_name as manager
    FROM minbnd_tbl i
    LEFT JOIN client_tbl c ON i.mat_sup = c.client_code
    LEFT JOIN emp_tbl e ON i.mcode = e.emp_code
    WHERE i.mat_code = ?
    
    UNION ALL
    
    -- 출고 내역
    SELECT 
      o.moutbnd_date as date,
      '출고' as type,
      o.outbnd_qtt as amount,
      '생산 투입' as supplier,
      e.emp_name as manager
    FROM moutbnd_tbl o
    LEFT JOIN emp_tbl e ON o.emp_code = e.emp_code
    WHERE o.mat_code = ?
  ) AS history_table
  ORDER BY date DESC
  LIMIT 10
`;

module.exports = {
  stockList,
  stockBasicInfo,
  stockDetailBySupplier,
  stockHistory,
};
