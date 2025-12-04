const QC_SEARCH = `
SELECT
  qir.qir_code,
  p.prod_code,
  p.prod_name,
  qcr.qcr_code,
  qcr.check_method,
  qcr.note,
  c.note AS unit,
  qir.result,
  qir.start_date
FROM qir_tbl qir
JOIN qcr_tbl qcr ON qir.qcr_code = qcr.qcr_code
JOIN qio_tbl qio ON qir.qio_code = qio.qio_code
JOIN prdr_tbl prdr ON qio.prdr_code = prdr.prdr_code
JOIN prod_tbl p ON prdr.prod_code = p.prod_code
JOIN common_code c ON c.com_value = qcr.unit
WHERE (? IS NULL OR qcr.qcr_code = ?)
AND (? IS NULL OR p.prod_code LIKE CONCAT('%', ?, '%'))
AND (? IS NULL OR p.prod_name LIKE CONCAT('%', ?, '%'))
AND (? IS NULL OR qcr.check_method LIKE CONCAT('%', ?, '%'))
AND (? IS NULL OR qir.result = ?)
AND (? IS NULL OR qir.start_date = ?)
ORDER BY qir.start_date DESC
`;

const QC_PENDING_LIST = `
SELECT qir_code FROM qir_tbl
WHERE result = 'g0'
`;

const QC_INSTRUCTION = `
SELECT 
	qir.qir_code,
  qir.qcr_code,
	qio.qio_code,
  qio.insp_vol,
  p.prod_name,
  qcr.check_method,
  qcr.range_top,
  qcr.range_bot,
  qcr.unit    
FROM qir_tbl qir
JOIN qio_tbl qio ON qir.qio_code = qio.qio_code
JOIN qcr_tbl qcr ON qcr.qcr_code = qir.qcr_code
JOIN prdr_tbl prdr ON prdr.prdr_code = qio.prdr_code
JOIN prod_tbl p ON p.prod_code = prdr.prod_code
WHERE qir.qir_code = ?
`;

const QC_INSTRUCTION_SAVE = `
UPDATE qir_tbl
SET result = ?
WHERE qir_code = ?
`;

const QC_INSTRUCTION_DELETE = `
DELETE FROM qir_tbl
WHERE qir_code = ?
`;

module.exports = {
  QC_SEARCH,
  QC_PENDING_LIST,
  QC_INSTRUCTION,
  QC_INSTRUCTION_SAVE,
  QC_INSTRUCTION_DELETE,
};
