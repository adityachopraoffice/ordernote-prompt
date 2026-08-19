import { redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { login } from "../../shopify.server";
import styles from "./styles.module.css";

export const loader = async ({ request }) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  return { showForm: Boolean(login) };
};

export const meta = () => {
  return [
    { title: "Magic Notes | Supercharge Your Shopify Cart Notes" },
    {
      name: "description",
      content: "Empower your customers to leave detailed, AI-prompted order notes directly in their cart. Seamless Shopify integration.",
    },
  ];
};

export default function App() {
  const { showForm } = useLoaderData();

  return (
    <div className={styles.index}>
      <div className={styles.glow1}></div>
      <div className={styles.glow2}></div>
      
      <header className={styles.hero}>
        <div className={styles.badge}>Magic Notes v2.0</div>
        <h1 className={styles.heading}>Smarter Order Notes</h1>
        <p className={styles.text}>
          Empower your customers to leave detailed, guided instructions directly on the cart page. Reduce support tickets and deliver exactly what they want.
        </p>

        {showForm && (
          <div className={styles.formContainer}>
            <Form className={styles.form} method="post" action="/auth/login">
              <label className={styles.label}>
                <span className={styles.labelText}>Store URL</span>
                <input
                  className={styles.input}
                  type="text"
                  name="shop"
                  placeholder="my-store.myshopify.com"
                  autoComplete="off"
                  required
                />
                <span className={styles.hint}>Enter your myshopify.com domain to connect.</span>
              </label>
              <button className={styles.button} type="submit">
                Install App
              </button>
            </Form>
          </div>
        )}
      </header>

      <section className={styles.features}>
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>✨</div>
          <h3 className={styles.featureTitle}>Smart Prompts</h3>
          <p className={styles.featureText}>
            Guide customers with intelligent prompt suggestions for gift messages, delivery instructions, and specific custom requests.
          </p>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>⚡</div>
          <h3 className={styles.featureTitle}>Instant Setup</h3>
          <p className={styles.featureText}>
            Seamlessly integrates with all modern Shopify OS 2.0 themes in a single click. No coding required whatsoever.
          </p>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>📊</div>
          <h3 className={styles.featureTitle}>Better Fulfillment</h3>
          <p className={styles.featureText}>
            Order notes sync securely and instantly to your Shopify admin, ensuring your team never misses a crucial detail.
          </p>
        </div>
      </section>
    </div>
  );
}
