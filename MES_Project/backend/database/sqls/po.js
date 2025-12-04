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
    d.deadline          AS deadline,
    d.purchase_code     AS purchase_code,
    d.client_code       AS client_code,
    d.req_qtt           AS req_qtt,

    m.mat_name          AS matName,
    m.unit              AS matUnit,

    c.client_name       AS clientName,

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
  LEFT JOIN client_tbl c
    ON d.client_code = c.client_code
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

  // 기존 상세 전체 삭제 (재등록)
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
      WHEN COUNT(m.mat_name) = 0 THEN ''                                        -- 상세 없을 때
      WHEN COUNT(m.mat_name) = 1 THEN MIN(m.mat_name)                           -- 1건이면 그대로
      ELSE CONCAT(MIN(m.mat_name), ' 외 ', COUNT(m.mat_name) - 1, '건')         -- 여러 건이면 "첫번째코드 외 N건"
    END AS matName
  FROM mpo_tbl t
  LEFT JOIN mpo_d_tbl d
    ON t.purchase_code = d.purchase_code
  LEFT JOIN mat_tbl m
    ON d.mat_code = m.mat_code
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
    c.client_name       AS clientName,
    c.client_code       AS clientCode,

    mb.mat_type  AS matType,
    COALESCE(mb.in_total, 0) AS inTotal,
    COALESCE(mo.out_total, 0) AS outTotal,
    (COALESCE(mb.in_total, 0) - COALESCE(mo.out_total, 0)) AS curInven,
    GREATEST(
      m.save_inven - (COALESCE(mb.in_total, 0) - COALESCE(mo.out_total, 0)),
      0
    ) AS insInven

  FROM mat_tbl m
  LEFT JOIN client_tbl c
    ON m.sup = c.client_code
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

  // 발주 자재별 목록 조회
  selectPoListFlat: `
  SELECT
    d.mpo_d_code                        AS id,

    t.purchase_code                     AS purchaseCode,   -- 발주서번호
    DATE(t.purchase_req_date)          AS purchaseDate,    -- 발주제안일
    t.stat                              AS stat,           -- 발주상태
    t.mcode                             AS mcode,          -- 작성자
    DATE(t.regdate)                    AS regDate,         -- 등록일자

    mb.mat_type                         AS type,           -- 자재유형 코드

    m.mat_name                          AS matName,        -- 자재명

    c.client_name                       AS clientName,     -- 공급업체

    d.req_qtt                           AS req_qtt,        -- 필요수량
    d.deadline                          AS deadLine        -- 입고납기일

  FROM mpo_tbl t
  JOIN mpo_d_tbl d
    ON t.purchase_code = d.purchase_code

  LEFT JOIN mat_tbl m
    ON d.mat_code = m.mat_code

  LEFT JOIN (
    SELECT
      mat_code,
      MAX(mat_type) AS mat_type
    FROM minbnd_tbl
    GROUP BY mat_code
  ) mb
    ON d.mat_code = mb.mat_code

  LEFT JOIN client_tbl c
    ON m.sup = c.client_code

  WHERE 
    (? IS NULL OR t.purchase_code LIKE CONCAT('%', ?, '%'))

  ORDER BY
    t.purchase_code DESC,
    d.mpo_d_code
`,

  selectDeptName: `
  SELECT d.dept_name AS deptName
  FROM dept_tbl d
  JOIN emp_tbl e
  ON e.dept_code = d.dept_code
  WHERE e.emp_code = ?`,

  // mpr_tbl 헤더  INSERT
  insertMprHeader: `
    INSERT INTO mpr_tbl (
      mpr_code,
      reqdate,
      deadline,
      mrp_code,
      mcode
    ) VALUES (?, ?, ?, ?, ?)
  `,

  // mpr_d_tbl 상세 INSERT
  insertMprDetail: `
    INSERT INTO mpr_d_tbl (
      mpr_d_code,
      req_qtt,
      unit,
      note,
      mpr_code,
      mat_sup,
      mat_code
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `,

  // 자재 구매요청서 목록 조회
  selectMprList: `
  SELECT
    h.mpr_code AS mprCode,           -- 요청서 번호
    h.reqdate  AS reqDate,           -- 요청일
    h.mcode    AS mCode,             -- 요청자(사원코드)

    CASE
      WHEN COUNT(d.mpr_d_code) = 0 THEN ''
      WHEN COUNT(d.mpr_d_code) = 1 THEN MIN(m.mat_name)
      ELSE CONCAT(MIN(m.mat_name), ' 외 ', COUNT(d.mpr_d_code) - 1, '건')
    END AS matName
  FROM mpr_tbl h
  LEFT JOIN mpr_d_tbl d
    ON h.mpr_code = d.mpr_code
  LEFT JOIN mat_tbl m
    ON d.mat_code = m.mat_code
  WHERE
    (? IS NULL OR h.mpr_code LIKE CONCAT('%', ?, '%'))
  GROUP BY
    h.mpr_code,
    h.reqdate,
    h.mcode
  ORDER BY
    h.mpr_code DESC
`,

  // 자재 구매요청서 헤더 단건 조회
  selectMprHeaderByCode: `
  SELECT
    mpr_code,
    reqdate,
    deadline,
    mrp_code,
    mcode
  FROM mpr_tbl
  WHERE mpr_code = ?
`,

  // 자재 구매요청서 상세 조회
  selectMprDetailsByCode: `
  SELECT
    d.mpr_d_code        AS mpr_d_code,
    d.mat_code          AS mat_code,
    d.req_qtt           AS req_qtt,
    d.unit              AS unit,
    d.note              AS note,
    d.mat_sup           AS mat_sup,
    h.deadline          AS deadline,

    m.mat_name          AS matName,

    mb.mat_type         AS matType,
    COALESCE(mb.in_total, 0) AS inTotal,
    COALESCE(mo.out_total, 0) AS outTotal,
    (COALESCE(mb.in_total, 0) - COALESCE(mo.out_total, 0)) AS curInven,
    GREATEST(
      m.save_inven - (COALESCE(mb.in_total, 0) - COALESCE(mo.out_total, 0)),
      0
    ) AS insInven,

    c.client_name       AS clientName
  FROM mpr_d_tbl d
  JOIN mpr_tbl h
    ON d.mpr_code = h.mpr_code
  LEFT JOIN mat_tbl m
    ON d.mat_code = m.mat_code
  LEFT JOIN client_tbl c
    ON d.mat_sup = c.client_code
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
  WHERE d.mpr_code = ?
  ORDER BY d.mpr_d_code
`,

  selectClientList: `
 SELECT 
        client_code AS clientCode,
        client_name AS clientName,
        client_type AS clientType
      FROM client_tbl
      WHERE 1 = 1`,
};
