"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Eye, EyeOff, X } from "lucide-react";
import Logo from "../../components/ui/Logo";
import Image from "next/image";
import toast from "react-hot-toast";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // 1) İlk önce kendi register endpoint'ine kayıt isteği yapıyoruz
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error || "Kayıt sırasında bir hata oluştu");
      return;
    }
    toast.success("Kayıt başarılı! ");

    // 2) Kayıt başarılıysa NextAuth ile otomatik giriş yap
    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      toast.error("Kayıt edildi ama giriş yapılamadı.");
    } else {
      router.push("/auth/login");
    }
  };

  const handleGoogle = () => {
    signIn("google", { callbackUrl: "/" });
  };

  return (
    <section className="h-screen flex flex-col md:flex-row bg-primary">
      {/* Left */}
      <div className="text-white p-8 md:w-2/5 flex flex-col justify-start gap-8 lg:gap-48">
        <Logo />
        <h2 className="text-2xl lg:text-4xl font-bold">
          Discover tailored
          <br />
          events.
          <br />
          Sign up for personalized
          <br /> recommendations today!
        </h2>
      </div>

      {/* Right */}
      <div className="bg-white text-primary p-8 md:w-3/5 relative h-full flex flex-col justify-center rounded-tl-3xl rounded-bl-3xl">
        {/* Close */}
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-black"
          onClick={() => router.back()}
        >
          <X size={24} />
        </button>

        <div className="w-full max-w-md mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6">Sign Up</h2>

          {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-1">E-mail Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your e-mail"
                className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm outline-none"
                  required
                />
                {showPassword ? (
                  <EyeOff
                    className="w-5 h-5 text-gray-500 absolute right-3 top-3 cursor-pointer"
                    onClick={() => setShowPassword(false)}
                  />
                ) : (
                  <Eye
                    className="w-5 h-5 text-gray-500 absolute right-3 top-3 cursor-pointer"
                    onClick={() => setShowPassword(true)}
                  />
                )}
              </div>
            </div>

            <button
              type="submit"
              className="bg-primary text-white font-semibold w-full py-3 rounded-md hover:bg-primary-dark transition cursor-pointer"
            >
              Create Account
            </button>
          </form>

          {/* Social Login */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleGoogle}
              className="flex items-center border border-gray-300 rounded-md px-4 py-2 text-sm hover:bg-gray-50 cursor-pointer"
            >
              <Image
                src="/images/icons/google.png"
                alt="Google"
                width={20}
                height={20}
                className="mr-2"
              />
              Sign up with Google
            </button>
          </div>

          <p className="text-sm text-gray-600 mt-4 text-center">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-primary font-medium hover:underline"
            >
              Log In
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
