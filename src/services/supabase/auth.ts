import { supabase, isSupabaseConfigured } from './client';
import type { Session, User } from '@supabase/supabase-js';

export interface AuthResponse {
  user: User | null;
  session: Session | null;
  error: string | null;
}

export async function signUpWithEmail(
  email: string,
  password: string,
  displayName?: string
): Promise<AuthResponse> {
  if (!isSupabaseConfigured) {
    // Offline simulation
    const simulatedUser = {
      id: `local-user-${Date.now()}`,
      email,
      user_metadata: { display_name: displayName || email.split('@')[0] },
      app_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    } as unknown as User;

    return { user: simulatedUser, session: null, error: null };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName || email.split('@')[0] },
    },
  });

  return {
    user: data.user,
    session: data.session,
    error: error?.message || null,
  };
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<AuthResponse> {
  if (!isSupabaseConfigured) {
    const simulatedUser = {
      id: `local-user-offline`,
      email,
      user_metadata: { display_name: email.split('@')[0] },
      app_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    } as unknown as User;

    return { user: simulatedUser, session: null, error: null };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return {
    user: data.user,
    session: data.session,
    error: error?.message || null,
  };
}

export async function signOutUser(): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured) {
    return { error: null };
  }

  const { error } = await supabase.auth.signOut();
  return { error: error?.message || null };
}

export async function getActiveSession(): Promise<{ user: User | null; session: Session | null }> {
  if (!isSupabaseConfigured) {
    return { user: null, session: null };
  }

  const { data } = await supabase.auth.getSession();
  return { user: data.session?.user || null, session: data.session };
}

export function subscribeToAuthState(callback: (user: User | null, session: Session | null) => void) {
  if (!isSupabaseConfigured) {
    return () => {};
  }

  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user || null, session);
  });

  return () => data.subscription.unsubscribe();
}

