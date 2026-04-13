import Image from "next/image";
import styles from "./InvoiceHero.module.css";

const InvoiceHero = () => {
  return (
    <section className={styles.heroSection}>
      <div className={styles.heroBackground} aria-hidden>
        <Image
          src="/images/invoice-hero-image.jpg"
          alt="Hero Image"
          fill
          sizes="100vw"
          style={{ objectFit: "cover", objectPosition: "center" }}
          priority
        />
      </div>
      <div className={styles.heroOverlay} aria-hidden />
      <div className={styles.heroContent}>
        <h1 className={styles.heroHeading}>CREATE INVOICE</h1>
        <p className={styles.heroSubheading}>
          Fill out the details below and generate a shareable invoice for your client.
        </p>
      </div>
    </section>
  );
};

export default InvoiceHero;
