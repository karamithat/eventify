"use client";

import Image from "next/image";
import Link from "next/link";
import { Eye, X } from "lucide-react";
import Logo from "../components/ui/Logo";

const SignupPage = () => {
  return (
    <section className="h-screen flex flex-col md:flex-row bg-primary">
      {/* Left Side */}
      <div className="text-white p-8 md:w-2/5 flex flex-col justify-start gap-8 lg:gap-48">
        <Logo />
        <h2 className="text-2xl lg:text-4xl font-bold">
          Discover tailored <br />
          events.
          <br />
          Sign up for personalized recommendations <br /> today!
        </h2>
      </div>

      {/* Right Side */}
      <div className="bg-white text-primary p-8 md:w-3/5 relative h-full flex flex-col justify-center rounded-tl-3xl rounded-bl-3xl">
        {/* Close Icon */}
        <button className="absolute top-4 right-4 text-gray-500 hover:text-black">
          <X size={24} />
        </button>

        {/* Content */}
        <div className="w-full max-w-md mx-auto">
          {/* Heading */}
          <h2 className="text-2xl sm:text-3xl font-bold mb-6">Login</h2>

          {/* Social Buttons */}
          <div className="flex gap-4 mb-6">
            <button className="cursor-pointer flex items-center border border-gray-300 rounded-md px-4 py-2 w-full text-sm hover:bg-gray-50">
              <Image
                src="/images/icons/google.png"
                alt="Google"
                width={20}
                height={20}
                className="mr-2"
              />
              Login with Google
            </button>
            <button className="cursor-pointer flex items-center border border-gray-300 rounded-md px-4 py-2 w-full text-sm hover:bg-gray-50">
              <Image
                src="/images/icons/facebook.png"
                alt="Facebook"
                width={20}
                height={20}
                className="mr-2"
              />
              Login with Facebook
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center my-6">
            <hr className="flex-grow border-gray-300" />
            <span className="mx-4 text-gray-500 text-sm">OR</span>
            <hr className="flex-grow border-gray-300" />
          </div>

          {/* Form */}
          <form className="space-y-4">
            <div>
              <label className="block text-sm mb-1">E-mail Address</label>
              <input
                type="email"
                placeholder="Enter your e-mail"
                className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm outline-none"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Password</label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Enter password"
                  className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm outline-none"
                />
                <Eye className="w-4 h-4 text-gray-500 absolute right-3 top-3 cursor-pointer" />
              </div>
            </div>

            <button
              type="submit"
              className="bg-primary text-white font-semibold w-full py-3 rounded-md hover:bg-primary-dark transition cursor-pointer"
            >
              Login
            </button>
          </form>

          <p className="text-sm text-gray-600 mt-4 text-center">
            Dont have an acoount?{" "}
            <Link
              href="/signup"
              className="text-primary font-medium hover:underline"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default SignupPage;
