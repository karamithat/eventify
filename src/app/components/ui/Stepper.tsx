"use client";

import { useState } from "react";

const steps = ["Edit", "Banner", "Ticketing", "Review"];

const Stepper = () => {
  const [currentStep, setCurrentStep] = useState(0);

  return (
    <div className="flex justify-between relative w-full mb-12">
      {/* Çizgi */}
      <div className="absolute top-2 left-0 w-full h-0.5 bg-primary" />

      {steps.map((step, index) => (
        <div key={index} className="flex flex-col items-center flex-1 relative">
          {/* Çizgiyi kapatmak için her bir noktanın arkasına background */}
          <div className="absolute top-2 left-0 w-full h-0.5 bg-transparent z-0" />

          {/* Nokta */}
          <div
            className={`w-5 h-5 rounded-full z-10 ${
              index <= currentStep
                ? "bg-secondary border-4 border-primary"
                : "bg-white border-4 border-gray-300"
            }`}
          ></div>

          {/* Başlık */}
          <span
            className={`text-sm font-medium mt-3 ${
              index <= currentStep ? "text-primary" : "text-gray-400"
            }`}
          >
            {step}
          </span>
        </div>
      ))}
    </div>
  );
};

export default Stepper;
