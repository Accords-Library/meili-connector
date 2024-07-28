import { convertEndpointChangeToMeiliDocuments } from "src/convert";
import { meili, payload } from "src/services";
import { MeiliIndexes } from "src/shared/meilisearch/constants";

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

  const allChanges = (await payload.getAll()).data;

  const documents = (
    await Promise.all(allChanges.map(convertEndpointChangeToMeiliDocuments))
  ).flat();

  console.log("Adding", documents.length, "documents to Meilisearch");

  await index.addDocuments(documents);
};
