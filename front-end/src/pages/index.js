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

  const handleConfigComplete = (response) => {
    if(response){
        setCurrentStep('chart');
    }

    //abrir conexao websocket e enviar comando para iniciar treinamento
    webSocket();
  };

  const webSocket = async ()=>{
    const socket = new WebSocket('ws://localhost:8080/training');

    socket.onopen = () => {
      console.log('WebSocket connection established');
      socket.send("start");
    }

    socket.onmessage = (event) => {
      //should update chart with data from event.data
      console.log('Message from server ', event.data);
    }

  }

  return (
    <>
      {currentStep === 'hero' && <Hero onStart={handleStartTraining} />}
      {currentStep === 'form' && <TrainingForm onFileUploaded={handleFileUploaded} />}
      {currentStep === 'config' && <ConfigForm onConfigComplete={handleConfigComplete} />}
      {currentStep === 'chart' && <div>Chart Component Placeholder</div>}
    </>
  );
}
