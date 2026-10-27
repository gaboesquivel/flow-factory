import type { SessionAuthContext } from "eve/context";

/**
 * Constructed principal for unattended factory runs (an issue labeled
 * `factory`).
 *
 * @remarks
 * Real GitHub actors project as numeric `github:<id>` principals, so this
 * fixed login can never collide with one. The GitHub channel stamps it at
 * dispatch; the approval policies deny it everything except labels, progress
 * comments on its own intake issue, closing or reopening issues, and draft
 * pull requests, because an unattended turn has nobody to answer an approval
 * card and would park forever.
 */
export const AUTONOMOUS_PRINCIPAL = "github:foreman-factory";

/**
 * Auth attribute marking a caller the dispatching channel decided to trust.
 *
 * @remarks
 * Trust is decided once, at dispatch, on the signed webhook: the GitHub
 * channel stamps it only for commenters whose `author_association` is
 * OWNER, MEMBER, or COLLABORATOR; the Linear channel stamps it for every
 * Agent Session, because workspace membership is the gate there. Nothing
 * downstream re-derives trust from model-readable content.
 */
export const TRUSTED_ATTRIBUTE = "trusted";

/**
 * Returns a copy of `auth` carrying the {@link TRUSTED_ATTRIBUTE} stamp.
 *
 * @remarks
 * Channels call this at dispatch, next to the authorization decision itself,
 * so the stamp and the gate can never drift apart.
 */
export function stampTrusted(auth: SessionAuthContext): SessionAuthContext {
  return {
    ...auth,
    attributes: { ...auth.attributes, [TRUSTED_ATTRIBUTE]: "true" },
  };
}

/**
 * Auth attribute carrying the issue number an unattended run was dispatched
 * from.
 *
 * @remarks
 * Stamped by {@link stampAutonomous} at dispatch, on the signed webhook, so
 * the approval policies can scope an unattended run's comment writes to its
 * own intake thread. Attribute values are strings; read it back through
 * {@link intakeIssueNumber}.
 */
export const INTAKE_ISSUE_ATTRIBUTE = "intakeIssue";

/**
 * Auth attribute carrying the pull request an unattended CI-fix run was
 * dispatched from.
 */
export const INTAKE_PULL_REQUEST_ATTRIBUTE = "intakePullRequest";

const stampAutonomousPrincipal = (
  auth: SessionAuthContext,
  attributes: Record<string, string>
): SessionAuthContext => ({
  ...auth,
  attributes: { ...auth.attributes, ...attributes },
  principalId: AUTONOMOUS_PRINCIPAL,
  principalType: "service",
});

/**
 * Unattended issue intake (factory label). Stamps {@link INTAKE_ISSUE_ATTRIBUTE}
 * for {@link commentPolicy} scoping.
 */
export const stampAutonomousForIssue = (
  auth: SessionAuthContext,
  intakeIssue: number
) =>
  stampAutonomousPrincipal(auth, {
    [INTAKE_ISSUE_ATTRIBUTE]: String(intakeIssue),
  });

/**
 * Unattended CI fix on a factory pull request. Stamps
 * {@link INTAKE_PULL_REQUEST_ATTRIBUTE} for {@link pullRequestCommentPolicy}.
 */
export const stampAutonomousForPullRequest = (
  auth: SessionAuthContext,
  pullNumber: number
) =>
  stampAutonomousPrincipal(auth, {
    [INTAKE_PULL_REQUEST_ATTRIBUTE]: String(pullNumber),
  });

/** @deprecated Use {@link stampAutonomousForIssue} or {@link stampAutonomousForPullRequest}. */
export const stampAutonomous = stampAutonomousForIssue;

/**
 * The issue number an unattended run was dispatched from, or null when the
 * session is not an unattended run (or predates the stamp).
 */
export function intakeIssueNumber(
  auth: SessionAuthContext | null
): number | null {
  if (!isAutonomous(auth)) {
    return null;
  }
  const stamped = auth?.attributes[INTAKE_ISSUE_ATTRIBUTE];
  if (typeof stamped !== "string" || stamped === "") {
    return null;
  }
  const issue = Number(stamped);
  return Number.isSafeInteger(issue) && issue > 0 ? issue : null;
}

export const intakePullRequestNumber = (
  auth: SessionAuthContext | null
): number | null => {
  if (!isAutonomous(auth)) {
    return null;
  }
  const stamped = auth?.attributes[INTAKE_PULL_REQUEST_ATTRIBUTE];
  if (typeof stamped !== "string" || stamped === "") {
    return null;
  }
  const pull = Number(stamped);
  return Number.isSafeInteger(pull) && pull > 0 ? pull : null;
};

/**
 * Whether the session runs unattended under {@link AUTONOMOUS_PRINCIPAL}.
 */
export function isAutonomous(auth: SessionAuthContext | null): boolean {
  return auth !== null && auth.principalId === AUTONOMOUS_PRINCIPAL;
}

/**
 * Whether the dispatching channel stamped this caller as trusted.
 *
 * @remarks
 * This is the single caller check for routine repository writes. New
 * capabilities gate on this predicate (or {@link isAutonomous} /
 * {@link isScheduleAppAuth}) rather than inventing their own.
 */
export function isTrusted(auth: SessionAuthContext | null): boolean {
  return auth !== null && auth.attributes[TRUSTED_ATTRIBUTE] === "true";
}

/**
 * The app principal eve stamps on schedule-dispatched turns.
 *
 * @remarks
 * No schedule ships in this template, but the approval policies already
 * recognize the principal so a schedule added later (see the README's
 * extending section) inherits sensible write behavior: reversible writes run,
 * anything that ships still parks for a person. It is never a user identity.
 */
export function isScheduleAppAuth(auth: SessionAuthContext | null): boolean {
  return (
    auth !== null &&
    auth.authenticator === "app" &&
    auth.principalId === "eve:app" &&
    auth.principalType === "runtime"
  );
}
