import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  const { shop, topic } = await authenticate.webhook(request);
  console.log(`Received ${topic} webhook for ${shop}`);
  // Payload for SHOP_REDACT
  // Add your logic here to redact the shop data
  return new Response(null, { status: 200 });
};
