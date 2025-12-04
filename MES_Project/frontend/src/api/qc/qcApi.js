import api from '../api';

export async function apiTest() {
  try {
    const result = await api.get('/api/');
    return result;
  } catch (err) {
    console.log('에러 발생: ', err);
  }
}
