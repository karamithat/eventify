"use client";

import Link from "next/link";
import Image from "next/image";
import Button from "./Button";
import { useState } from "react";
import { AlignRight, X } from "lucide-react";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const links = [
    { name: "Home", href: "/" },
    { name: "Events", href: "/events" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <nav className="bg-primary text-white relative h-20">
      <div className="container mx-auto flex items-center justify-between lg:px-16 py-4 lg:py-0">
        {/* Logo Alanı */}
        <div className="flex items-center gap-2">
          <Image
            src="/images/logo/ticket.png"
            alt="Eventify"
            width={40}
            height={40}
          />
          <span className="text-xl md:text-xl font-bold text-secondary">
            Eventify
          </span>
        </div>

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

        {/* Sağ Menü (Desktop) */}
        <ul className="hidden md:flex items-center space-x-8">
          <li>
            <Link href="/create-event">Create Event</Link>
          </li>
          <li>
            <Link href="/login">Login</Link>
          </li>
          <li>
            <Button href="/signup">Sign Up</Button>
          </li>
        </ul>

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
            <li>
              <Link href="/login" className="inline-block py-2">
                Login
              </Link>
            </li>
            <li>
              <Button href="/signup">Sign Up</Button>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
