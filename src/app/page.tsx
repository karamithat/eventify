import React from "react";
import Navbar from "./components/ui/Navbar";
import Hero from "./components/home/Hero";
// import Footer from "./components/ui/Footer";

const page = () => {
  return (
    <div className="">
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow">
          <Hero />
        </div>
      </div>
    </div>
  );
};

export default page;
