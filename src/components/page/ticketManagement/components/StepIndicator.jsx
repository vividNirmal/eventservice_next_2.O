import React from 'react';
import { STEP_TITLES } from '../constants/ticketConstants';
import { cn } from '@/lib/utils';

const StepIndicator = ({ currentStep, setCurrentStep, validateStepBeforeChange }) => {
 return (
    <ul className="flex flex-row sm:flex-col gap-4 sm:gap-0">
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
          <li key={stepNumber} className={cn("flex items-center sm:items-start flex-col sm:flex-row gap-1 last:pb-0 sm:pb-8 last:mb-0 last:after:hidden relative after:w-full sm:after:w-px after:h-px sm:after:h-full after:absolute after:left-8 sm:after:left-4 after:top-4 sm:after:top-0", isActive ? 'after:bg-gradient-to-t after:from-blue-100 after:to-blue-600' : isCompleted ? 'after:bg-blue-600' : 'after:bg-zinc-300')}>
            <div onClick={handleClick} className={cn("relative z-1 shrink-0 cursor-pointer flex items-center justify-center size-8 rounded-full text-sm font-medium", isActive ? 'bg-blue-600 text-white' : isCompleted ? 'bg-blue-600 text-white' : 'bg-zinc-200 text-zinc-600')}>{stepNumber}</div>
            <span onClick={handleClick} className={cn("select-none sm:min-h-8 flex items-center w-full sm:w-2/4 sm:grow sm:ml-3 text-center sm:text-left text-xs lg:text-sm leading-tight sm:leading-normal cursor-pointer", isActive ? 'font-medium' : isCompleted ? 'text-blue-700 font-semibold' : ' text-zinc-600')}>{title}</span>
          </li>
        );
      })}
    </ul>
  );
};

export default StepIndicator;