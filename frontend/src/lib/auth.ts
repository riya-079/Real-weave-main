export type UserSession = {
  name: string;
  email: string;
};

const USERS_KEY = 'real-weave-users';
const SESSION_KEY = 'real-weave-session';
const DEMO_USER = {
  name: 'Demo Operator',
  email: 'demo@realweave.local',
  password: 'demo1234',
};

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') {
    return fallback;
  }

  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function getCurrentUser(): UserSession | null {
  return readJson<UserSession | null>(SESSION_KEY, null);
}

export function isAuthenticated(): boolean {
  return Boolean(getCurrentUser());
}

export function registerUser(name: string, email: string, password: string): UserSession {
  const users = readJson<Array<UserSession & { password: string }>>(USERS_KEY, []);
  const normalizedEmail = email.trim().toLowerCase();

  if (users.some((user) => user.email.toLowerCase() === normalizedEmail)) {
    throw new Error('An account with this email already exists.');
  }

  const session: UserSession = {
    name: name.trim(),
    email: normalizedEmail,
  };

  users.push({ ...session, password });
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));

  return session;
}

export function loginUser(email: string, password: string): UserSession {
  const users = readJson<Array<UserSession & { password: string }>>(USERS_KEY, []);
  const normalizedEmail = email.trim().toLowerCase();
  const isDemoLogin = normalizedEmail === DEMO_USER.email && password === DEMO_USER.password;

  if (isDemoLogin) {
    const session: UserSession = {
      name: DEMO_USER.name,
      email: DEMO_USER.email,
    };

    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  }

  const user = users.find((candidate) => candidate.email.toLowerCase() === normalizedEmail && candidate.password === password);

  if (!user) {
    throw new Error('Invalid email or password.');
  }

  const session: UserSession = {
    name: user.name,
    email: user.email,
  };

  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function signOutUser(): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(SESSION_KEY);
}
