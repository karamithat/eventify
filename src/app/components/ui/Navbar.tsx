"use client";

import Link from "next/link";
import Button from "./Button";
import { useState } from "react";
import {
  AlignRight,
  X,
  Ticket,
  Star,
  ChevronDown,
  ChevronUp,
  LogOut,
  CircleUserRound,
  Calendar,
} from "lucide-react";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import { useSession, signOut } from "next-auth/react";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();

  if (status === "loading") return null;

  const links = [
    { name: "Home", href: "/" },
    { name: "Events", href: "/events" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  // Kullanıcının adını al - eğer yoksa varsayılan değer
  const getUserDisplayName = () => {
    if (!session?.user) return "Profile";

    if (session.user.name) {
      return session.user.name;
    }

    // Eğer name yoksa email'den önce @ kısmını al
    if (session.user.email) {
      return session.user.email.split("@")[0];
    }

    return "Profile";
  };

  const displayName = getUserDisplayName();

  return (
    <nav className="bg-primary text-white relative">
      <div className="container mx-auto flex items-center justify-between lg:px-10 py-4 lg:py-0">
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
                <Ticket className="w-5 h-5" />
                <span>Tickets</span>
              </Link>

              <Link href="/interested" className="flex items-center gap-1">
                <Star className="w-5 h-5" />
                <span>Interested</span>
              </Link>

              {/* Profile Dropdown - Kullanıcı adı ile */}
              <div className="relative">
                <button
                  className="flex items-center gap-1 cursor-pointer hover:text-secondary"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <CircleUserRound className="w-5 h-5" />
                  <span className="max-w-32 truncate">{displayName}</span>
                  {showDropdown ? (
                    <ChevronUp className="w-4 h-4 ml-1" />
                  ) : (
                    <ChevronDown className="w-4 h-4 ml-1" />
                  )}
                </button>

                {showDropdown && (
                  <div className="absolute top-full right-0 mt-2 bg-white text-primary rounded-md shadow-lg py-2 w-48 z-50 border border-gray-200">
                    {/* Kullanıcı bilgilerini gösteren header */}
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {session.user.name || "Kullanıcı"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {session.user.email}
                      </p>
                    </div>

                    <Link
                      href="/my-events"
                      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-sm transition-colors"
                      onClick={() => setShowDropdown(false)}
                    >
                      <Calendar className="w-4 h-4" />
                      My Events
                    </Link>
                    <Link
                      href="/interest"
                      className="block px-4 py-2 hover:bg-gray-100 text-sm transition-colors"
                      onClick={() => setShowDropdown(false)}
                    >
                      Interests
                    </Link>
                    <Link
                      href="/account-settings"
                      className="block px-4 py-2 hover:bg-gray-100 text-sm transition-colors"
                      onClick={() => setShowDropdown(false)}
                    >
                      Account Settings
                    </Link>
                    <button
                      onClick={() => {
                        signOut();
                        setShowDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm transition-colors"
                    >
                      <div className="flex items-center gap-2 cursor-pointer">
                        <LogOut className="w-4 h-4" />
                        Log Out
                      </div>
                    </button>
                  </div>
                )}
              </div>
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
                  onClick={() => setOpen(false)}
                >
                  {link.name}
                </Link>
              </li>
            ))}

            <li>
              <Link
                href="/create-event"
                className="inline-block py-2"
                onClick={() => setOpen(false)}
              >
                Create Event
              </Link>
            </li>

            {session ? (
              <>
                {/* Mobil menüde kullanıcı bilgisi */}
                <li className="border-t border-gray-300 pt-3 mt-3">
                  <div className="py-2">
                    <p className="text-sm font-medium">👤 {displayName}</p>
                    <p className="text-xs text-gray-300">
                      {session.user.email}
                    </p>
                  </div>
                </li>
                <li>
                  <Link href="/my-events" onClick={() => setOpen(false)}>
                    📅 My Events
                  </Link>
                </li>
                <li>
                  <Link href="/tickets" onClick={() => setOpen(false)}>
                    🎟️ Tickets
                  </Link>
                </li>
                <li>
                  <Link href="/interested" onClick={() => setOpen(false)}>
                    ⭐ Interested
                  </Link>
                </li>
                <li>
                  <Link href="/interest" onClick={() => setOpen(false)}>
                    Interests
                  </Link>
                </li>
                <li>
                  <Link href="/account-settings" onClick={() => setOpen(false)}>
                    Account Settings
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => {
                      signOut();
                      setOpen(false);
                    }}
                  >
                    Log Out
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link href="/auth/login" onClick={() => setOpen(false)}>
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
