const accessTokenKey = "access_token";
const refreshTokenKey = "refresh_token";

const kcAccessTokenKey = "kc_access_token";
const kcRefreshTokenKey = "kc_refresh_token";
export const getPairTokens = () => {
  const accessToken = localStorage.getItem(accessTokenKey);
  const refreshToken = localStorage.getItem(refreshTokenKey);

  return { accessToken, refreshToken };
};

export const getKcPairTokens = () => {
  const accessToken = localStorage.getItem(kcAccessTokenKey);
  const refreshToken = localStorage.getItem(kcRefreshTokenKey);

  return { accessToken, refreshToken };
};

export const setKeycloakToken = (accessToken: string, refreshToken: string) => {
  localStorage.setItem(kcAccessTokenKey, accessToken);
  localStorage.setItem(kcRefreshTokenKey, refreshToken);
};

export const setPairTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem(accessTokenKey, accessToken);
  localStorage.setItem(refreshTokenKey, refreshToken);
};

export const removePairTokens = () => {
  localStorage.setItem(accessTokenKey, "");
  localStorage.setItem(refreshTokenKey, "");
  localStorage.removeItem(accessTokenKey);
  localStorage.removeItem(refreshTokenKey);
  localStorage.clear();
};
