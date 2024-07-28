import { convertEndpointChangeToMeiliDocuments } from "src/convert";
import { meili } from "src/services";
import { MeiliIndexes } from "src/shared/meilisearch/constants";
import type { MeiliDocument } from "src/shared/meilisearch/types";
import type { EndpointChange } from "src/shared/payload/webhooks";

export const webhookHandler = async (changes: EndpointChange[]) => {
  const index = meili.index(MeiliIndexes.DOCUMENT);

  console.log("[Webhook] Received the following message", changes);

  const documents: MeiliDocument[] = [];
  for (const change of changes) {
    await index.deleteDocuments({
      filter: `endpointCalled = "${change.url}"`,
    });
    try {
      documents.push(...(await convertEndpointChangeToMeiliDocuments(change)));
    } catch (e) {
      console.log("[Webhook] Failure to revalidate", change.url);
    }
  }

  console.log("[Webhook] Adding", documents.length, "documents to Meilisearch");

  await index.addDocuments(documents);
};
