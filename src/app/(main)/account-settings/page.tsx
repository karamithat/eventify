"use client";

import { useState } from "react";
import { Camera } from "lucide-react";

export default function AccountSettings() {
  const [photo, setPhoto] = useState<string | null>(null);

  // Profil fotoğrafı yükleme fonksiyonu
  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sol Menü */}
      <aside className="w-56 bg-gray-100 border-r">
        <div className="font-bold text-lg py-8 px-6 border-b">
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
        <h1 className="text-2xl font-bold mb-8 border-b pb-4">
          Account Information
        </h1>

        {/* Profil Fotoğrafı */}
        <div className="flex flex-col items-center gap-2 mb-10">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden shadow">
              {photo ? (
                <img
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
        <form className="max-w-xl mx-auto space-y-8">
          {/* Profile Info */}
          <div>
            <h2 className="font-semibold text-lg mb-4">Profile Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  First Name:
                </label>
                <input
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  type="text"
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Last Name:
                </label>
                <input
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  type="text"
                  placeholder="Enter last name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Website:
                </label>
                <input
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  type="text"
                  placeholder="Enter website"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Company:
                </label>
                <input
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  type="text"
                  placeholder="Enter company name"
                />
              </div>
            </div>
          </div>
          {/* Contact Info */}
          <div>
            <h2 className="font-semibold text-lg mb-2">Contact Details</h2>
            <p className="text-sm text-gray-500 mb-4">
              These details are private and only used to contact you for
              ticketing or prizes.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Phone Number:
                </label>
                <input
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  type="text"
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Address:
                </label>
                <input
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  type="text"
                  placeholder="Enter address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  City/Town:
                </label>
                <input
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  type="text"
                  placeholder="Enter city"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Country:
                </label>
                <input
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  type="text"
                  placeholder="Enter country"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Pincode:
                </label>
                <input
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  type="text"
                  placeholder="Enter pincode"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-center mt-8">
            <button
              type="submit"
              className="bg-primary text-white font-semibold px-8 py-2 rounded-md hover:bg-primary-dark transition"
            >
              Save My Profile
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
