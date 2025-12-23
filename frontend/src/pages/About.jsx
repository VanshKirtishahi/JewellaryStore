import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Gem, 
  Crown, 
  Award, 
  Sparkles, 
  Users, 
  Heart, 
  Shield, 
  Clock,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  Star,
  CheckCircle
} from 'lucide-react';

const About = () => {
  const milestones = [
    { year: '1985', title: 'Foundation', description: 'Started as a small family workshop in Mumbai' },
    { year: '1995', title: 'First Showroom', description: 'Opened our flagship store in New York' },
    { year: '2005', title: 'International Recognition', description: 'Awarded "Best Jewelry Design" at Paris Expo' },
    { year: '2015', title: 'Digital Innovation', description: 'Launched online customization platform' },
    { year: '2023', title: 'Sustainable Commitment', description: 'Achieved 100% ethically sourced materials' },
  ];

  const values = [
    { 
      icon: <Heart size={28} />, 
      title: 'Passion for Craftsmanship', 
      description: 'Every piece is handcrafted with love and attention to detail' 
    },
    { 
      icon: <Shield size={28} />, 
      title: 'Integrity & Trust', 
      description: 'We believe in transparency and honest relationships' 
    },
    { 
      icon: <Gem size={28} />, 
      title: 'Excellence in Quality', 
      description: 'Only the finest materials meet our standards' 
    },
    { 
      icon: <Users size={28} />, 
      title: 'Customer First', 
      description: 'Your satisfaction is our ultimate goal' 
    },
  ];

  const team = [
    { 
      name: 'Rajesh Sharma', 
      role: 'Master Jeweler', 
      experience: '40+ years',
      specialty: 'Diamond Setting',
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
    },
    { 
      name: 'Priya Patel', 
      role: 'Design Director', 
      experience: '25+ years',
      specialty: 'Custom Designs',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
    },
    { 
      name: 'Michael Chen', 
      role: 'Gemologist', 
      experience: '30+ years',
      specialty: 'Gemstone Certification',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
    },
    { 
      name: 'Sophia Williams', 
      role: 'Customer Experience', 
      experience: '15+ years',
      specialty: 'Client Consultations',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
    },
  ];

  const certifications = [
    'GIA Certified Gemologists',
    'Responsible Jewelry Council Member',
    'Conflict-Free Diamonds',
    'Recycled Gold & Platinum',
    'Lifetime Warranty',
    '100% Satisfaction Guarantee'
  ];

  return (
    <div className="min-h-screen bg-jewel-cream">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-jewel-dark via-black to-gray-900 pt-24 pb-20">
        <div className="absolute inset-0 opacity-20">
          <Sparkles className="absolute top-10 left-10" size={60} />
          <Gem className="absolute bottom-10 right-10" size={60} />
          <Crown className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" size={80} />
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Our Story of <span className="text-jewel-gold">Elegance</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-10">
              For over three decades, we've been crafting timeless jewelry that celebrates life's most precious moments
            </p>
            <Link
              to="/collections"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-jewel-gold to-amber-500 text-white rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              Explore Our Collections
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </div>

      {/* Introduction */}
      <div className="py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Crafting Timeless <span className="text-jewel-gold">Elegance</span>
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Founded with a vision to create jewelry that tells stories, Venkateshwara Fine Jewelry began as a small family workshop in Mumbai. 
                  Today, we're a globally recognized name, known for our exquisite craftsmanship and uncompromising quality.
                </p>
                <p>
                  Our journey has been guided by one simple principle: every piece should be as unique and precious as the moment it celebrates. 
                  From engagement rings that mark the beginning of forever to heirlooms that connect generations, we create jewelry that lasts a lifetime.
                </p>
                <p>
                  With master jewelers who have decades of experience and a passion for perfection, we continue to push the boundaries of design while honoring traditional techniques.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Our workshop"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-gradient-to-r from-jewel-gold to-amber-500 rounded-2xl shadow-2xl -z-10"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Our Values */}
      <div className="py-16 sm:py-20 bg-gradient-to-b from-white to-jewel-cream">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Our <span className="text-jewel-gold">Core Values</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              The principles that guide every piece we create and every relationship we build
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div 
                key={index} 
                className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 hover:shadow-xl transition-all duration-500 hover:-translate-y-2"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-jewel-gold/10 to-amber-500/10 rounded-2xl flex items-center justify-center mb-6">
                  <span className="text-jewel-gold">{value.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Certifications & Guarantees */}
      <div className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Our <span className="text-jewel-gold">Commitment</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Certified excellence and guaranteed satisfaction in every detail
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="grid sm:grid-cols-2 gap-6">
                {certifications.map((cert, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="text-jewel-gold flex-shrink-0" size={20} />
                    <span className="text-gray-700">{cert}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-jewel-gold/10 to-amber-500/10 rounded-2xl p-8 border border-jewel-gold/20">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-jewel-gold to-amber-500 rounded-2xl flex items-center justify-center">
                  <Shield className="text-white" size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Peace of Mind Guaranteed</h3>
                  <p className="text-gray-600">Your trust is our most valuable gem</p>
                </div>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <Star size={16} className="text-jewel-gold" />
                  <span>Free resizing and cleaning for life</span>
                </li>
                <li className="flex items-center gap-3">
                  <Star size={16} className="text-jewel-gold" />
                  <span>30-day return policy, no questions asked</span>
                </li>
                <li className="flex items-center gap-3">
                  <Star size={16} className="text-jewel-gold" />
                  <span>Insurance appraisal included</span>
                </li>
                <li className="flex items-center gap-3">
                  <Star size={16} className="text-jewel-gold" />
                  <span>Free annual inspections and maintenance</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Visit Us */}
      <div className="py-16 sm:py-20 bg-gradient-to-r from-jewel-dark via-black to-gray-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Visit Our <span className="text-jewel-gold">Boutique</span>
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Experience luxury in person at our flagship store
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-jewel-gold to-amber-500 rounded-2xl mb-6">
                <MapPin size={28} className="text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Our Location</h3>
              <p className="text-gray-300">123 Diamond Avenue</p>
              <p className="text-gray-300">Beverly Hills, CA 90210</p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-jewel-gold to-amber-500 rounded-2xl mb-6">
                <Clock size={28} className="text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Hours</h3>
              <p className="text-gray-300">Monday - Saturday: 10AM - 7PM</p>
              <p className="text-gray-300">Sunday: 11AM - 5PM</p>
              <p className="text-gray-300 text-sm mt-2">*By appointment recommended</p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-jewel-gold to-amber-500 rounded-2xl mb-6">
                <Phone size={28} className="text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Contact Us</h3>
              <p className="text-gray-300">+1 (310) 555-0123</p>
              <p className="text-gray-300">visit@venkateshwarajewelry.com</p>
              <p className="text-gray-300 text-sm mt-2">Free parking available</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-jewel-gold/10 via-amber-500/10 to-yellow-500/10 rounded-3xl p-8 sm:p-12 text-center border border-jewel-gold/20">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Ready to Create Your <span className="text-jewel-gold">Masterpiece</span>?
              </h2>
              <p className="text-gray-600 text-lg mb-8">
                Whether you're looking for the perfect engagement ring or a custom design that tells your unique story, our team is here to bring your vision to life.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/custom-request"
                  className="px-8 py-4 bg-gradient-to-r from-jewel-gold to-amber-500 text-white rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  Start Custom Design
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;