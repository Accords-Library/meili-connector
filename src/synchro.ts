import { getMeiliDocumentsFromRequest } from "src/convert";
import { meili, uncachedPayload } from "src/services";
import { MeiliIndexes } from "src/shared/meilisearch/constants";
import type {
  MeiliDocument,
  MeiliDocumentRequest,
} from "src/shared/meilisearch/types";
import { Collections } from "src/shared/payload/constants";

export const synchronizeMeiliDocs = async () => {
  const version = await meili.getVersion();
  console.log("Success connecting to Meili!");
  console.log("Meili version:", version.pkgVersion);

  const indexes = await meili.getIndexes({ limit: 1_000 });

  await Promise.all(
    indexes.results.map((index) => {
      console.log("Deleting index", index.uid);
      return index.delete();
    })
  );

  await meili.createIndex(MeiliIndexes.DOCUMENT, { primaryKey: "docId" });
  const index = meili.index(MeiliIndexes.DOCUMENT);
  await index.updatePagination({ maxTotalHits: 100_000 });
  await index.updateFilterableAttributes([
    "languages",
    "type",
    "endpointCalled",
  ]);
  await index.updateSortableAttributes(["title", "updatedAt"]);
  await index.updateSearchableAttributes(["title", "content"]);
  await index.updateDistinctAttribute("distinctId");
  // await index.updateDisplayedAttributes(["type", "page"]);

  const allIds = (await uncachedPayload.getAllIds()).data;

  const documentRequests: MeiliDocumentRequest[] = [
    ...allIds.pages.slugs.map((slug) => ({
      type: Collections.Pages as const,
      slug,
    })),
    ...allIds.collectibles.slugs.map((slug) => ({
      type: Collections.Collectibles as const,
      slug,
    })),
    ...allIds.folders.slugs.map((slug) => ({
      type: Collections.Folders as const,
      slug,
    })),
    ...allIds.audios.ids.map((id) => ({
      type: Collections.Audios as const,
      id,
    })),
    ...allIds.images.ids.map((id) => ({
      type: Collections.Images as const,
      id,
    })),
    ...allIds.videos.ids.map((id) => ({
      type: Collections.Videos as const,
      id,
    })),
    ...allIds.files.ids.map((id) => ({
      type: Collections.Files as const,
      id,
    })),
    ...allIds.recorders.ids.map((id) => ({
      type: Collections.Recorders as const,
      id,
    })),
    ...allIds.chronologyEvents.ids.map((id) => ({
      type: Collections.ChronologyEvents as const,
      id,
    })),
  ];

  const documents: MeiliDocument[] = [];
  for (const request of documentRequests) {
    documents.push(...(await getMeiliDocumentsFromRequest(request)));
  }

  console.log("Adding", documents.length, "documents to Meilisearch");

  await index.addDocuments(documents);
};
