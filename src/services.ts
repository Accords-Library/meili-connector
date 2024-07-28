import { MeiliSearch } from "meilisearch";
import { TokenCache } from "src/cache/tokenCache";
import { PayloadSDK } from "src/shared/payload/sdk";

if (!process.env.MEILI_URL) throw new Error("No MEILI_URL!");
if (!process.env.MEILI_MASTER_KEY) throw new Error("No MEILI_MASTER_KEY!");
if (!process.env.PAYLOAD_API_URL) throw new Error("No PAYLOAD_API_URL!");
if (!process.env.PAYLOAD_USER) throw new Error("No PAYLOAD_USER!");
if (!process.env.PAYLOAD_PASSWORD) throw new Error("No PAYLOAD_PASSWORD!");

export const meili = new MeiliSearch({
  host: process.env.MEILI_URL,
  apiKey: process.env.MEILI_MASTER_KEY,
});

const tokenCache = new TokenCache();

export const payload = new PayloadSDK(
  process.env.PAYLOAD_API_URL,
  process.env.PAYLOAD_USER,
  process.env.PAYLOAD_PASSWORD
);
payload.addTokenCache(tokenCache);
