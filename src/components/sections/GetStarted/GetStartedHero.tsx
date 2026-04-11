import Image from "next/image";
import styles from "./GetStartedHero.module.css";

const GetStartedHero = () => {
  return (
    <section className={styles.heroSection}>
      <div className={styles.heroBackground} aria-hidden>
        <Image
          src="/images/get-started-hero-image.jpg"
          alt=""
          fill
          style={{ objectFit: "cover", objectPosition: "center" }}
          priority
        />
      </div>
      <div className={styles.heroOverlay} aria-hidden />
      <div className={styles.heroContent}>
        <h1 className={styles.heroHeading}>LET&apos;S GET STARTED</h1>
        <p className={styles.heroSubheading}>
          TELL US ABOUT YOUR PROJECT AND WE&apos;LL CREATE THE PERFECT SOLUTION FOR YOUR BUSINESS.
        </p>
      </div>
    </section>
  );
};

export default GetStartedHero;
