"use client";

import React from 'react';
import { useBuilder } from '../../context/BuilderContext';
import styles from './MinimalFooter.module.css';
import layout from '../_shared/layout.module.css';

const Footer: React.FC<{ sectionId: string }> = ({ sectionId }) => {
  const { globalStyles, sectionContent } = useBuilder();
  const { colors, theme, fonts } = globalStyles;
  const content = sectionContent[sectionId] ?? {};

  const logoText = content.logoText ?? "Brand";
  const email = content.email ?? "hello@example.com";
  const phone = content.phone ?? "+1 234 567 890";
  const contactText = content.contactText ?? "Have any questions or feedback? Reach out below";
  const copyrightText = content.copyright ?? `Copyright ${new Date().getFullYear()}. All Rights Reserved`;

  const navLinks = Array.isArray(content.navLinks) 
    ? content.navLinks 
    : (content.navLinks ? (content.navLinks as string).split(', ') : ["Home", "About Us", "What We Do", "Pricing", "Contact Us"]);

  const resourceLinks = Array.isArray(content.resourceLinks) 
    ? content.resourceLinks 
    : (content.resourceLinks ? (content.resourceLinks as string).split(', ') : ["Wellness Tips", "What We Offer", "Weight Loss Challenge", "About Us"]);

  const supportLinks = Array.isArray(content.supportLinks) 
    ? content.supportLinks 
    : (content.supportLinks ? (content.supportLinks as string).split(', ') : ["FAQs", "Contact us", "Testimonials", "Pricing"]);

  return (
    <footer className={styles.footer} style={{ 
      backgroundColor: theme === 'dark' ? '#0a0a0a' : '#f3f4f6',
      color: colors.paragraph 
    }}>
      <div className={layout.footerInner}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Column 1: Logo & Nav */}
          <div className={styles.column}>
            <div className={styles.logoWrapper} style={{ 
              fontFamily: fonts.heading, 
              fontSize: '1.5rem', 
              fontWeight: 'bold',
              color: colors.primary 
            }}>
              {logoText}
            </div>
            <nav className={styles.navLinks}>
              {navLinks.map((link: string) => (
                <a key={link} href="#" style={{ fontFamily: fonts.heading, color: colors.paragraph }}>{link}</a>
              ))}
            </nav>
          </div>

          {/* Column 2: Contact */}
          <div className={styles.column}>
            <p className={styles.contactIntro} style={{ fontFamily: fonts.heading, color: colors.paragraph }}>{contactText}</p>
            <a href={`mailto:${email}`} className={styles.emailLink} style={{ fontFamily: fonts.heading, color: colors.primary }}>{email}</a>
            
            <div className={styles.phoneGroup}>
              <p className={styles.label} style={{ fontFamily: fonts.heading, color: colors.paragraph }}>Give us a call</p>
              <a href={`tel:${phone.replace(/\s/g, '')}`} className={styles.phoneLink} style={{ fontFamily: fonts.heading, color: colors.primary }}>{phone}</a>
            </div>
          </div>

          {/* Column 3: Resources */}
          <div className={styles.column}>
            <h3 className={styles.heading} style={{ fontFamily: fonts.heading, color: colors.primary }}>Resources</h3>
            <ul className={styles.list}>
              {resourceLinks.map((link: string) => (
                <li key={link}><a href="#" style={{ color: colors.paragraph }}>{link}</a></li>
              ))}
            </ul>
          </div>

          {/* Column 4: Support */}
          <div className={styles.column}>
            <h3 className={styles.heading} style={{ fontFamily: fonts.heading, color: colors.primary }}>Support</h3>
            <ul className={styles.list}>
              {supportLinks.map((link: string) => (
                <li key={link}><a href="#" style={{ color: colors.paragraph }}>{link}</a></li>
              ))}
            </ul>
          </div>
        </div>

        <div className={styles.bottom} style={{ borderTop: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
          <p className={styles.copyright} style={{ fontFamily: fonts.body, color: theme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.6)' }}>{copyrightText}</p>
          <div className={styles.legal}>
            <a href="#" style={{ color: colors.paragraph }}>Privacy Policy</a>
            <a href="#" style={{ color: colors.paragraph }}>Terms and Conditions</a>
          </div>
        </div>
      </div>
      </div>
    </footer>
  );
};

export default Footer;