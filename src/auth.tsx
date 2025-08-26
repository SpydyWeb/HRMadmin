// src/auth.tsx
export const auth = {
  _token: null as string | null,

  isAuthenticated: () => {
   // return true;
    const token = auth._token;
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      if (payload.exp && payload.exp < currentTime) {
        auth._token = null;
        return false;
      }
      return true;
    } catch {
      auth._token = null;
      return false;
    }
  },

  login: async (email: string, password: string) => {
      auth._token = email;

    if (email === 'admin@company.com' && password === 'password123') {
      const mockPayload = {
        sub: '1',
        name: 'Admin User',
        role: 'admin',
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24h expiry
      };
      const mockToken = 'header.' + btoa(JSON.stringify(mockPayload)) + '.signature';
      auth._token = mockToken;
      return { success: true, user: mockPayload };
    }
    return { success: false, error: 'Invalid credentials' };
  },

  logout: () => {
    auth._token = null;
  },

  getCurrentUser: () => {
    if (!auth._token) return null;
    try {
      return JSON.parse(atob(auth._token.split('.')[1]));
    } catch {
      return null;
    }
  },

  getToken: () => auth._token,
};
