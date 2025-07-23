import { FaFacebookF, FaInstagram, FaXTwitter } from 'react-icons/fa6';

export default function Footer() {
  return (
    <footer className="bg-[#FAF5E8] text-gray-800 border-t border-[#e4d5b5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 text-center sm:text-left">

          {/* Brand & Social */}
          <div>
            <img 
            src="/logo.png" 
            alt="Raven Fragrance Logo" 
            className="h-6 w-auto mx-auto sm:mx-0 mb-5" 
            />
            <p className="text-sm mt-2">
              Discover your next favorite scent with our curated collection of timeless fragrances.
            </p>

            {/* Social Icons */}
            <div className="flex justify-center sm:justify-start space-x-4 mt-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <FaFacebookF className="h-5 w-5 text-gray-600 hover:text-black transition" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <FaInstagram className="h-5 w-5 text-gray-600 hover:text-black transition" />
              </a>
              <a href="https://x.com" target="_blank" rel="noopener noreferrer" aria-label="X / Twitter">
                <FaXTwitter className="h-5 w-5 text-gray-600 hover:text-black transition" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-sm font-semibold text-black uppercase tracking-wider">Shop</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><a href="#" className="relative transition-colors hover:text-[#B4933A] hover:after:w-full after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-[#B4933A] after:transition-all after:duration-300">All Products</a></li>
              <li><a href="#" className="relative transition-colors hover:text-[#B4933A] hover:after:w-full after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-[#B4933A] after:transition-all after:duration-300">New Arrivals</a></li>
              <li><a href="#" className="relative transition-colors hover:text-[#B4933A] hover:after:w-full after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-[#B4933A] after:transition-all after:duration-300">Sale</a></li>
              <li><a href="#" className="relative transition-colors hover:text-[#B4933A] hover:after:w-full after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-[#B4933A] after:transition-all after:duration-300">Best Sellers</a></li>
              <li><a href="#" className="relative transition-colors hover:text-[#B4933A] hover:after:w-full after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-[#B4933A] after:transition-all after:duration-300">Gift Cards</a></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h3 className="text-sm font-semibold text-black uppercase tracking-wider">Customer Care</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><a href="#" className="relative transition-colors hover:text-[#B4933A] hover:after:w-full after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-[#B4933A] after:transition-all after:duration-300">Contact Us</a></li>
              <li><a href="#" className="relative transition-colors hover:text-[#B4933A] hover:after:w-full after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-[#B4933A] after:transition-all after:duration-300">FAQ</a></li>
              <li><a href="#" className="relative transition-colors hover:text-[#B4933A] hover:after:w-full after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-[#B4933A] after:transition-all after:duration-300">Shipping Info</a></li>
              <li><a href="#" className="relative transition-colors hover:text-[#B4933A] hover:after:w-full after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-[#B4933A] after:transition-all after:duration-300">Returns</a></li>
              <li><a href="#" className="relative transition-colors hover:text-[#B4933A] hover:after:w-full after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-[#B4933A] after:transition-all after:duration-300">Support</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-black uppercase tracking-wider">Company</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><a href="#" className="relative transition-colors hover:text-[#B4933A] hover:after:w-full after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-[#B4933A] after:transition-all after:duration-300">About Us</a></li>
              <li><a href="#" className="relative transition-colors hover:text-[#B4933A] hover:after:w-full after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-[#B4933A] after:transition-all after:duration-300">Careers</a></li>
              <li><a href="#" className="relative transition-colors hover:text-[#B4933A] hover:after:w-full after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-[#B4933A] after:transition-all after:duration-300">Press</a></li>
              <li><a href="#" className="relative transition-colors hover:text-[#B4933A] hover:after:w-full after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-[#B4933A] after:transition-all after:duration-300">Sustainability</a></li>
              <li><a href="#" className="relative transition-colors hover:text-[#B4933A] hover:after:w-full after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-[#B4933A] after:transition-all after:duration-300">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-12 border-t border-[#e4d5b5] pt-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-600 gap-4">
          <p>© 2025 Raven Fragrance. All rights reserved.</p>
          <div className="flex space-x-4">
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
