const initOrderNote = async () => {
  const wrapper = document.getElementById("ordernote-wrapper");
  if (!wrapper) return;
  
  // Prevent double rendering if script runs multiple times
  if (wrapper.dataset.initialized === "true") return;
  wrapper.dataset.initialized = "true";

  const shop = wrapper.getAttribute("data-shop");
  if (!shop) return;

  // We are bypassing the App Proxy and fetching directly from the backend
  // because the App Proxy seems to be failing or unconfigured on the live store.
  const apiUrl = `https://ordernote-prompt.vercel.app/api/settings?shop=${shop}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error("Failed to fetch settings");
    
    const settings = await response.json();

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

    let style = { ...templates[settings.selectedTemplate || "minimal"] };

    if (settings.currentPlan === "pro") {
      if (settings.bgColor) style.background = settings.bgColor;
      if (settings.textColor) style.color = settings.textColor;
      if (settings.borderColor) style.border = `1px solid ${settings.borderColor}`;
    }

    const noteWrapper = document.createElement("div");
    noteWrapper.style.background = style.background;
    noteWrapper.style.color = style.color;
    noteWrapper.style.border = style.border;
    noteWrapper.style.borderRadius = style.borderRadius;
    noteWrapper.style.fontFamily = style.fontFamily;
    noteWrapper.style.padding = "16px";
    noteWrapper.style.marginTop = "16px";
    noteWrapper.style.marginBottom = "16px";
    noteWrapper.style.boxSizing = "border-box";
    noteWrapper.style.width = "100%";

    const title = document.createElement("p");
    title.textContent = settings.formTitle;
    title.style.margin = "0 0 8px 0";
    title.style.fontWeight = "bold";

    const textarea = document.createElement("textarea");
    textarea.name = "note";
    textarea.placeholder = settings.placeholderText;
    textarea.style.width = "100%";
    textarea.style.minHeight = "100px";
    textarea.style.background = "transparent";
    textarea.style.border = "none";
    textarea.style.color = "inherit";
    textarea.style.fontFamily = "inherit";
    textarea.style.resize = "vertical";
    textarea.style.outline = "none";

    noteWrapper.appendChild(title);
    noteWrapper.appendChild(textarea);

    // Place the widget EXACTLY where the merchant dropped it in the Theme Editor.
    // Do not attempt to move it into the cart form, as this breaks layouts in themes like Dawn.
    wrapper.appendChild(noteWrapper);

    // Pre-fill the textarea with the existing cart note (if any)
    try {
      const cartUrl = window.Shopify?.routes?.root ? window.Shopify.routes.root + 'cart.js' : '/cart.js';
      const cartRes = await fetch(cartUrl);
      if (cartRes.ok) {
        const cartData = await cartRes.json();
        if (cartData.note) textarea.value = cartData.note;
      }
    } catch (e) {
      console.error("Magic Notes: Error fetching cart data", e);
    }

    // Update the cart note using Shopify's AJAX API when the user types
    let timeoutId;
    textarea.addEventListener("input", (e) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const updateUrl = window.Shopify?.routes?.root ? window.Shopify.routes.root + 'cart/update.js' : '/cart/update.js';
        fetch(updateUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ note: e.target.value })
        }).catch(err => console.error("Magic Notes: Error updating cart note", err));
      }, 500); // Debounce typing
    });

  } catch (error) {
    console.error("Magic Notes error:", error);
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initOrderNote);
} else {
  initOrderNote();
}
