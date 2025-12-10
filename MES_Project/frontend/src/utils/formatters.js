/**
 * formatters.js
 * 공통으로 사용되는 포맷팅 헬퍼 함수들
 */

/**
 * ISO 날짜 문자열을 'YYYY-MM-DD' 형식으로 변환합니다.
 * @param {string} isoString - ISO 8601 형식의 날짜 문자열
 * @returns {string} 'YYYY-MM-DD' 형식의 문자열. 입력값이 없으면 빈 문자열 반환.
 */
export const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * 텍스트를 주어진 최대 길이에 맞춰 자르고, '...'을 붙입니다.
 * @param {string} text - 원본 텍스트
 * @param {number} maxLength - 최대 길이
 * @returns {string} 변환된 텍스트
 */
export const truncateText = (text, maxLength) => {
    if (!text) return '';
    if (text.length > maxLength) {
        return text.substring(0, maxLength) + '...';
    }
    return text;
};

// --- InOutHistory.vue 용 포맷터 ---

/**
 * 입출고 유형(IN/OUT)을 한글 레이블로 변환합니다.
 * @param {string} type - 'IN' 또는 'OUT'
 * @returns {string} '입고' 또는 '출고'
 */
export const getHistoryTypeLabel = (type) => (type === 'IN' ? '입고' : '출고');

/**
 * 입출고 유형에 따른 PrimeVue Tag의 severity를 반환합니다.
 * @param {string} type - 'IN' 또는 'OUT'
 * @returns {string} 'success' 또는 'warn'
 */
export const getHistoryTypeSeverity = (type) => (type === 'IN' ? 'success' : 'warn');

/**
 * 입출고 처리 상태를 한글 레이블로 변환합니다.
 * @param {string} status - 'COMPLETED', 'PENDING', 'CANCELLED'
 * @returns {string} '완료', '대기', '취소'
 */
export const getHistoryStatusLabel = (status) => {
    const map = { COMPLETED: '완료', PENDING: '대기', CANCELLED: '취소' };
    return map[status] || status;
};

// --- StockList.vue 용 포맷터 ---

/**
 * 재고 상태를 한글 레이블로 반환합니다. (StockList.vue 전용)
 * @param {string} status - 재고 상태
 * @returns {string} 재고 상태 레이블
 */
export const getStockStatusLabel = (status) => status;

/**
 * 재고 상태에 따른 CSS 클래스를 반환합니다.
 * @param {string} status - '정상', '부족', '과다', '발주 필요'
 * @returns {string} CSS 클래스명
 */
export const getStockStatusDotClass = (status) => {
    switch (status) {
        case '정상':
            return 'status-normal';
        case '부족':
            return 'status-insufficient';
        case '과다':
            return 'status-excess';
        case '발주 필요':
            return 'status-reorder';
        default:
            return 'status-unknown';
    }
};
