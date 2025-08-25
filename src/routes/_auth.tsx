import type { LoginResponse, User } from "@/utils/models";

export const auth = {
  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('jwt_token');
    if (!token) return false;
    
    try {
      // Basic JWT validation (you might want to add expiration check)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      // Check if token is expired
      if (payload.exp && payload.exp < currentTime) {
        localStorage.removeItem('jwt_token');
        return false;
      }
      
      return true;
    } catch (error) {
      localStorage.removeItem('jwt_token');
      return false;
    }
  },

  // Login function
  login: async (email: string, password: string): Promise<LoginResponse> => {
    try {
      // Replace this with your actual API endpoint
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await response.json();
      
      if (data.token) {
        localStorage.setItem('jwt_token', data.token);
        return { success: true, user: data.user };
      }
      
      throw new Error('No token received');
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Logout function
  logout: () => {
    localStorage.removeItem('jwt_token');
    window.location.href = '/login';
  },

  // Get current user info from token
  getCurrentUser: (): User | null => {
    const token = localStorage.getItem('jwt_token');
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch (error) {
      return null;
    }
  },

  // Get token for API requests
  getToken: (): string | null => {
    return localStorage.getItem('jwt_token');
  }
};