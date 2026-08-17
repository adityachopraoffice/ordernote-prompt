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
  Badge,
  Box,
  Divider,
  InlineStack,
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
            <div
              style={{
                background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
                borderRadius: "12px",
                padding: "32px",
                color: "white",
                boxShadow: "0 10px 25px -5px rgba(168, 85, 247, 0.4)",
              }}
            >
              <BlockStack gap="400">
                <Text variant="headingXl" as="h1" fontWeight="bold">
                  Welcome to OrderNote Prompt!
                </Text>
                <Text as="p" variant="bodyLg">
                  Get started by enabling the app in your theme and customizing your prompt text and colors.
                </Text>
                <div style={{ marginTop: "16px" }}>
                  <Button size="large" onClick={() => navigate("/app/settings")}>
                    Customize Widget
                  </Button>
                </div>
              </BlockStack>
            </div>

            <InlineGrid columns={2} gap="400">
              {/* Quick Status */}
              <Card background="bg-surface-secondary">
                <BlockStack gap="400">
                  <Text variant="headingMd" as="h2">Account Status</Text>
                  
                  <Box padding="400" background="bg-surface" borderRadius="200" borderColor="border" borderWidth="025">
                    <BlockStack gap="300">
                      <Text as="p" color="subdued">Connected Store</Text>
                      <Text variant="headingSm" as="p">{shop}</Text>
                      
                      <Divider />
                      
                      <InlineStack align="space-between" blockAlign="center">
                        <Text as="p" color="subdued">Current Plan</Text>
                        <Badge tone={currentPlan === 'pro' ? 'magic' : currentPlan === 'basic' ? 'info' : 'success'}>
                          {currentPlan.toUpperCase()}
                        </Badge>
                      </InlineStack>
                    </BlockStack>
                  </Box>
                  <Button variant="primary" onClick={() => navigate("/app/billing")}>
                    Manage Subscription
                  </Button>
                </BlockStack>
              </Card>

              {/* Instructions */}
              <Card>
                <BlockStack gap="400">
                  <Text variant="headingMd" as="h2">How it works & Testing</Text>
                  <BlockStack gap="300">
                    <Box padding="300" background="bg-surface-secondary" borderRadius="200">
                      <Text as="p">
                        <strong style={{ color: "#005bd3" }}>1. Enable in Theme:</strong> Go to your Shopify Theme Editor, navigate to the Cart page, and add the "Order Note Prompt" block.
                      </Text>
                    </Box>
                    <Box padding="300" background="bg-surface-secondary" borderRadius="200">
                      <Text as="p">
                        <strong style={{ color: "#005bd3" }}>2. Test it:</strong> Add an item to your cart on the storefront, type a message in the new order note box, and complete checkout.
                      </Text>
                    </Box>
                    <Box padding="300" background="bg-surface-secondary" borderRadius="200">
                      <Text as="p">
                        <strong style={{ color: "#005bd3" }}>3. View the Note:</strong> Go to your Shopify Admin &rarr; <b>Orders</b>. Click on the new order, and you will see the message under the standard <b>Notes</b> section!
                      </Text>
                    </Box>
                  </BlockStack>
                </BlockStack>
              </Card>
            </InlineGrid>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
