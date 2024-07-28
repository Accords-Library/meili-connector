import {
  convertChangeToMeiliDocumentRequest,
  getMeiliDocumentsFromRequest,
} from "src/convert";
import { meili } from "src/services";
import { MeiliIndexes } from "src/shared/meilisearch/constants";
import type { MeiliDocument } from "src/shared/meilisearch/types";
import type { EndpointChange } from "src/shared/payload/webhooks";

export const webhookHandler = async (changes: EndpointChange[]) => {
  const index = meili.index(MeiliIndexes.DOCUMENT);

  const documents: MeiliDocument[] = [];
  for (const change of changes) {
    await index.deleteDocuments({
      filter: `endpointCalled = "${change.url}"`,
    });

    const meiliDocRequest = convertChangeToMeiliDocumentRequest(change);
    if (!meiliDocRequest) continue;
    documents.push(...(await getMeiliDocumentsFromRequest(meiliDocRequest)));
  }

  console.log("[Webhook] Adding", documents.length, "documents to Meilisearch");

  await index.addDocuments(documents);
};
