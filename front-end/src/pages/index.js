'use client';

import { Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useState, useRef, useEffect } from 'react';
import Hero from "@/components/Hero";
import TrainingForm from "@/components/TrainingForm";
import ConfigForm from "@/components/ConfigForm";
import TrainingChart from "@/components/TrainingChart";
import TestForm from "@/components/TestForm";
import TestResults from "@/components/TestResults";
import { getReset } from './api/api';

export default function Home() {
  const [currentStep, setCurrentStep] = useState('hero'); // 'hero', 'form', 'config', 'chart', 'test', 'results'
  const [configData, setConfigData] = useState(null);
  const socketRef = useRef(null);
  const chartUpdateRef = useRef(null);
  const testUpdateRef = useRef(null);
  const bufferedMatrixRef = useRef(null); // Buffer para armazenar matriz até callback estar pronto
  const stompClientRef = useRef(null);

  useEffect(()=>{
    initWebSocket();
    const resetTest = async ()=>{
        await getReset();
    }
    resetTest();
  },[])

  const handleStartTraining = () => {
    setCurrentStep('form');
  };

  const handleFileUploaded = () => {
    setCurrentStep('config');
  };

  const handleConfigComplete = (response) => {
    if(response){
        setConfigData(response);
        stompClientRef.current.send("/app/start", {}, ""); // Iniciar treinamento
        setCurrentStep('chart');
    }
  };

  const handleTrainingComplete = () => {
    setCurrentStep('test');
  };

  const handleTestComplete = () => {
    setCurrentStep('results');
  };

  const handleBackToHome = () => {

    setCurrentStep('hero');
    setConfigData(null);
    bufferedMatrixRef.current = null;
    chartUpdateRef.current = null;
    testUpdateRef.current = null;

  };

  const registerTestUpdate = (updateFn) => {
    testUpdateRef.current = updateFn;
    if (bufferedMatrixRef.current) {
      updateFn(bufferedMatrixRef.current);
      bufferedMatrixRef.current = null; 
    }
  };

  const registerChartUpdate = (updateFn) => {
    chartUpdateRef.current = updateFn;
  };

const initWebSocket = () => {
  if (stompClientRef.current) {
    return; 
  }

  const socket = new SockJS('http://localhost:8080/training');
  const stompClient = Stomp.over(socket);
  stompClientRef.current = stompClient;
  stompClient.debug = () => {};

  stompClient.connect(
    {},
    (frame) => {

      stompClient.subscribe('/topic/progress', (message) => {
        try {
          const parsedData = JSON.parse(message.body);

          if (Array.isArray(parsedData) && Array.isArray(parsedData[0])) {
            if (testUpdateRef.current) {
              testUpdateRef.current(parsedData);
            } else {
              bufferedMatrixRef.current = parsedData;
            }
          } else {
            if (chartUpdateRef.current) {
              chartUpdateRef.current(parsedData);
            }
          }
        } catch (e) {
          console.error('Erro ao processar dados do WebSocket:', e);
        }
      });
    },
    (error) => {
      console.error('STOMP connection error:', error);
      stompClientRef.current = null;
    }
  );

  stompClient.onDisconnect = () => {
    console.log('STOMP connection closed');
    stompClientRef.current = null;
  };
};

  return (
    <>
      {currentStep === 'hero' && <Hero onStart={handleStartTraining} />}
      {currentStep === 'form' && <TrainingForm onFileUploaded={handleFileUploaded} />}
      {currentStep === 'config' && <ConfigForm onConfigComplete={handleConfigComplete} />}
      {currentStep === 'chart' && (
        <TrainingChart 
          onTrainingComplete={handleTrainingComplete}
          initWebSocket={stompClientRef}
          registerChartUpdate={registerChartUpdate}
          config={configData}
        />
      )}
      {currentStep === 'test' && <TestForm onTestComplete={handleTestComplete} initWebSocket={stompClientRef} />}
      {currentStep === 'results' && <TestResults registerTestUpdate={registerTestUpdate} onBackToHome={handleBackToHome} />}
    </>
  );
}
