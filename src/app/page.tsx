import type { Metadata } from "next";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Voyage",
  description: "A digital product agency, crafting exceptional solutions for your business.",
};

export default function HomePage() {
  return (
    <main className={styles.page}>
      <div className={styles.content}>
        <span className={styles.brand}>VOYAGE</span>
        <h1 className={styles.heading}>Coming Soon</h1>
        <p className={styles.tagline}>We&apos;re building something great.</p>
      </div>
    </main>
  );
}
