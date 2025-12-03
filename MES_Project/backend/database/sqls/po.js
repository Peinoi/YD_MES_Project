module.exports = {
  // 단일 발주서 헤더 조회
  selectPoHeaderByCode: `
    SELECT
    purchase_code,
    purchase_req_date,
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
    d.mpo_d_code        AS mpo_d_code,
    d.mat_code          AS mat_code,
    d.unit              AS unit,
    d.req_qtt           AS req_qtt,
    d.deadline          AS deadline,
    d.purchase_code     AS purchase_code,
    d.client_code       AS client_code,

    m.mat_name          AS matName,
    m.unit              AS matUnit,
    m.save_inven        AS saveInven,
    m.sup               AS clientName,

    mb.mat_type         AS matType,
    COALESCE(mb.in_total, 0) AS inTotal,
    COALESCE(mo.out_total, 0) AS outTotal,
    (COALESCE(mb.in_total, 0) - COALESCE(mo.out_total, 0)) AS curInven,
    GREATEST(
      m.save_inven - (COALESCE(mb.in_total, 0) - COALESCE(mo.out_total, 0)),
      0
    ) AS insInven

  FROM mpo_d_tbl d
  LEFT JOIN mat_tbl m
    ON d.mat_code = m.mat_code
  LEFT JOIN (
    SELECT
      mat_code,
      MAX(mat_type)   AS mat_type,
      SUM(inbnd_qtt)  AS in_total
    FROM minbnd_tbl
    GROUP BY mat_code
  ) mb
    ON d.mat_code = mb.mat_code
  LEFT JOIN (
    SELECT
      mat_code,
      SUM(outbnd_qtt) AS out_total
    FROM moutbnd_tbl
    GROUP BY mat_code
  ) mo
    ON d.mat_code = mo.mat_code
  WHERE d.purchase_code = ?
  ORDER BY d.mpo_d_code
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
  // 발주서 목록 조회
  selectPoList: `
  SELECT
    t.purchase_code           AS purchaseCode,
    DATE(t.purchase_req_date) AS purchaseDate,
    CASE
      WHEN COUNT(d.mat_code) = 0 THEN ''                                        -- 상세 없을 때
      WHEN COUNT(d.mat_code) = 1 THEN MIN(d.mat_code)                           -- 1건이면 그대로
      ELSE CONCAT(MIN(d.mat_code), ' 외 ', COUNT(d.mat_code) - 1, '건')         -- 여러 건이면 "첫번째코드 외 N건"
    END AS matCode
  FROM mpo_tbl t
  LEFT JOIN mpo_d_tbl d
    ON t.purchase_code = d.purchase_code
  WHERE 
    (? IS NULL OR t.purchase_code LIKE CONCAT('%', ?, '%'))
  GROUP BY
    t.purchase_code,
    t.purchase_req_date
  ORDER BY
    t.purchase_code DESC
`,

  //자재 모달 조회
  selectMateList: `
  SELECT
    m.mat_code   AS matCode,
    m.mat_name   AS matName,
    m.unit       AS unit,
    m.save_inven AS saveInven,
    m.sup        AS clientName,

    mb.mat_type  AS matType,
    COALESCE(mb.in_total, 0) AS inTotal,
    COALESCE(mo.out_total, 0) AS outTotal,
    (COALESCE(mb.in_total, 0) - COALESCE(mo.out_total, 0)) AS curInven,
    GREATEST(
      m.save_inven - (COALESCE(mb.in_total, 0) - COALESCE(mo.out_total, 0)),
      0
    ) AS insInven

  FROM mat_tbl m
  LEFT JOIN (
    SELECT
      mat_code,
      MAX(mat_type)   AS mat_type,
      SUM(inbnd_qtt)  AS in_total
    FROM minbnd_tbl
    GROUP BY mat_code
  ) mb
    ON m.mat_code = mb.mat_code
  LEFT JOIN (
    SELECT
      mat_code,
      SUM(outbnd_qtt) AS out_total
    FROM moutbnd_tbl
    GROUP BY mat_code
  ) mo
    ON m.mat_code = mo.mat_code
  WHERE
    (? IS NULL
      OR m.mat_code LIKE CONCAT('%', ?, '%')
      OR m.mat_name LIKE CONCAT('%', ?, '%')
    )
  ORDER BY m.mat_code
`,
  // 발주서 상세 삭제
  deletePoDetailsByCode: `
  DELETE FROM mpo_d_tbl
  WHERE purchase_code = ?
`,

  //발주서 헤더 삭제
  deletePoHeaderByCode: `
  DELETE FROM mpo_tbl
  WHERE purchase_code = ?
`,
};
