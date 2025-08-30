import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '../auth';

// Mock Firebase Auth
const mockSignInAnonymously = vi.fn();
const mockSignOut = vi.fn();
const mockOnAuthStateChanged = vi.fn();
const mockUser = { uid: 'test-uid', isAnonymous: true };

vi.mock('../firebase', () => ({
  auth: {
    signInAnonymously: mockSignInAnonymously,
    signOut: mockSignOut,
    onAuthStateChanged: mockOnAuthStateChanged,
    currentUser: null
  }
}));

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();
    authService = AuthService.getInstance();
  });

  it('should be a singleton', () => {
    const instance1 = AuthService.getInstance();
    const instance2 = AuthService.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('should sign in anonymously', async () => {
    mockSignInAnonymously.mockResolvedValue({ user: mockUser });

    await authService.signInAnonymously();

    expect(mockSignInAnonymously).toHaveBeenCalled();
  });

  it('should handle sign in errors', async () => {
    const error = new Error('Sign in failed');
    mockSignInAnonymously.mockRejectedValue(error);

    await expect(authService.signInAnonymously()).rejects.toThrow('Sign in failed');
  });

  it('should sign out', async () => {
    mockSignOut.mockResolvedValue(undefined);

    await authService.signOut();

    expect(mockSignOut).toHaveBeenCalled();
  });

  it('should handle sign out errors', async () => {
    const error = new Error('Sign out failed');
    mockSignOut.mockRejectedValue(error);

    await expect(authService.signOut()).rejects.toThrow('Sign out failed');
  });

  it('should set up auth state listener', () => {
    const callback = vi.fn();
    mockOnAuthStateChanged.mockReturnValue(() => {});

    authService.onAuthStateChanged(callback);

    expect(mockOnAuthStateChanged).toHaveBeenCalledWith(callback);
  });

  it('should get current user', () => {
    // Mock currentUser property
    const mockAuth = require('../firebase').auth;
    mockAuth.currentUser = mockUser;

    const user = authService.getCurrentUser();

    expect(user).toBe(mockUser);
  });

  it('should get user ID', () => {
    const mockAuth = require('../firebase').auth;
    mockAuth.currentUser = mockUser;

    const userId = authService.getUserId();

    expect(userId).toBe('test-uid');
  });

  it('should return null for user ID when not authenticated', () => {
    const mockAuth = require('../firebase').auth;
    mockAuth.currentUser = null;

    const userId = authService.getUserId();

    expect(userId).toBeNull();
  });

  it('should handle auth state changes', () => {
    const callback = vi.fn();
    let authStateCallback: (user: any) => void;

    mockOnAuthStateChanged.mockImplementation((cb) => {
      authStateCallback = cb;
      return () => {};
    });

    authService.onAuthStateChanged(callback);

    // Simulate user sign in
    authStateCallback!(mockUser);
    expect(callback).toHaveBeenCalledWith(mockUser);

    // Simulate user sign out
    authStateCallback!(null);
    expect(callback).toHaveBeenCalledWith(null);
  });

  it('should return unsubscribe function from auth state listener', () => {
    const unsubscribe = vi.fn();
    mockOnAuthStateChanged.mockReturnValue(unsubscribe);

    const returnedUnsubscribe = authService.onAuthStateChanged(vi.fn());

    expect(returnedUnsubscribe).toBe(unsubscribe);
  });
});