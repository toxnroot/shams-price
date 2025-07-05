'use client';
import Link from "next/link";
import LogoutButton from "./ButtonLogout";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NavBar = () => {
  const pathname = usePathname();
  const [path, setPath] = useState('auth');

  useEffect(() => {
    if (pathname.startsWith('/dashboard')) {
      setPath('auth-admin');
    } else {
      setPath('auth');
    }
  }, [pathname]);

  return (
    <nav className="bg-white shadow-md w-full z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 relative flex-shrink-0">
            <Image
              src="/logo.ico"
              alt="SHAMS TEX Logo"
              fill
              className="object-contain"
            />
          </div>
          <span className="text-2xl font-bold text-[#A08558] leading-tight">
            SHAMS TEX
          </span>
        </Link>

        <LogoutButton path={path} />
      </div>
    </nav>
  );
};

export default NavBar;
