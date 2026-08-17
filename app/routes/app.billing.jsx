import { json, redirect } from "@remix-run/node";
import { useLoaderData, useSubmit } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  Text,
  Button,
  InlineGrid,
  Badge,
  List,
  Box,
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

  // Update DB with current plan
  await prisma.shopSettings.upsert({
    where: { shop },
    update: { currentPlan },
    create: { shop, currentPlan },
  });

  return json({ currentPlan });
};

export const action = async ({ request }) => {
  const { billing, session } = await authenticate.admin(request);
  const formData = await request.formData();
  const plan = formData.get("plan");

  if (plan === "free") {
    // To switch to free, we cancel other subscriptions
    const billingCheck = await billing.check({
      plans: ["basic", "pro"],
      isTest: true,
    });
    
    if (billingCheck.hasActivePayment) {
      for (const sub of billingCheck.appSubscriptions) {
        await billing.cancel({
          subscriptionId: sub.id,
          isTest: true,
          prorate: true,
        });
      }
    }
    return redirect("/app/billing");
  }

  const returnUrl = `https://admin.shopify.com/store/${session.shop.replace('.myshopify.com', '')}/apps/${process.env.SHOPIFY_API_KEY}/app/billing`;

  // Otherwise, request the new plan
  await billing.request({
    plan: plan,
    isTest: true,
    returnUrl: returnUrl,
  });

  return null;
};

export default function Billing() {
  const { currentPlan } = useLoaderData();
  const submit = useSubmit();

  const handleUpgrade = (plan) => {
    submit({ plan }, { method: "post" });
  };

  const plans = [
    {
      id: "free",
      name: "Free",
      price: "$0/mo",
      features: [
        "Minimal template only",
        "Default text only",
        "No color customization",
      ],
      buttonText: currentPlan === "free" ? "Current Plan" : "Downgrade to Free",
      disabled: currentPlan === "free",
    },
    {
      id: "basic",
      name: "Basic",
      price: "$4.99/mo",
      features: [
        "All 4 templates",
        "Custom form text",
        "No color customization",
      ],
      buttonText: currentPlan === "basic" ? "Current Plan" : "Upgrade to Basic",
      disabled: currentPlan === "basic",
    },
    {
      id: "pro",
      name: "Pro",
      price: "$9.99/mo",
      features: [
        "All 4 templates",
        "Custom form text",
        "Full color customization",
      ],
      buttonText: currentPlan === "pro" ? "Current Plan" : "Upgrade to Pro",
      disabled: currentPlan === "pro",
    },
  ];

  return (
    <Page title="Billing">
      <Layout>
        <Layout.Section>
          <BlockStack gap="400">
            <Text variant="headingLg" as="h1">
              Current Plan: <Badge tone="success">{currentPlan.toUpperCase()}</Badge>
            </Text>

            <InlineGrid columns={3} gap="400">
              {plans.map((plan) => (
                <Card key={plan.id}>
                  <BlockStack gap="400">
                    <Text variant="headingLg" as="h2">
                      {plan.name}
                    </Text>
                    <Text variant="headingXl" as="p">
                      {plan.price}
                    </Text>
                    <Box paddingBlockEnd="400">
                      <List>
                        {plan.features.map((feature, idx) => (
                          <List.Item key={idx}>{feature}</List.Item>
                        ))}
                      </List>
                    </Box>
                    <div style={{ marginTop: "auto" }}>
                      <Button
                        fullWidth
                        disabled={plan.disabled}
                        variant={plan.id === currentPlan ? "secondary" : "primary"}
                        onClick={() => handleUpgrade(plan.id)}
                      >
                        {plan.buttonText}
                      </Button>
                    </div>
                  </BlockStack>
                </Card>
              ))}
            </InlineGrid>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
