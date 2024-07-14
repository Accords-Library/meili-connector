import http from "http";
import { synchronizeMeiliDocs } from "./synchro";
import type { AfterOperationWebHookMessage } from "src/shared/payload/webhooks";
import { webhookHandler } from "src/webhook";
import { dataCache } from "src/services";

await dataCache.init();
await synchronizeMeiliDocs();

export const requestListener: http.RequestListener = async (req, res) => {
  if (req.method !== "POST") {
    res.writeHead(405).end("Method Not Allowed. Use POST.");
    return;
  }

  if (req.headers.authorization !== `Bearer ${process.env.WEBHOOK_TOKEN}`) {
    res.writeHead(403).end("Invalid auth token.");
    return;
  }

  // Retrieve and parse body
  const buffers: Uint8Array[] = [];
  for await (const chunk of req) {
    buffers.push(chunk);
  }
  const message = JSON.parse(
    Buffer.concat(buffers).toString()
  ) as AfterOperationWebHookMessage;

  // Not awaiting on purpose to respond with a 202 and not block the CMS
  webhookHandler(message);

  res.writeHead(202).end("Accepted");
};

http.createServer(requestListener).listen(process.env.PORT, () => {
  console.log(`Server started: http://localhost:${process.env.PORT}`);
});
