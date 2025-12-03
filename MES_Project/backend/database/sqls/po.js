module.exports = {
  // 단일 발주서 헤더 조회
  selectPoHeaderByCode: `
    SELECT
      purchase_code,
      stat,
      regdate,
      note,
      mcode
    FROM mpo_tbl
    WHERE purchase_code = ?
  `,

  // 해당 발주서의 자재 상세 목록 조회
  selectPoDetailsByCode: `
    SELECT
      mpo_d_code,
      unit,
      req_qtt,
      deadline,
      purchase_code,
      client_code
    FROM mpo_d_tbl
    WHERE purchase_code = ?
    ORDER BY mpo_d_code
  `,

  // 발주 헤더 INSERT
  insertPoHeader: `
  INSERT INTO mpo_tbl (
    purchase_code,
    purchase_req_date,
    stat,
    regdate,
    note,
    mcode
  ) VALUES (?, ?,?, ?, ?, ?)
`,

  // 발주 헤더 UPDATE
  updatePoHeader: `
    UPDATE mpo_tbl
       SET stat    = ?,
           regdate = ?,
           note    = ?,
           mcode   = ?
     WHERE purchase_code = ?
  `,

  // 기존 상세 전체 삭제 (재등록 방식)
  deletePoDetailsByCode: `
    DELETE FROM mpo_d_tbl
    WHERE purchase_code = ?
  `,

  // 발주 상세 INSERT
  insertPoDetail: `
  INSERT INTO mpo_d_tbl (
    mpo_d_code,
    unit,
    req_qtt,
    deadline,
    purchase_code,
    client_code,
    mat_code
  ) VALUES (?, ?, ?, ?, ?, ?,?)
`,
};
