import { json } from "@remix-run/node";
import prisma from "../db.server";

export async function loader({ request }) {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");

  if (!shop) {
    return json({ error: "Missing shop parameter" }, {
      status: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  try {
    const settings = await prisma.shopSettings.findUnique({
      where: { shop },
    });

    if (settings) {
      return json(settings, {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // Return defaults if not found
    return json(
      {
        selectedTemplate: "minimal",
        formTitle: "Have a special request?",
        placeholderText: "e.g. Gift wrap, delivery instructions...",
        bgColor: "#FFFFFF",
        textColor: "#000000",
        borderColor: "#E0E0E0",
        buttonColor: "#000000",
        buttonTextColor: "#FFFFFF",
        currentPlan: "free",
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    return json({ error: "Internal server error" }, {
      status: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
}
