import { connect } from "@vercel/connect/eve";

/**
 * Linear connector UID when Linear integration is enabled.
 */
export const LINEAR_CONNECTOR = process.env.LINEAR_CONNECTOR?.trim() ?? "";

export const isLinearEnabled = () => LINEAR_CONNECTOR.length > 0;

/**
 * App-scoped Linear auth for the MCP connection and direct API calls.
 *
 * @remarks
 * Only available when `LINEAR_CONNECTOR` is set. GitHub-only deployments omit
 * Linear entirely.
 */
export const createLinearAuth = () =>
  connect({
    connector: LINEAR_CONNECTOR,
    principalType: "app",
    tokenParams: {
      scopes: ["read", "write", "issues:create", "comments:create"],
    },
  });
