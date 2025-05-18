"use client";

import Link from "next/link";
import Button from "./Button";
import { useState } from "react";
import { AlignRight, X, Ticket, Star, ChevronDown, User } from "lucide-react";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import { useSession } from "next-auth/react";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const links = [
    { name: "Home", href: "/" },
    { name: "Events", href: "/events" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  // Eğer session yükleniyorsa hiç render etme (yanıp sönmeyi önler)
  if (status === "loading") return null;

  return (
    <nav className="bg-primary text-white relative">
      <div className="container mx-auto flex items-center justify-between lg:px-16 py-4 lg:py-0">
        {/* Logo */}
        <Logo />

        {/* Desktop Menü */}
        <ul className="hidden lg:flex items-center space-x-8 h-full">
          {links.map((link) => (
            <li key={link.href} className="flex items-center relative h-full">
              <Link href={link.href} className="flex items-center h-full py-4">
                {link.name}
                {pathname === link.href && (
                  <span className="absolute bottom-0 left-0 w-full border-b-4 border-secondary rounded-sm"></span>
                )}
              </Link>
            </li>
          ))}
        </ul>

        {/* Sağ Menü */}
        <div className="hidden md:flex items-center space-x-6">
          <Link href="/create-event" className="hover:underline">
            Create Event
          </Link>

          {session ? (
            <div className="flex items-center space-x-6">
              <Link href="/tickets" className="flex items-center gap-1">
                <Ticket className="w-5 h-5" /> <span>Tickets</span>
              </Link>
              <Link href="/interested" className="flex items-center gap-1">
                <Star className="w-5 h-5" /> <span>Interested</span>
              </Link>
              <Link href="/profile" className="flex items-center gap-1">
                <User className="w-5 h-5" /> <span>Profile</span>
                <ChevronDown className="w-4 h-4 ml-1" />
              </Link>
            </div>
          ) : (
            <>
              <Link href="/auth/login">Login</Link>
              <Button href="/auth/signup">Sign Up</Button>
            </>
          )}
        </div>

        {/* Mobil Menü İkonu */}
        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X size={32} /> : <AlignRight size={32} />}
        </button>
      </div>

      {/* Mobil Menü */}
      {open && (
        <div className="md:hidden bg-primary px-4 pb-4">
          <ul className="space-y-3">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`inline-block py-2 ${
                    pathname === link.href ? "border-b-2 border-secondary" : ""
                  }`}
                >
                  {link.name}
                </Link>
              </li>
            ))}

            <li>
              <Link href="/create-event" className="inline-block py-2">
                Create Event
              </Link>
            </li>

            {session ? (
              <>
                <li>
                  <Link href="/tickets">🎟️ Tickets</Link>
                </li>
                <li>
                  <Link href="/interested">⭐ Interested</Link>
                </li>
                <li>
                  <Link href="/profile">👤 Profile</Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link href="/auth/login" className="inline-block py-2">
                    Login
                  </Link>
                </li>
                <li>
                  <Button href="/auth/signup">Sign Up</Button>
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
