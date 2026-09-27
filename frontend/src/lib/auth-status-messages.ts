import type { AuthActionType } from "@/context/AuthContext";

export type ResolvedAuthAction = Exclude<AuthActionType, null>;

const DEFAULT_MESSAGES: string[] = [
  "Authenticating in progress",
  "Talking to the auth server",
  "Almost there",
];

/**
 * Rotating copy for the dynamic island auth state. Each action gets a small
 * sequence so the capsule keeps saying something new while the user waits.
 * Keep every entry short — the island locks to one line.
 */
export const AUTH_STATUS_MESSAGES: Record<ResolvedAuthAction, string[]> = {
  verifying: [
    "Verifying your session",
    "Checking credentials",
    "Restoring your workspace",
    "Rehydrating projects",
    "Almost there",
  ],
  login: [
    "Signing you in",
    "Verifying credentials",
    "Preparing your workspace",
    "Syncing repositories",
    "Almost there",
  ],
  register: [
    "Creating your account",
    "Securing credentials",
    "Setting up your workspace",
    "Generating your profile",
    "Almost there",
  ],
  google: [
    "Connecting to Google",
    "Verifying Google account",
    "Linking your identity",
    "Importing your profile",
    "Almost there",
  ],
  github: [
    "Connecting to GitHub",
    "Verifying GitHub account",
    "Syncing repositories",
    "Mapping your access",
    "Almost there",
  ],
};

export function getAuthStatusMessages(action: AuthActionType): string[] {
  if (!action) return DEFAULT_MESSAGES;
  return AUTH_STATUS_MESSAGES[action] ?? DEFAULT_MESSAGES;
}
