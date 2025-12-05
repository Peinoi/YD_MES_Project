export function yymmddFormat(date) {
    const d = new Date(date);
    const yy = String(d.getFullYear()).slice(2);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yy}-${mm}-${dd}`;
}

export function dateFormatUtil() {
    const now = new Date();
    const kstTime = new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false, // 24시간 형식
        timeZone: 'Asia/Seoul' // 한국 표준시 명시
    }).format(now);
    return kstTime;
}
