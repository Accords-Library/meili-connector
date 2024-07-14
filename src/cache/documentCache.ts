import type { Meilisearch } from "meilisearch";
import { getMeiliDocumentsFromRequest } from "src/convert";
import { MeiliIndexes } from "src/shared/meilisearch/constants";
import type {
  MeiliDocument,
  MeiliDocumentRequest,
} from "src/shared/meilisearch/types";
import { getLogger } from "src/utils/logger";

export class DocumentInvalidator {
  private readonly logger = getLogger("[DocumentInvalidator]");
  constructor(private readonly meili: Meilisearch) {}

  async invalidate(urls: string[]) {
    const index = this.meili.index(MeiliIndexes.DOCUMENT);

    const documentRequests: MeiliDocumentRequest[] = [];

    for (const url of urls) {
      const result = await index.search(undefined, {
        filter: `endpointCalled = "${url}"`,
        limit: 1,
      });

      const doc = result.hits[0] as MeiliDocument | undefined;
      if (!doc) continue;

      await index.deleteDocument(doc.docId);
      documentRequests.push(doc);
    }

    const documents: MeiliDocument[] = [];
    for (const request of documentRequests) {
      try {
        documents.push(...(await getMeiliDocumentsFromRequest(request)));
      } catch (e) {
        this.logger.log("Failure to revalidate a document");
      }
    }

    this.logger.log(
      "Adding",
      documents.length,
      "documents to Meilisearch"
    );

    await index.addDocuments(documents);
  }
}
