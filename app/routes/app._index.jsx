import { json } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  InlineGrid,
  CalloutCard,
  Badge,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const loader = async ({ request }) => {
  const { session, billing } = await authenticate.admin(request);
  const shop = session.shop;

  const billingCheck = await billing.check({
    plans: ["basic", "pro"],
    isTest: true,
  });

  let currentPlan = "free";
  if (billingCheck.hasActivePayment) {
    const activeSubscriptions = billingCheck.appSubscriptions;
    if (activeSubscriptions.some(sub => sub.name === "pro")) {
      currentPlan = "pro";
    } else if (activeSubscriptions.some(sub => sub.name === "basic")) {
      currentPlan = "basic";
    }
  }

  // Ensure DB record exists
  let settings = await prisma.shopSettings.findUnique({
    where: { shop },
  });

  if (!settings) {
    settings = await prisma.shopSettings.create({
      data: {
        shop,
        currentPlan,
      },
    });
  } else if (settings.currentPlan !== currentPlan) {
    settings = await prisma.shopSettings.update({
      where: { shop },
      data: { currentPlan },
    });
  }

  return json({ shop, currentPlan });
};

export default function Dashboard() {
  const { shop, currentPlan } = useLoaderData();
  const navigate = useNavigate();

  return (
    <Page title="Dashboard">
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            {/* Welcome Banner */}
            <CalloutCard
              title="Welcome to OrderNote Prompt!"
              illustration="https://cdn.shopify.com/s/assets/admin/checkout/settings-customizecart-705f57c725ac05be5a34ec20c05b94298cb8afd10bf5b8cb4b3a4c0fb32688b1.svg"
              primaryAction={{
                content: "Customize Widget",
                onAction: () => navigate("/app/settings"),
              }}
            >
              <p>
                Get started by enabling the app in your theme and customizing your prompt text and colors.
                Currently connected to: <strong>{shop}</strong>
              </p>
            </CalloutCard>

            <InlineGrid columns={2} gap="400">
              {/* Quick Status */}
              <Card>
                <BlockStack gap="400">
                  <Text variant="headingMd" as="h2">Account Status</Text>
                  <Text as="p">
                    Current Plan: <Badge tone="info">{currentPlan.toUpperCase()}</Badge>
                  </Text>
                  <Button onClick={() => navigate("/app/billing")}>
                    Manage Subscription
                  </Button>
                </BlockStack>
              </Card>

              {/* Instructions */}
              <Card>
                <BlockStack gap="400">
                  <Text variant="headingMd" as="h2">How it works & Testing</Text>
                  <Text as="p">
                    <b>1. Enable in Theme:</b> Go to your Shopify Theme Editor, navigate to the Cart page, and add the "Order Note Prompt" block.
                  </Text>
                  <Text as="p">
                    <b>2. Test it:</b> Add an item to your cart on the storefront, type a message in the new order note box, and complete checkout.
                  </Text>
                  <Text as="p">
                    <b>3. View the Note:</b> Go to your Shopify Admin &rarr; <b>Orders</b>. Click on the new order, and you will see the message right there on the right side under the standard <b>Notes</b> section!
                  </Text>
                </BlockStack>
              </Card>
            </InlineGrid>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
