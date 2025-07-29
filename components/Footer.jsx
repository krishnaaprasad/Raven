import { FaFacebookF, FaInstagram, FaXTwitter } from 'react-icons/fa6'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="bg-black text-neutral-300 border-t border-[#2D2D2D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 text-center sm:text-left">

          {/* Brand & Social */}
          <div>
            <Image
              src="/whitelogo.png"
              alt="Raven Fragrance Logo"
              width={96}
              height={24}
              className="h-6 w-auto mx-auto sm:mx-0 mb-5"
              priority={true}
              draggable={false}
            />
            <p className="text-sm mt-2 text-neutral-400">
              Discover your next favorite scent with our curated collection of timeless fragrances.
            </p>

            {/* Social Icons */}
            <div className="flex justify-center sm:justify-start space-x-4 mt-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <FaFacebookF className="h-5 w-5 text-neutral-400 hover:text-[#B4933A] transition" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <FaInstagram className="h-5 w-5 text-neutral-400 hover:text-[#B4933A] transition" />
              </a>
              <a href="https://x.com" target="_blank" rel="noopener noreferrer" aria-label="X / Twitter">
                <FaXTwitter className="h-5 w-5 text-neutral-400 hover:text-[#B4933A] transition" />
              </a>
            </div>
          </div>

          {/* Reusable Section Component Style */}
          {[
            {
              title: 'Shop',
              links: ['All Products', 'New Arrivals', 'Sale', 'Best Sellers', 'Gift Cards']
            },
            {
              title: 'Customer Care',
              links: ['Contact Us', 'FAQ', 'Shipping Info', 'Returns', 'Support']
            },
            {
              title: 'Company',
              links: ['About Us', 'Careers', 'Press', 'Sustainability', 'Terms of Service']
            }
          ].map((section, idx) => (
            <div key={idx}>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                {section.title}
              </h3>
              <ul className="mt-4 space-y-2 text-sm">
                {section.links.map((link, i) => (
                  <li key={i}>
                    <a
                      href="#"
                      className="relative text-neutral-400 transition-colors hover:text-[#B4933A] hover:after:w-full after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-[#B4933A] after:transition-all after:duration-300"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="mt-12 border-t border-[#2D2D2D] pt-6 flex flex-col md:flex-row justify-between items-center text-sm text-neutral-500 gap-4">
          <p>© 2025 Raven Fragrance. All rights reserved.</p>
          <div className="flex space-x-4">
            <a href="#" className="hover:underline hover:text-[#B4933A] transition">Privacy Policy</a>
            <a href="#" className="hover:underline hover:text-[#B4933A] transition">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
