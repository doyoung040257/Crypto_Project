import axios from "axios";

const BASE_URL = "http://localhost:8080/api/market";

// 🔹 상위 20개 코인
export const getMarketTickers = () => {
  return axios.get(`${BASE_URL}/top20`);
};

// 🔹 코인 상세 정보
export const getCoinDetail = (coinId) => {
  return axios.get(`${BASE_URL}/detail`, {
    params: { coinId },
  });
};

// 🔹 코인 차트 데이터
export const getCoinKlines = (coinId, days = 30) => {
  return axios.get(`${BASE_URL}/chart`, {
    params: { coinId, days },
  });
};

const marketApi = {
  getMarketTickers,
  getCoinDetail,
  getCoinKlines,
};

export default marketApi;
