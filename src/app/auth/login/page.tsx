"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, X } from "lucide-react";
import Logo from "../../components/ui/Logo";
import toast from "react-hot-toast";

const LoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      toast.error("Invalid credentials");
    } else {
      toast.success("Giriş başarılı!");
      router.push("/"); // ✅ Başarılıysa anasayfaya yönlendir
    }
  };

  const handleGoogle = () => {
    signIn("google", { callbackUrl: "/" });
  };

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
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-black"
          onClick={() => router.back()}
        >
          <X size={24} />
        </button>

        <div className="w-full max-w-md mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6">Login</h2>

          {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}

          {/* Social Buttons */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={handleGoogle}
              className="cursor-pointer flex items-center border border-gray-300 rounded-md px-4 py-2 w-full text-sm hover:bg-gray-50"
            >
              <Image
                src="/images/icons/google.png"
                alt="Google"
                width={20}
                height={20}
                className="mr-2"
              />
              Login with Google
            </button>
            <button
              className="cursor-pointer flex items-center border border-gray-300 rounded-md px-4 py-2 w-full text-sm hover:bg-gray-50"
              disabled
            >
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">E-mail Address</label>
              <input
                type="email"
                placeholder="Enter your e-mail"
                className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                {showPassword ? (
                  <EyeOff
                    className="w-4 h-4 text-gray-500 absolute right-3 top-3 cursor-pointer"
                    onClick={() => setShowPassword(false)}
                  />
                ) : (
                  <Eye
                    className="w-4 h-4 text-gray-500 absolute right-3 top-3 cursor-pointer"
                    onClick={() => setShowPassword(true)}
                  />
                )}
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
            Don’t have an account?{" "}
            <Link
              href="/auth/signup"
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

export default LoginPage;
