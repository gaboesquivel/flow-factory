import { defineDynamic, defineMcpClientConnection } from "eve/connections";
import type { ApprovalContext, ApprovalStatus } from "eve/tools/approval";
import { createLinearAuth, isLinearEnabled } from "../lib/linear-auth.js";
import { isAutonomous } from "../lib/trust.js";

const linearApproval = (ctx: ApprovalContext): ApprovalStatus =>
  isAutonomous(ctx.session.auth.current)
    ? {
        reason: "Unattended factory runs do not write to Linear.",
        type: "denied",
      }
    : "not-applicable";

/**
 * Linear MCP connection (optional). Omitted when `LINEAR_CONNECTOR` is unset.
 */
export default defineDynamic({
  events: {
    "session.started": () => {
      if (!isLinearEnabled()) {
        return null;
      }

      return defineMcpClientConnection({
        approval: linearApproval,
        auth: createLinearAuth(),
        description:
          "Linear workspace: issues, projects, cycles, and comments.",
        url: "https://mcp.linear.app/mcp",
      });
    },
  },
});
