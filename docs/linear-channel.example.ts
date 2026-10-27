/**
 * Optional Linear channel. Copy to `linear.ts` when `LINEAR_CONNECTOR` is set.
 *
 * @see https://github.com/vercel-labs/eve-software-factory-template/blob/main/agent/channels/linear.ts
 */
import { connectLinearCredentials } from "@vercel/connect/eve";
import { defaultLinearAuth, linearChannel } from "eve/channels/linear";
import { LINEAR_CONNECTOR } from "../lib/linear-auth.js";
import { stampTrusted } from "../lib/trust.js";

export default linearChannel({
  credentials: connectLinearCredentials(LINEAR_CONNECTOR),
  onAgentSession: (_ctx, event) => {
    if (event.action !== "created" && event.action !== "prompted") {
      return null;
    }
    const requester = event.agentActivity?.user ?? event.agentSession.creator;
    const context: string[] = [];
    const requesterName = requester?.displayName ?? requester?.name;
    if (requesterName) {
      context.push(`The requesting user is ${requesterName}.`);
    }
    return { auth: stampTrusted(defaultLinearAuth(event)), context };
  },
});
