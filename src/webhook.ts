import { dataCache } from "src/services";
import type { AfterOperationWebHookMessage } from "src/shared/payload/webhooks";

export const webhookHandler = async ({
  id,
  addedDependantIds,
  urls,
}: AfterOperationWebHookMessage) => {
  await dataCache.invalidate([...(id ? [id] : []), ...addedDependantIds], urls);
};
