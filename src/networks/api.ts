import { getPairTokens, removePairTokens } from "../libs/token";
import { Modal, notification } from "antd";
import axios from "axios";
import { AuthAPIs } from "./auth.api";

// 🧩 Instance หลัก
export const api = axios.create({
  baseURL: "/api",
  // timeout: 30000,
});

// 🧩 Instance พิเศษ (ไม่ต้องแจ้งเตือน)
export const apiWithoutNotification = axios.create({
  baseURL: "/api",
  // timeout: 30000,
});

// 🧩 Instance สำหรับ request ไม่ต้องส่ง token (เช่น login/register)
export const apiWithoutAuth = axios.create({
  baseURL: "/api",
  // timeout: 30000,
});

// ------------------------
// 🧠 Request Interceptors
// ------------------------
const attachToken = (config: any) => {
  const { accessToken } = getPairTokens();
  if (accessToken) {
    config.headers["Authorization"] = `Bearer ${accessToken}`;
  }
  return config;
};

api.interceptors.request.use(attachToken);
apiWithoutNotification.interceptors.request.use(attachToken);

// ------------------------
// 🧠 Response Interceptors
// ------------------------
const handleResponseError = async (error: any, instance: any) => {
  const originalRequest = error.config;

  // ✅ ป้องกันไม่ให้ /auth/login โดน redirect
  if (originalRequest?.url?.includes("/auth/login")) {
    return Promise.reject(error);
  }

  // ✅ ป้องกันไม่ให้ /v1/auth/login โดน redirect (กรณี backend มี prefix)
  if (originalRequest?.url?.includes("/v1/auth/login")) {
    return Promise.reject(error);
  }

  // ------------------------------
  // ✅ ❷ logic refresh token เดิม
  // ------------------------------
  if (
    error.response?.status === 401 &&
    !originalRequest._retry &&
    !originalRequest.url.includes("/v1/auth/refresh-token")
  ) {
    originalRequest._retry = true;

    try {
      const { refreshToken } = getPairTokens();
      if (!refreshToken) throw new Error("No refresh token");

      const res = await AuthAPIs.refreshToken();
      const newAccessToken = res.data?.access_token;

      if (newAccessToken) {
        localStorage.setItem("access_token", newAccessToken);
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return instance(originalRequest);
      }
    } catch (err) {
      // ❌ ถ้า refresh ล้มเหลว → เคลียร์ token แล้ว redirect
      removePairTokens();
      localStorage.clear();
      sessionStorage.clear();

      document.cookie.split(";").forEach(function (c) {
        document.cookie = c
          .trim()
          .replace(/^.+/, `expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`);
      });

      window.location.href = "/login";
    }
  }

  // 🧩 กัน loop กรณี /me
  if (originalRequest?.url?.includes("/v1/auth/me")) {
    removePairTokens();
  }

  // 🧩 แจ้งเตือน error สำหรับ instance หลัก
  if (instance === api) {
    notification.error({
      placement: "topRight",
      message:
        error.response?.data?.message ||
        "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้งภายหลัง",
    });
  }

  return Promise.reject(error);
};

api.interceptors.response.use(
  (response) => response,
  (error) => handleResponseError(error, api)
);

apiWithoutNotification.interceptors.response.use(
  (response) => response,
  (error) => handleResponseError(error, apiWithoutNotification)
);
