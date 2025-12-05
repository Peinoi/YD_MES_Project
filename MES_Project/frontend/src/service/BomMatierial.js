import axios from 'axios';
export const onCreate = async () => {
    const payload = {
        bomCode: detailForm.value.bomCode, // 'PROD_001' 같은 제품코드
        prodCode: detailForm.value.bomCode,
        materials: subMaterialList.value.map((m) => ({
            mat_code: m.materialCode,
            mat_name: m.materialName,
            mat_type: m.materialType,
            req_qtt: Number(m.qty),
            unit: m.unit,
            loss_rate: Number(m.lossRate)
        }))
    };

    await axios.post('/api/baseinfo/bom/save', payload);
};
