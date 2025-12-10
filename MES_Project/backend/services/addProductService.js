const { query } = require("../database/mapper");
const sql = require("../database/sqlList");

module.exports = {
  async getNextProdCode() {
    const row = await query("prod_next_code");
    return `PROD-${row[0].nextSeq}`;
  },

  async insertProduct(data) {
    // 1. 단위 (unit) 처리
    const unit =
      typeof data.unit === "object"
        ? data.unit.value
        : String(data.unit || "").trim(); // 2. 제품 유형 (prod_type) 처리

    const prod_type =
      typeof data.prod_type === "object"
        ? data.prod_type.value
        : String(data.prod_type || "").trim();

    // 3. 사용 여부 (is_used) 처리 (새로 추가)
    const is_used =
      typeof data.is_used === "object"
        ? data.is_used.value
        : String(data.is_used || "").trim();

    // 4. 기업 코드 (com_value) 처리 (안전성 확보)
    const com_value =
      typeof data.com_value === "object"
        ? data.com_value.value
        : String(data.com_value || "").trim();

    const params = [
      String(data.prod_code || "").trim(),
      String(data.prod_name || ""),
      is_used, // 👈 수정된 값 사용
      data.edate ?? null,
      unit,
      data.spec || "",
      data.note || "",
      com_value, // 👈 수정된 값 사용
      data.reg || "",
      prod_type,
    ];

    console.log("INSERT PARAMS >>>", params);

    return await query("prod_insert", params);
  },
  async getEmpList() {
    const rows = await query("emp_list");

    return rows.map((r) => ({
      emp_code: r.emp_code,
      emp_name: r.emp_name,
      emp_job_id: r.emp_job_id,
    }));
  },
};
