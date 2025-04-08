"use client";

import { useState } from "react";
import Stepper from "../components/ui/Stepper";

const ExamplePage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = ["Edit", "Banner", "Ticketing", "Review"];

  const handleStepChange = (newStep: number) => {
    setCurrentStep(newStep);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Event Creation</h1>

      <Stepper
        steps={steps}
        activeStep={currentStep}
        onChange={handleStepChange}
        className="max-w-3xl mx-auto"
        showButtons={true}
      />

      <div className="mt-8">
        {currentStep === 0 && (
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Edit Event Details</h2>
            {/* Form içeriği buraya gelebilir */}
          </div>
        )}

        {currentStep === 1 && (
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Event Banner</h2>
            {/* Banner yükleme/düzenleme içeriği */}
          </div>
        )}

        {currentStep === 2 && (
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Ticketing</h2>
            {/* Bilet ayarları içeriği */}
          </div>
        )}

        {currentStep === 3 && (
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Review & Publish</h2>
            {/* İnceleme ve yayınlama içeriği */}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamplePage;
