interface Step {
  label: string;
  isCompleted: boolean;
  isActive: boolean;
}

interface StepperProps {
  steps: string[];
  activeStep: number;
  onChange?: (step: number) => void;
  className?: string;
  showButtons?: boolean;
}

const Stepper: React.FC<StepperProps> = ({
  steps,
  activeStep,
  onChange,
  className = "",
  showButtons = false,
}) => {
  const handleNext = () => {
    if (activeStep < steps.length - 1 && onChange) {
      onChange(activeStep + 1);
    }
  };

  const handlePrev = () => {
    if (activeStep > 0 && onChange) {
      onChange(activeStep - 1);
    }
  };

  const getStepStatus = (index: number): Step => {
    return {
      label: steps[index],
      isActive: index === activeStep,
      isCompleted: index <= activeStep,
    };
  };

  return (
    <div className={`flex flex-col items-center w-full ${className}`}>
      <div className="relative w-full mb-8">
        {/* Container div to position lines */}
        <div className="relative">
          {/* Main background line - positioned to be in the center of circles */}
          <div className="absolute top-3 h-px w-full bg-gray-300"></div>

          {/* Active line - positioned to be in the center of circles */}
          <div
            className="absolute top-3 h-px bg-gray-800 transition-all duration-300"
            style={{
              width: `${(100 * (activeStep + 1)) / steps.length}%`,
            }}
          ></div>

          {/* Step circles */}
          <div className="relative flex justify-between">
            {steps.map((label, index) => {
              const stepStatus = getStepStatus(index);

              return (
                <div key={label} className="flex flex-col items-center">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center border z-10 ${
                      stepStatus.isCompleted
                        ? "border-gray-800 bg-white"
                        : "border-gray-300 bg-white"
                    }`}
                  >
                    {stepStatus.isCompleted && (
                      <div className="w-3 h-3 rounded-full bg-gray-800"></div>
                    )}
                  </div>
                  <span
                    className={`mt-2 text-sm ${
                      stepStatus.isCompleted ? "text-gray-800" : "text-gray-400"
                    }`}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {showButtons && (
        <div className="flex gap-4">
          <button
            onClick={handlePrev}
            disabled={activeStep === 0}
            className={`px-4 py-2 rounded ${
              activeStep === 0
                ? "bg-gray-200 text-gray-500"
                : "bg-gray-800 text-white"
            }`}
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            disabled={activeStep === steps.length - 1}
            className={`px-4 py-2 rounded ${
              activeStep === steps.length - 1
                ? "bg-gray-200 text-gray-500"
                : "bg-gray-800 text-white"
            }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Stepper;
