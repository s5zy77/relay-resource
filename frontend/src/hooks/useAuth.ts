import { useMutation, useQuery } from '@tanstack/react-query';
import { authApi, LoginCredentials, SignupCredentials, VendorSignupCredentials } from '../api/auth';
import { useSessionStore } from '../stores/sessionStore';

export const useAuth = () => {
  const { user, isAuthenticated, role, setSession, clearSession } = useSessionStore();

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
    onSuccess: (data) => {
      setSession(data.user, data.token);
    }
  });

  const signupMutation = useMutation({
    mutationFn: (credentials: SignupCredentials) => authApi.signup(credentials),
    onSuccess: (data) => {
      setSession(data.user, data.token);
    }
  });

  const vendorSignupMutation = useMutation({
    mutationFn: (credentials: VendorSignupCredentials) => authApi.vendorSignup(credentials),
    onSuccess: (data) => {
      setSession(data.user, 'mock-jwt-token-vendor');
    }
  });

  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      clearSession();
    }
  });

  return {
    user,
    isAuthenticated,
    role,
    login: loginMutation.mutateAsync,
    signup: signupMutation.mutateAsync,
    vendorSignup: vendorSignupMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    isLoading: loginMutation.isPending || signupMutation.isPending || vendorSignupMutation.isPending
  };
};
