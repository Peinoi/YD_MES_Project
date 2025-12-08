const plan = `
    SELECT
        T1.prdp_code AS 계획번호,
        T1.prdp_date AS 계획일자,
        T1.due_date AS 납기일자,
        T1.prdp_name AS 계획명,
        T2.wko_code AS 작업지시번호,
        T3.prod_name AS 제품명,
        T2.wko_qtt AS 지시수량,
        T2.start_date AS 작업시작일시,
        T2.end_date AS 예상완료일시,
        T2.stat AS 상태,
        T2.line_code AS 작업라인코드
    FROM
        prdp_tbl T1 
    JOIN
        wko_tbl T2 ON T1.prdp_code = T2.prdp_code 
    JOIN
        prod_tbl T3 ON T2.prod_code = T3.prod_code;
`;

const planCheck = `
    SELECT COUNT(*) AS cnt
    FROM wko_tbl
    WHERE wko_code = ?;
`;

const updatePrdp = `
UPDATE prdp_tbl
SET 
    due_date = ? 
WHERE 
    prdp_code = ?;
`;

const updateWko = `
UPDATE wko_tbl
SET 
    wko_qtt = ?,
    start_date = ?,
    end_date = ?,
    stat = ?,
    line_code = ?
WHERE 
    wko_code = ?;
`;

module.exports = {
  plan,
  planCheck,
  updatePrdp,
  updateWko,
};
