import Image from "next/image";
import Link from "next/link";
import React from "react";

const Logo = () => {
  return (
    <Link href="/">
      <div className="flex items-center gap-2">
        <Image
          src="/images/logo/ticket.png"
          alt="Eventify"
          width={40}
          height={40}
        />
        <span className="text-2xl font-bold text-secondary">Eventify</span>
      </div>
    </Link>
  );
};

export default Logo;
