module.exports = {
  // 자재 목록 조회
  getMaterialList: `
    SELECT mat_code, mat_name, unit 
    FROM mat_tbl 
    WHERE is_used = 'f2'
  `,

  // 공급업체 목록 조회 (공급업체 타입 l2만 조회)
  getSupplierList: `
    SELECT client_code, client_name 
    FROM client_tbl 
    WHERE client_type = 'l2'
  `,

  // 담당자(사원) 목록 조회
  getEmployeeList: `
    SELECT e.emp_code, e.emp_name, d.dept_name
    FROM emp_tbl e
    LEFT JOIN dept_tbl d ON e.dept_code = d.dept_code
    WHERE e.emp_stat = 'f2'
  `,
  // 1. 금일 마지막 시퀀스 조회 (ID 자동생성용)
  // 예: MIN-20250704-XXX 형태라고 가정
  getLastMinbndSeq: `
    SELECT minbnd_code 
    FROM minbnd_tbl 
    WHERE minbnd_code LIKE CONCAT('MIN-', DATE_FORMAT(NOW(), '%Y%m%d'), '-%')
    ORDER BY minbnd_code DESC 
    LIMIT 1
  `,

  // 2. 금일 마지막 LOT 시퀀스 조회
  // 예: LOT-100-20250704-XXX (100은 자재유형 가정)
  getLastLotSeq: `
    SELECT lot_num 
    FROM mat_lot_tbl 
    WHERE lot_num LIKE CONCAT('LOT-%-', DATE_FORMAT(NOW(), '%Y%m%d'), '-%')
    ORDER BY lot_num DESC 
    LIMIT 1
  `,

  // 3. LOT 정보 등록 (선행 필수)
  insertMatLot: `
    INSERT INTO mat_lot_tbl (
      lot_num,
      issdate,
      item_type_code,
      mat_code
    ) VALUES ?
  `,

  // 4. 입고 정보 등록
  insertMinbnd: `
    INSERT INTO minbnd_tbl (
      minbnd_code,
      mat_code,
      mat_type,
      unit,
      inbnd_qtt,
      inbnd_date,
      ord_qtt,
      qio_code,    -- 필수 (FK)
      lot_num,     -- 필수 (FK)
      mat_sup,     -- 거래처 (FK)
      mcode        -- 담당자 (FK)
    ) VALUES ?
  `,
};
