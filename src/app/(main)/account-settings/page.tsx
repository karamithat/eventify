"use client";

import { useState, useEffect } from "react";
import { Camera } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";

interface UserFormData {
  name: string;
  email: string;
  website: string;
  company: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  pincode: string;
}

export default function AccountSettings() {
  const { data: session, status } = useSession();
  const [photo, setPhoto] = useState<string | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    website: "",
    company: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    pincode: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Session'dan ve API'den gelen verileri form'a yükle
  useEffect(() => {
    const loadUserData = async () => {
      if (session?.user) {
        try {
          // API'den kullanıcı verilerini getir
          const response = await fetch("/api/user/profile");
          if (response.ok) {
            const data = await response.json();
            const user = data.user;

            setFormData({
              name: user.name || "",
              email: user.email || "",
              website: user.website || "",
              company: user.company || "",
              phone: user.phone || "",
              address: user.address || "",
              city: user.city || "",
              country: user.country || "",
              pincode: user.pincode || "",
            });

            // Profil resmi varsa yükle
            if (user.image) {
              setPhoto(user.image);
            }
          } else {
            // API çağrısı başarısız olursa session'dan yükle
            setFormData({
              name: session.user.name || "",
              email: session.user.email || "",
              website: "",
              company: "",
              phone: "",
              address: "",
              city: "",
              country: "",
              pincode: "",
            });

            if (session.user.image) {
              setPhoto(session.user.image);
            }
          }
        } catch (error) {
          console.error("Error loading user data:", error);
          // Hata durumunda session'dan yükle
          setFormData({
            name: session.user.name || "",
            email: session.user.email || "",
            website: "",
            company: "",
            phone: "",
            address: "",
            city: "",
            country: "",
            pincode: "",
          });

          if (session.user.image) {
            setPhoto(session.user.image);
          }
        }
      }
    };

    loadUserData();
  }, [session]);

  // Profil fotoğrafı yükleme fonksiyonu
  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
  }

  // Form input değişiklik handler'ı
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Form gönderme handler'ı
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      // Burada API'ye form verilerini göndereceksiniz
      const response = await fetch("/api/user/update-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          photo: photo,
        }),
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Profile updated successfully!" });
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      console.error(error);

      setMessage({
        type: "error",
        text: "Failed to update profile. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Loading durumu
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Giriş yapılmamışsa
  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600">
            Please sign in to access account settings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sol Menü */}
      <aside className="w-72 bg-gray-100">
        <div className="font-bold text-xl py-10 px-8 bg-gray-200">
          Account Settings
        </div>
        <nav className="flex flex-col py-4 gap-1">
          <a
            href="#"
            className="px-6 py-2 text-primary bg-white border-l-4 border-primary font-medium"
          >
            Account Info
          </a>
          <a href="#" className="px-6 py-2 text-gray-700 hover:bg-gray-200">
            Change Email
          </a>
          <a href="#" className="px-6 py-2 text-gray-700 hover:bg-gray-200">
            Password
          </a>
        </nav>
      </aside>

      {/* Ana İçerik */}
      <main className="flex-1 py-8 px-8">
        {/* Account Information Header - Gri Alan */}
        <div className="bg-gray-100 px-8 py-6 rounded-lg mb-8 w-full">
          <h1 className="text-3xl font-bold text-gray-800">
            Account Information
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your personal information and preferences
          </p>
        </div>

        {/* Mesaj */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-100 text-green-700 border border-green-200"
                : "bg-red-100 text-red-700 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Profil Fotoğrafı */}
        <div className="flex flex-col items-center gap-2 mb-10">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden shadow">
              {photo ? (
                <Image
                  src={photo}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 8-4 8-4s8 0 8 4"></path>
                </svg>
              )}
            </div>
            <label className="absolute bottom-2 right-2 bg-white rounded-full shadow p-1 cursor-pointer group-hover:scale-110 transition">
              <Camera className="w-5 h-5 text-gray-600" />
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handlePhotoUpload}
              />
            </label>
          </div>
          <span className="text-sm text-gray-500">Profile Photo</span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
          {/* Profile Info */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="font-semibold text-xl mb-6 text-gray-800">
              Profile Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Full Name:
                </label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition"
                  type="text"
                  placeholder="Enter your full name"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Email:
                </label>
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition bg-gray-50"
                  type="email"
                  placeholder="Enter email"
                  disabled // Email değiştirmek için ayrı bir sayfa olmalı
                />
                <p className="text-xs text-gray-500 mt-1">
                  To change your email, please use the Change Email option in
                  the sidebar.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Website: <span className="text-gray-400">(Optional)</span>
                </label>
                <input
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition"
                  type="url"
                  placeholder="https://yourwebsite.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Company: <span className="text-gray-400">(Optional)</span>
                </label>
                <input
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition"
                  type="text"
                  placeholder="Enter company name"
                />
              </div>
            </div>
          </div>

          {/* Contact Info - Optional Fields */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="font-semibold text-xl mb-2 text-gray-800">
              Additional Information
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              These details are optional and can be used for event registration
              and contact purposes.
              <br />
              <span className="text-amber-600 font-medium">Note:</span> These
              fields are not yet stored in the database but are ready for future
              implementation.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Phone Number:{" "}
                  <span className="text-gray-400">(Optional)</span>
                </label>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition"
                  type="tel"
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Address: <span className="text-gray-400">(Optional)</span>
                </label>
                <input
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition"
                  type="text"
                  placeholder="Enter address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  City/Town: <span className="text-gray-400">(Optional)</span>
                </label>
                <input
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition"
                  type="text"
                  placeholder="Enter city"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Country: <span className="text-gray-400">(Optional)</span>
                </label>
                <input
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition"
                  type="text"
                  placeholder="Enter country"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Postal Code: <span className="text-gray-400">(Optional)</span>
                </label>
                <input
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition"
                  type="text"
                  placeholder="Enter postal code"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-center pt-6">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-primary text-white font-semibold px-12 py-3 rounded-md hover:bg-primary-dark transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </div>
              ) : (
                "Save My Profile"
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
