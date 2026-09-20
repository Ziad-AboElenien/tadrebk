// In-memory only (never persisted): lets the confirm-email page log the user
// in right after verification without asking for the password again.
// Cleared on consume; a page refresh loses it and falls back to manual login.

interface PendingCredentials {
  email: string;
  password: string;
}

let pending: PendingCredentials | null = null;

export function setPendingCredentials(creds: PendingCredentials) {
  pending = creds;
}

export function takePendingCredentials(): PendingCredentials | null {
  const creds = pending;
  pending = null;
  return creds;
}
