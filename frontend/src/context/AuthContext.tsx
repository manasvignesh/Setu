import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';

export const DUMMY_USERS: Record<'teacher' | 'student' | 'coordinator', { user: User; token: string }> = {
  teacher: {
    token: 'dummy-setu-token-teacher',
    user: {
      id: 'demo-teacher-anita',
      email: 'teacher.anita@setu.edu.in',
      full_name: 'Anita Sharma',
      role: 'teacher',
      school_id: 'school-pmshri-501218',
      onboarding_completed: true,
      created_at: new Date().toISOString()
    }
  },
  student: {
    token: 'dummy-setu-token-student',
    user: {
      id: 'demo-student-aarav',
      email: 'aarav.sharma@setu.edu.in',
      full_name: 'Aarav Sharma',
      role: 'student',
      school_id: 'school-pmshri-501218',
      onboarding_completed: true,
      disability_profiles: [
        {
          disability_type: 'hearing',
          severity: 'moderate',
          preferences_json: '{"captions": true, "visual_cues": true}'
        }
      ],
      created_at: new Date().toISOString()
    }
  },
  coordinator: {
    token: 'dummy-setu-token-coordinator',
    user: {
      id: 'demo-coordinator-sunita',
      email: 'coordinator@setu.edu.in',
      full_name: 'Dr. Sunita Rao',
      role: 'coordinator',
      school_id: 'school-pmshri-501218',
      onboarding_completed: true,
      created_at: new Date().toISOString()
    }
  }
};

interface AuthContextType {
  user: User;
  token: string;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  selectDemoRole: (role: 'teacher' | 'student' | 'coordinator') => void;
  quickDemoLogin: (role: 'teacher' | 'coordinator') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string>(() => {
    return localStorage.getItem('setu_auth_token') || DUMMY_USERS.teacher.token;
  });
  const [user, setUser] = useState<User>(() => {
    const stored = localStorage.getItem('setu_auth_user');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // Fallback to dummy
      }
    }
    return DUMMY_USERS.teacher.user;
  });

  useEffect(() => {
    // Ensure default dummy values are stored so downstream components find them
    if (!localStorage.getItem('setu_auth_token')) {
      localStorage.setItem('setu_auth_token', token);
    }
    if (!localStorage.getItem('setu_auth_user')) {
      localStorage.setItem('setu_auth_user', JSON.stringify(user));
    }
    if (!localStorage.getItem('setu_disability_profile')) {
      localStorage.setItem('setu_disability_profile', JSON.stringify(['hearing']));
    }
  }, [token, user]);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('setu_auth_token', newToken);
    localStorage.setItem('setu_auth_user', JSON.stringify(newUser));
  };

  const selectDemoRole = (role: 'teacher' | 'student' | 'coordinator') => {
    const profile = DUMMY_USERS[role];
    setToken(profile.token);
    setUser(profile.user);
    localStorage.setItem('setu_auth_token', profile.token);
    localStorage.setItem('setu_auth_user', JSON.stringify(profile.user));
    localStorage.setItem('setu_user_role', role);
    localStorage.setItem('setu_user_name', profile.user.full_name);
    if (role === 'student') {
      localStorage.setItem('setu_disability_profile', JSON.stringify(['hearing']));
    }
  };

  const logout = () => {
    // Reset to demo teacher entry
    selectDemoRole('teacher');
  };

  const quickDemoLogin = async (role: 'teacher' | 'coordinator') => {
    selectDemoRole(role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: true,
        login,
        logout,
        selectDemoRole,
        quickDemoLogin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
