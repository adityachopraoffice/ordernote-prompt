document.addEventListener("DOMContentLoaded", async () => {
  const wrapper = document.getElementById("ordernote-wrapper");
  if (!wrapper) return;

  const shop = wrapper.getAttribute("data-shop");
  if (!shop) return;

  // We fetch settings directly from the app's public API endpoint.
  // In a real production app, this would use an app proxy (/apps/...).
  // Here we assume the app is hosted on the same domain or allows CORS.
  // We'll use the current window origin + /api/settings as a fallback for testing, 
  // but ideally we'd inject the host url or use app proxy.
  // For the purpose of this exact prompt, we'll assume /apps/ordernote-prompt is mapped via app proxy.
  const apiUrl = `/apps/ordernote-prompt/api/settings?shop=${shop}`;

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
    // To distinguish the textarea's own border if the template has none, 
    // we'll rely on the wrapper's border and keep textarea borderless.

    noteWrapper.appendChild(title);
    noteWrapper.appendChild(textarea);

    const cartForm = document.querySelector('form[action="/cart"]');
    if (cartForm) {
      // Find the submit button or checkout button
      const submitBtn = cartForm.querySelector('[type="submit"], [name="checkout"]');
      if (submitBtn) {
        submitBtn.parentNode.insertBefore(noteWrapper, submitBtn);
      } else {
        cartForm.appendChild(noteWrapper);
      }
    } else {
      wrapper.appendChild(noteWrapper);
    }

  } catch (error) {
    console.error("OrderNote Prompt error:", error);
  }
});
