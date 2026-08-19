import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  const { shop, topic } = await authenticate.webhook(request);
  console.log(`Received ${topic} webhook for ${shop}`);
  // Payload for CUSTOMERS_DATA_REQUEST
  // Add your logic here to process the customer data request
  return new Response(null, { status: 200 });
};
