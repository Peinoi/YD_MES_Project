import { DateTime } from 'luxon';

export function dateTime() {
    return DateTime.now().setZone('Asia/Seoul').toFormat('yyyy-MM-dd HH:mm:ss');
}

export function kstFormat(date) {
    if (!date) return null;
    return DateTime.fromJSDate(date, { zone: 'utc' }).setZone('Asia/Seoul').toFormat('yyyy-MM-dd');
}
