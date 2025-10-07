import React from 'react';
import { STEP_TITLES } from '../constants/ticketConstants';

const StepIndicator = ({ currentStep, setCurrentStep, validateStepBeforeChange }) => {
 return (
    <div className="flex items-center mb-6">
      {STEP_TITLES.map((title, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;

        const handleClick = () => {
          if (stepNumber === currentStep) return; // already on this step
          
          // Only allow going backward without validation
          if (stepNumber < currentStep) {
            setCurrentStep(stepNumber);
            return;
          }

          // Going forward => validate current step first
          const isValid = validateStepBeforeChange();
          if (isValid) setCurrentStep(stepNumber);
        };

        return (
          <div key={stepNumber} className="flex items-center">
            <div 
              onClick={handleClick} 
              className={`
                cursor-pointer flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                ${isActive ? 'bg-blue-600 text-white' :
                  isCompleted ? 'bg-blue-600 text-white' :
                    'bg-gray-200 text-gray-600'}
              `}
            >
              {stepNumber}
            </div>
            <span 
              onClick={handleClick} 
              className={`ml-2 text-sm ${isActive ? 'font-medium' : 'text-gray-600'} cursor-pointer`}
            >
              {title}
            </span>
            {stepNumber < STEP_TITLES.length && (
              <div className="w-8 h-px bg-gray-300 ml-4" />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StepIndicator;