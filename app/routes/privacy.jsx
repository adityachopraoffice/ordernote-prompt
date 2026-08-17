import { Link } from "@remix-run/react";
import styles from "./privacy.module.css";

export const meta = () => {
  return [
    { title: "Privacy Policy | Ordernote Prompt" },
    {
      name: "description",
      content: "Privacy policy for Ordernote Prompt Shopify App.",
    },
  ];
};

export default function PrivacyPolicy() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <Link to="/" className={styles.backButton}>
          &larr; Back to Home
        </Link>
        
        <h1 className={styles.heading}>Privacy Policy</h1>
        <div className={styles.lastUpdated}>Last Updated: August 17, 2026</div>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>1. Introduction</h2>
          <p className={styles.text}>
            Welcome to Ordernote Prompt. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you use our Shopify application and tell you about your privacy rights.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>2. The Data We Collect</h2>
          <p className={styles.text}>
            To provide our services, we may collect, use, store and transfer different kinds of personal data about you or your customers, which we have grouped together as follows:
          </p>
          <ul className={styles.list}>
            <li><strong>Identity Data:</strong> includes your store name and shopify domain.</li>
            <li><strong>Contact Data:</strong> includes email address associated with your Shopify account.</li>
            <li><strong>Order Data:</strong> includes order notes and custom instructions provided by your customers at checkout.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>3. How We Use Your Data</h2>
          <p className={styles.text}>
            We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
          </p>
          <ul className={styles.list}>
            <li>To provide the core functionality of the Ordernote Prompt app (syncing cart notes to Shopify orders).</li>
            <li>To manage our relationship with you, including notifying you about changes to our terms or privacy policy.</li>
            <li>To administer and protect our business and the application.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>4. Data Security</h2>
          <p className={styles.text}>
            We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. We limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>5. Contact Us</h2>
          <p className={styles.text}>
            If you have any questions about this privacy policy or our privacy practices, please contact us at support@ordernoteprompt.com.
          </p>
        </section>
      </div>
    </div>
  );
}
