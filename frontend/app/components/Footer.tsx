'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Instagram, Facebook } from 'lucide-react';
import { FaTiktok } from 'react-icons/fa';
import Logo from './Logo';

export default function Footer() {
  const socialLinks = [
    { icon: <Instagram className="w-6 h-6" />, href: 'https://instagram.com/unweighted_official', label: 'Instagram' },
    { icon: <FaTiktok className="w-6 h-6" />, href: 'https://www.tiktok.com/@unweighted.fit', label: 'TikTok' },
    { icon: <Facebook className="w-6 h-6" />, href: 'https://www.facebook.com/profile.php?id=61582965223897', label: 'Facebook' },
  ];

  const footerLinks = [
    { label: 'Join Waitlist', href: 'https://forms.unweighted.fit/waitlist' },
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
  ];

  return (
    <footer className="bg-navy-blue text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Logo and Tagline */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Logo size="sm" variant="white" />
              <span className="text-xl font-bold">Unweighted</span>
            </div>
            <p className="text-white/80 text-sm">
              Stop dieting alone.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4 text-white">Quick Links</h4>
            <ul className="space-y-2">
              {footerLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-white/80 hover:text-coral-red transition-colors duration-200 text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h4 className="font-bold mb-4 text-white">Follow the Movement</h4>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-coral-red transition-colors duration-200"
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 pt-8 text-center">
          <p className="text-white/60 text-sm">
            &copy; 2025 Unweighted. Stop dieting alone.
          </p>
        </div>
      </div>
    </footer>
  );
}
