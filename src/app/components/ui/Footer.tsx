import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-primary text-white py-12">
      <div className="container mx-auto px-4 sm:px-8 lg:px-16">
        {/* Üst Bölüm */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <h3 className="font-bold mb-4">Company Info</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link href="#">About Us</Link>
              </li>
              <li>
                <Link href="#">Contact Us</Link>
              </li>
              <li>
                <Link href="#">Careers</Link>
              </li>
              <li>
                <Link href="#">FAQs</Link>
              </li>
              <li>
                <Link href="#">Terms of Service</Link>
              </li>
              <li>
                <Link href="#">Privacy Policy</Link>
              </li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="font-bold mb-4">Help</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link href="#">Account Support</Link>
              </li>
              <li>
                <Link href="#">Listing Events</Link>
              </li>
              <li>
                <Link href="#">Event Ticketing</Link>
              </li>
              <li>
                <Link href="#">Ticket Purchase Terms & Conditions</Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-bold mb-4">Categories</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link href="#">Concerts & Gigs</Link>
              </li>
              <li>
                <Link href="#">Festivals & Lifestyle</Link>
              </li>
              <li>
                <Link href="#">Business & Networking</Link>
              </li>
              <li>
                <Link href="#">Food & Drinks</Link>
              </li>
              <li>
                <Link href="#">Performing Arts</Link>
              </li>
              <li>
                <Link href="#">Sports & Outdoors</Link>
              </li>
              <li>
                <Link href="#">Exhibitions</Link>
              </li>
              <li>
                <Link href="#">Workshops, Conferences & Classes</Link>
              </li>
            </ul>
          </div>

          {/* Follow Us */}
          <div>
            <h3 className="font-bold mb-4">Follow Us</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link href="#">Facebook</Link>
              </li>
              <li>
                <Link href="#">Instagram</Link>
              </li>
              <li>
                <Link href="#">Twitter</Link>
              </li>
              <li>
                <Link href="#">Youtube</Link>
              </li>
            </ul>
          </div>

          {/* Download The App */}
          <div>
            <h3 className="font-bold mb-4">Download The App</h3>
            <div className="flex flex-col gap-3">
              <Link href="#">
                <div className="flex items-center gap-3 border border-gray-400 rounded-md px-3 py-1 hover:bg-gray-700 transition">
                  <Image
                    src="/images/icons/google-play.png"
                    alt="Google Play"
                    width={24}
                    height={24}
                  />
                  <span className="text-xs lg:text-sm">
                    Get it on <br /> <strong>Google Play</strong>
                  </span>
                </div>
              </Link>
              <Link href="#">
                <div className="flex items-center gap-3 border border-gray-400 rounded-md px-3 py-2 hover:bg-gray-700 transition">
                  <Image
                    src="/images/icons/apple-store.png"
                    alt="App Store"
                    width={24}
                    height={24}
                  />
                  <span className="text-xs lg:text-sm">
                    Download on the <br /> <strong>App Store</strong>
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Alt Çizgi */}
        <div className="border-t border-gray-600 pt-4 text-center text-gray-400 text-sm">
          ©2025 Eventify. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
