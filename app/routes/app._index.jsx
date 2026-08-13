import { useEffect, useState } from "react";
import { json } from "@remix-run/node";
import {
  useActionData,
  useLoaderData,
  useSubmit,
} from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  Box,
  InlineGrid,
  TextField,
  Divider,
  InlineStack,
  Tooltip,
  Badge,
  Banner,
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

  return json({ settings, currentPlan });
};

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;
  
  const formData = await request.formData();
  const currentPlan = formData.get("currentPlan");
  
  const data = {
    selectedTemplate: formData.get("selectedTemplate"),
  };

  if (currentPlan === "basic" || currentPlan === "pro") {
    data.formTitle = formData.get("formTitle");
    data.placeholderText = formData.get("placeholderText");
  }

  if (currentPlan === "pro") {
    data.bgColor = formData.get("bgColor");
    data.textColor = formData.get("textColor");
    data.borderColor = formData.get("borderColor");
    data.buttonColor = formData.get("buttonColor");
    data.buttonTextColor = formData.get("buttonTextColor");
  }

  await prisma.shopSettings.update({
    where: { shop },
    data,
  });

  return json({ success: true });
};

export default function Index() {
  const { settings, currentPlan } = useLoaderData();
  const actionData = useActionData();
  const submit = useSubmit();

  const [formState, setFormState] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (actionData?.success) {
      setIsSaving(false);
      shopify.toast.show("Settings saved");
    }
  }, [actionData]);

  const handleSave = () => {
    setIsSaving(true);
    submit(
      { ...formState, currentPlan },
      { method: "post" }
    );
  };

  const handleChange = (field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const isFree = currentPlan === "free";
  const isPro = currentPlan === "pro";

  const templates = {
    minimal: {
      background: "#FFFFFF",
      border: "1px solid #E0E0E0",
      color: "#000000",
      borderRadius: "4px",
      fontFamily: "sans-serif",
    },
    bold: {
      background: "#1A1A1A",
      border: "none",
      color: "#FFFFFF",
      borderRadius: "4px",
      fontFamily: "sans-serif",
    },
    elegant: {
      background: "#FDF6F0",
      border: "1px solid #E8D5C4",
      color: "#5C4033",
      borderRadius: "20px",
      fontFamily: "Georgia, serif",
    },
    dark: {
      background: "#0D0D0D",
      border: "1px solid #00FF88",
      color: "#FFFFFF",
      borderRadius: "6px",
      fontFamily: "monospace",
    },
  };

  return (
    <Page
      title="OrderNote Prompt Settings"
      primaryAction={{
        content: "Save",
        onAction: handleSave,
        loading: isSaving,
      }}
    >
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            {/* Instructions Section */}
            <Card roundedAbove="sm">
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">How it works & Testing Guide</Text>
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

            {/* Form Text Section */}
            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">Form Text</Text>
                
                {isFree ? (
                  <Tooltip content="Upgrade to Basic to customize form text">
                    <div style={{ opacity: 0.6 }}>
                      <TextField
                        label="Form Title"
                        value={formState.formTitle}
                        disabled
                        autoComplete="off"
                      />
                    </div>
                  </Tooltip>
                ) : (
                  <TextField
                    label="Form Title"
                    value={formState.formTitle}
                    onChange={(v) => handleChange("formTitle", v)}
                    autoComplete="off"
                  />
                )}

                {isFree ? (
                  <Tooltip content="Upgrade to Basic to customize placeholder">
                    <div style={{ opacity: 0.6 }}>
                      <TextField
                        label="Placeholder Text"
                        value={formState.placeholderText}
                        disabled
                        autoComplete="off"
                      />
                    </div>
                  </Tooltip>
                ) : (
                  <TextField
                    label="Placeholder Text"
                    value={formState.placeholderText}
                    onChange={(v) => handleChange("placeholderText", v)}
                    autoComplete="off"
                  />
                )}
              </BlockStack>
            </Card>

            {/* Template Section */}
            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">Template</Text>
                <InlineGrid columns={2} gap="400">
                  {Object.entries(templates).map(([key, style]) => {
                    const isLocked = isFree && key !== "minimal";
                    return (
                      <div
                        key={key}
                        onClick={() => !isLocked && handleChange("selectedTemplate", key)}
                        style={{
                          cursor: isLocked ? "not-allowed" : "pointer",
                          border: formState.selectedTemplate === key ? "2px solid #005BD3" : "2px solid transparent",
                          borderRadius: "8px",
                          padding: "4px",
                          opacity: isLocked ? 0.6 : 1,
                        }}
                      >
                        <Card>
                          <BlockStack gap="200">
                            <InlineStack align="space-between">
                              <Text variant="headingSm" as="h3">{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
                              {isLocked && <Badge tone="warning">Upgrade to Basic</Badge>}
                            </InlineStack>
                            <div style={{ ...style, padding: "10px", fontSize: "12px" }}>
                              Sample Text
                            </div>
                          </BlockStack>
                        </Card>
                      </div>
                    );
                  })}
                </InlineGrid>
              </BlockStack>
            </Card>

            {/* Colors Section */}
            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">Colors</Text>
                {!isPro && (
                  <Banner tone="warning">
                    Upgrade to Pro to unlock custom colors.
                  </Banner>
                )}
                
                <div style={{ opacity: isPro ? 1 : 0.6, pointerEvents: isPro ? "auto" : "none" }}>
                  <InlineGrid columns={2} gap="400">
                    <TextField
                      type="color"
                      label="Background Color"
                      value={formState.bgColor}
                      onChange={(v) => handleChange("bgColor", v)}
                      autoComplete="off"
                    />
                    <TextField
                      type="color"
                      label="Text Color"
                      value={formState.textColor}
                      onChange={(v) => handleChange("textColor", v)}
                      autoComplete="off"
                    />
                    <TextField
                      type="color"
                      label="Border Color"
                      value={formState.borderColor}
                      onChange={(v) => handleChange("borderColor", v)}
                      autoComplete="off"
                    />
                    <TextField
                      type="color"
                      label="Button Color"
                      value={formState.buttonColor}
                      onChange={(v) => handleChange("buttonColor", v)}
                      autoComplete="off"
                    />
                    <TextField
                      type="color"
                      label="Button Text Color"
                      value={formState.buttonTextColor}
                      onChange={(v) => handleChange("buttonTextColor", v)}
                      autoComplete="off"
                    />
                  </InlineGrid>
                </div>
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>

        {/* Live Preview Section */}
        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">Live Preview</Text>
              <Divider />
              
              <Box padding="400" background="bg-surface-secondary" borderRadius="200">
                <div
                  style={{
                    ...(isPro ? {
                      background: formState.bgColor,
                      color: formState.textColor,
                      borderColor: formState.borderColor,
                      borderStyle: "solid",
                      borderWidth: "1px",
                      borderRadius: templates[formState.selectedTemplate].borderRadius,
                      fontFamily: templates[formState.selectedTemplate].fontFamily,
                    } : templates[formState.selectedTemplate]),
                    padding: "16px",
                    width: "100%",
                    boxSizing: "border-box"
                  }}
                >
                  <p style={{ margin: "0 0 8px 0", fontWeight: "bold" }}>{formState.formTitle}</p>
                  <textarea
                    placeholder={formState.placeholderText}
                    style={{
                      width: "100%",
                      minHeight: "100px",
                      background: "transparent",
                      border: "none",
                      color: "inherit",
                      fontFamily: "inherit",
                      resize: "vertical",
                      outline: "none"
                    }}
                  />
                </div>
              </Box>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
