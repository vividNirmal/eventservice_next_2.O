import React from 'react';
import { STEP_TITLES } from '../constants/exhibitorFormConstants';
import { cn } from '@/lib/utils';

const StepIndicator = ({ currentStep, setCurrentStep, validateStepBeforeChange }) => {
  return (
    <ul className="flex flex-row justify-between gap-0">
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
          <li key={stepNumber} className={cn("flex items-center flex-col gap-1 grow last:mr-0 last:after:hidden relative after:w-full after:h-px after:absolute after:left-14 md:after:left-20 xl:after:left-24 after:top-4", isActive ? 'after:bg-gradient-to-r after:from-blue-600 after:to-blue-100' : isCompleted ? 'after:bg-blue-600' : 'after:bg-zinc-300')}>
            <div onClick={handleClick} className={cn("relative z-1 shrink-0 cursor-pointer flex items-center justify-center size-8 rounded-full text-sm font-medium", isActive ? 'bg-blue-600 text-white' : isCompleted ? 'bg-blue-600 text-white' : 'bg-zinc-200 text-zinc-600')}>{stepNumber}</div>
            <span onClick={handleClick} className={cn("select-none min-w-max flex items-center ml-3 text-left text-xs lg:text-sm leading-tight cursor-pointer", isActive ? 'font-medium' : isCompleted ? 'text-blue-700 font-semibold' : 'text-zinc-600')}>{title}</span>
          </li>
        );
      })}
    </ul>
  );
};

export default StepIndicator;