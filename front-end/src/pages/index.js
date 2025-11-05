'use client';

import { useState } from 'react';
import Hero from "@/components/Hero";
import TrainingForm from "@/components/TrainingForm";

export default function Home() {
  const [currentStep, setCurrentStep] = useState('hero'); // 'hero', 'form', 'config'

  const handleStartTraining = () => {
    setCurrentStep('form');
  };

  const handleFileUploaded = () => {
    setCurrentStep('config');
  };

  return (
    <>
      {currentStep === 'hero' && <Hero onStart={handleStartTraining} />}
      {currentStep === 'form' && <TrainingForm onFileUploaded={handleFileUploaded} />}
      {currentStep === 'config' && (
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#230f2b' }}>
          <h1 className="text-4xl font-bold" style={{ color: '#ebebbc' }}>exemplo</h1>
        </div>
      )}
    </>
  );
}
