import React from 'react';
import { STEP_TITLES } from '../constants/ticketConstants';

const StepIndicator = ({ currentStep, setCurrentStep }) => {
  return (
    <div className="flex items-center mb-6">
      {STEP_TITLES.map((title, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;

        return (
          <div key={stepNumber} className="flex items-center">
            <div 
              onClick={() => setCurrentStep(stepNumber)} 
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
              onClick={() => setCurrentStep(stepNumber)} 
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