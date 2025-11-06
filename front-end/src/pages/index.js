'use client';

import { useState } from 'react';
import Hero from "@/components/Hero";
import TrainingForm from "@/components/TrainingForm";
import ConfigForm from "@/components/ConfigForm";

export default function Home() {
  const [currentStep, setCurrentStep] = useState('hero'); // 'hero', 'form', 'config'

  const handleStartTraining = () => {
    setCurrentStep('form');
  };

  const handleFileUploaded = () => {
    setCurrentStep('config');
  };

  const handleConfigComplete = () => {
    // Próxima etapa - você pode implementar depois
    console.log('Configuração completa!');
  };

  return (
    <>
      {currentStep === 'hero' && <Hero onStart={handleStartTraining} />}
      {currentStep === 'form' && <TrainingForm onFileUploaded={handleFileUploaded} />}
      {currentStep === 'config' && <ConfigForm onConfigComplete={handleConfigComplete} />}
    </>
  );
}
