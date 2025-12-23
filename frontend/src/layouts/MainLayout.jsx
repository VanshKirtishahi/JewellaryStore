import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Crown, Gem, Heart, Mail, Phone, MapPin, Instagram, Facebook, Twitter, Send } from 'lucide-react';
import { useState, useEffect } from 'react';

const MainLayout = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscriptionSuccess, setSubscriptionSuccess] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (newsletterEmail) {
      setSubscriptionSuccess(true);
      setNewsletterEmail('');
      setTimeout(() => setSubscriptionSuccess(false), 3000);
    }
  };

  const footerLinks = [
    {
      title: 'Collections',
      links: [
        { label: 'Diamond Rings', href: '/collections/rings' },
        { label: 'Gold Necklaces', href: '/collections/necklaces' },
        { label: 'Pearl Earrings', href: '/collections/earrings' },
        { label: 'Custom Designs', href: '/custom-request' },
        { label: 'Wedding Collections', href: '/collections/wedding' },
      ]
    },
    {
      title: 'Services',
      links: [
        { label: 'Jewelry Repair', href: '/services/repair' },
        { label: 'Custom Design', href: '/services/custom' },
        { label: 'Appraisal', href: '/services/appraisal' },
        { label: 'Cleaning & Polishing', href: '/services/cleaning' },
        { label: 'Engraving', href: '/services/engraving' },
      ]
    },
    {
      title: 'About',
      links: [
        { label: 'Our Story', href: '/about' },
        { label: 'Craftsmanship', href: '/craftsmanship' },
        { label: 'Ethical Sourcing', href: '/ethical-sourcing' },
        { label: 'Careers', href: '/careers' },
        { label: 'Press & Media', href: '/press' },
      ]
    }
  ];

  const contactInfo = [
    { icon: Phone, label: '+1 (555) 123-4567', href: 'tel:+15551234567' },
    { icon: Mail, label: 'info@venkateshwarajewelers.com', href: 'mailto:info@venkateshwarajewelers.com' },
    { icon: MapPin, label: '123 Luxury Avenue, New York, NY 10001', href: 'https://maps.google.com' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navbar - Sticky handling is done in Navbar.jsx or via CSS, usually we rely on flow here */}
      <Navbar />

      {/* Main Content - REMOVED pt-20 to fix gap */}
      <main className="flex-grow w-full">
        <Outlet />
      </main>

      {/* Floating Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-40 w-12 h-12 bg-gradient-to-br from-jewel-gold to-amber-500 text-white rounded-full flex items-center justify-center shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 animate-bounce-subtle"
          aria-label="Scroll to top"
        >
          <Crown size={20} />
        </button>
      )}

      {/* Footer */}
      <footer className="bg-gradient-to-b from-gray-900 to-black text-white mt-auto w-full">
        {/* Newsletter Section */}
        <div className="border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-jewel-gold to-amber-500 rounded-lg flex items-center justify-center animate-pulse">
                    <Crown size={20} />
                  </div>
                  <h3 className="text-xl font-serif font-bold">Join Our Exclusive Collection</h3>
                </div>
                <p className="text-gray-400">
                  Subscribe to receive updates on new collections, exclusive offers, and jewelry care tips.
                </p>
              </div>
              
              <form onSubmit={handleNewsletterSubmit} className="relative">
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-jewel-gold transition-all duration-300"
                    required
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-jewel-gold to-amber-500 text-white rounded-lg font-medium hover:from-amber-500 hover:to-jewel-gold transition-all duration-300 hover:scale-105 flex items-center gap-2"
                  >
                    <Send size={18} />
                    <span className="hidden sm:inline">Subscribe</span>
                  </button>
                </div>
                {subscriptionSuccess && (
                  <div className="absolute top-full mt-2 text-green-400 text-sm animate-fadeIn">
                    Successfully subscribed! Check your email for confirmation.
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-jewel-gold to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Crown size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-serif font-bold">Venkateshwara</h3>
                  <p className="text-sm text-gray-400">Fine Jewelry Since 1985</p>
                </div>
              </div>
              
              <p className="text-gray-400 mb-6">
                Crafting timeless elegance with unparalleled craftsmanship. Each piece tells a story of luxury, tradition, and exceptional quality.
              </p>
              
              {/* Contact Info */}
              <div className="space-y-4">
                {contactInfo.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={index}
                      href={item.href}
                      className="flex items-center gap-3 text-gray-300 hover:text-jewel-gold transition-colors duration-300 group"
                    >
                      <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-jewel-gold transition-colors duration-300">
                        <Icon size={16} />
                      </div>
                      <span>{item.label}</span>
                    </a>
                  );
                })}
              </div>

              {/* Social Media */}
              <div className="mt-8">
                <h4 className="text-sm font-semibold text-gray-300 mb-4">FOLLOW US</h4>
                <div className="flex gap-3">
                  {[
                    { icon: Instagram, href: 'https://instagram.com' },
                    { icon: Facebook, href: 'https://facebook.com' },
                    { icon: Twitter, href: 'https://twitter.com' },
                  ].map((social, index) => {
                    const Icon = social.icon;
                    return (
                      <a
                        key={index}
                        href={social.href}
                        className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-300 hover:bg-jewel-gold hover:text-white transition-all duration-300 hover:scale-110"
                        aria-label={`Follow us on ${social.icon.name}`}
                      >
                        <Icon size={18} />
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer Links Sections */}
            {footerLinks.map((section, index) => (
              <div key={index}>
                <h4 className="text-lg font-serif font-semibold mb-6 pb-2 border-b border-gray-800">
                  {section.title}
                </h4>
                <ul className="space-y-3">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a
                        href={link.href}
                        className="text-gray-400 hover:text-jewel-gold transition-colors duration-300 flex items-center gap-2 group"
                      >
                        <div className="w-1.5 h-1.5 bg-jewel-gold rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Trust Badges */}
          <div className="mt-12 pt-8 border-t border-gray-800">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: 'Certified Diamonds', icon: '💎' },
                { label: 'Ethically Sourced', icon: '🌍' },
                { label: 'Lifetime Warranty', icon: '🛡️' },
                { label: 'Secure Payment', icon: '🔒' },
              ].map((badge, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="text-2xl">{badge.icon}</div>
                  <div>
                    <div className="font-medium">{badge.label}</div>
                    <div className="text-xs text-gray-500">Trust & Quality</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <span>© {new Date().getFullYear()} Venkateshwara Jewellers</span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline">All rights reserved</span>
              </div>
              
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <a href="/privacy" className="hover:text-jewel-gold transition-colors duration-300">
                  Privacy Policy
                </a>
                <a href="/terms" className="hover:text-jewel-gold transition-colors duration-300">
                  Terms of Service
                </a>
                <a href="/sitemap" className="hover:text-jewel-gold transition-colors duration-300">
                  Sitemap
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;