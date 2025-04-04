"use client";

import Link from "next/link";
import Image from "next/image";
import Button from "./Button";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-primary text-white relative">
      <div className="container mx-auto flex items-center justify-between px-4 sm:px-8 lg:px-16 py-4">
        {/* Logo Alanı */}
        <div className="flex items-center gap-2">
          <Image
            src="/images/logo/ticket.png"
            alt="Eventify"
            width={40}
            height={40}
          />
          <span className="text-2xl font-bold text-secondary">Eventify</span>
        </div>

        {/* Desktop Menü */}
        <ul className="hidden md:flex items-center space-x-8 h-full">
          <li className="flex items-center relative h-full">
            <Link href="/" className="flex items-center h-full py-4">
              Home
              <span className="absolute bottom-0 left-0 w-full border-b-4 border-secondary rounded-sm"></span>
            </Link>
          </li>
          <li className="flex items-center h-full">
            <Link href="/events" className="py-4">
              Events
            </Link>
          </li>
          <li className="flex items-center h-full">
            <Link href="/about" className="py-4">
              About
            </Link>
          </li>
          <li className="flex items-center h-full">
            <Link href="/contact" className="py-4">
              Contact
            </Link>
          </li>
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
          {open ? <X size={32} /> : <Menu size={32} />}
        </button>
      </div>

      {/* Mobil Menü */}
      {open && (
        <div className="md:hidden bg-primary px-4 pb-4">
          <ul className="space-y-3">
            <li className="relative">
              <Link href="/" className="block py-2 border-b-2 border-secondary">
                Home
              </Link>
            </li>
            <li>
              <Link href="/events" className="block py-2">
                Events
              </Link>
            </li>
            <li>
              <Link href="/about" className="block py-2">
                About
              </Link>
            </li>
            <li>
              <Link href="/contact" className="block py-2">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/create-event" className="block py-2">
                Create Event
              </Link>
            </li>
            <li>
              <Link href="/login" className="block py-2">
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
