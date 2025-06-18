import { Link } from "wouter";
import { Crown, MapPin, Mail, Phone, Facebook, Instagram, Twitter, Youtube } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-amber-900 text-gray-300">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center mb-4">
              <div className="bg-gradient-to-r from-amber-600 to-rose-600 p-2 rounded-full">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div className="ml-3">
                <h3 className="text-white text-xl font-bold">PELNORA</h3>
                <p className="text-amber-300 text-sm">JEWELLERS</p>
              </div>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Crafting timeless jewelry with unparalleled artistry and excellence. 
              Join our legacy of beautiful creations that celebrate life's precious moments.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com/pelnorajewellers" className="text-gray-400 hover:text-amber-300 transition-colors duration-300">
                <span className="sr-only">Facebook</span>
                <Facebook className="h-6 w-6" />
              </a>
              <a href="https://instagram.com/pelnorajewellers" className="text-gray-400 hover:text-pink-300 transition-colors duration-300">
                <span className="sr-only">Instagram</span>
                <Instagram className="h-6 w-6" />
              </a>
              <a href="https://twitter.com/pelnorajewellers" className="text-gray-400 hover:text-blue-300 transition-colors duration-300">
                <span className="sr-only">Twitter</span>
                <Twitter className="h-6 w-6" />
              </a>
              <a href="https://youtube.com/pelnorajewellers" className="text-gray-400 hover:text-red-300 transition-colors duration-300">
                <span className="sr-only">YouTube</span>
                <Youtube className="h-6 w-6" />
              </a>
            </div>
          </div>
          
          {/* Our Collections */}
          <div>
            <h3 className="text-white font-bold mb-4">Our Collections</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-amber-300 transition-colors duration-300">Traditional Heritage</a></li>
              <li><a href="#" className="text-gray-400 hover:text-amber-300 transition-colors duration-300">Contemporary Elegance</a></li>
              <li><a href="#" className="text-gray-400 hover:text-amber-300 transition-colors duration-300">Bridal Collection</a></li>
              <li><a href="#" className="text-gray-400 hover:text-amber-300 transition-colors duration-300">Diamond Jewelry</a></li>
              <li><a href="#" className="text-gray-400 hover:text-amber-300 transition-colors duration-300">Gold Ornaments</a></li>
            </ul>
          </div>
          
          {/* Partner Program */}
          <div>
            <h3 className="text-white font-bold mb-4">Partner Program</h3>
            <ul className="space-y-3">
              <li><Link href="/" className="text-gray-400 hover:text-amber-300 transition-colors duration-300">Become a Partner</Link></li>
              <li><a href="#" className="text-gray-400 hover:text-amber-300 transition-colors duration-300">Partnership Benefits</a></li>
              <li><a href="#" className="text-gray-400 hover:text-amber-300 transition-colors duration-300">Training Resources</a></li>
              <li><a href="#" className="text-gray-400 hover:text-amber-300 transition-colors duration-300">Success Stories</a></li>
              <li><a href="#" className="text-gray-400 hover:text-amber-300 transition-colors duration-300">Support Center</a></li>
            </ul>
          </div>
          
          {/* Contact Information */}
          <div>
            <h3 className="text-white font-bold mb-4">Visit Our Showroom</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-amber-400 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-300 font-medium">Pelnora Jewellers</p>
                  <p className="text-gray-400 text-sm">123 Zaveri Bazaar, Opera House</p>
                  <p className="text-gray-400 text-sm">Mumbai, Maharashtra 400004</p>
                </div>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-rose-400 mr-3 flex-shrink-0" />
                <a href="mailto:info@pelnora.com" className="text-gray-400 hover:text-rose-300 transition-colors duration-300">info@pelnora.com</a>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                <a href="tel:+919876543210" className="text-gray-400 hover:text-green-300 transition-colors duration-300">+91 98765 43210</a>
              </li>
            </ul>
            <div className="mt-4 p-3 bg-gradient-to-r from-amber-600/20 to-rose-600/20 rounded-lg border border-amber-600/30">
              <p className="text-amber-300 text-sm font-medium">Showroom Hours</p>
              <p className="text-gray-400 text-xs">Mon - Sat: 10:00 AM - 8:00 PM</p>
              <p className="text-gray-400 text-xs">Sunday: 11:00 AM - 6:00 PM</p>
            </div>
          </div>
        </div>
        
        {/* Copyright & Legal Links */}
        <div className="mt-12 border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">© 2025 Pelnora Jewellers. All rights reserved. | Crafted with excellence since generations.</p>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-400 hover:text-amber-300 text-sm transition-colors duration-300">Terms of Service</a>
            <a href="#" className="text-gray-400 hover:text-amber-300 text-sm transition-colors duration-300">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-amber-300 text-sm transition-colors duration-300">Return Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
