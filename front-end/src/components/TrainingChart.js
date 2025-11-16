'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  LogarithmicScale
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function TrainingChart({ onTrainingComplete, initWebSocket, registerChartUpdate, config }) {
  const [trainingData, setTrainingData] = useState([]);
  const [isTraining, setIsTraining] = useState(true);
  const [currentEpoch, setCurrentEpoch] = useState(0);
  const [currentError, setCurrentError] = useState(0);
  const [stoppingReason, setStoppingReason] = useState(null);
  const [minError, setMinError] = useState(Infinity);
  const [maxError, setMaxError] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showPlateauModal, setShowPlateauModal] = useState(false);
  const [isPlateauStop, setIsPlateauStop] = useState(false);
  const [quantidadeDeContinuacao, setQuantidadeDeContinuacao] = useState(0);
  
  const updateQueueRef = useRef([]);
  const lastUpdateRef = useRef(0);
  const animationFrameRef = useRef(null);
  const seenEpochsRef = useRef(new Set());
  const socketRef = useRef(null);
  const processQueueRef = useRef(null);

  const processQueue = useCallback(() => {
    const now = performance.now();
    

    if (now - lastUpdateRef.current < 100) {
      animationFrameRef.current = requestAnimationFrame(processQueueRef.current);
      return;
    }
    
    lastUpdateRef.current = now;
    const batch = updateQueueRef.current.splice(0, updateQueueRef.current.length);
    
    if (batch.length === 0) {
      animationFrameRef.current = null;
      return;
    }

    const lastItem = batch[batch.length - 1];
    setCurrentEpoch(lastItem.epocaAtual);
    setCurrentError(lastItem.erroEpoca);

    setMinError(prev => {
      const batchMin = batch.reduce((min, item) => Math.min(min, item.erroEpoca), prev === Infinity ? lastItem.erroEpoca : prev);
      return batchMin;
    });
    setMaxError(prev => {
      const batchMax = batch.reduce((max, item) => Math.max(max, item.erroEpoca), prev);
      return batchMax;
    });


    setTrainingData(prev => {
      const existingEpochs = new Set(prev.map(d => d.epoca));
      const newData = batch
        .filter(d => !existingEpochs.has(d.epocaAtual))
        .map(d => ({
          epoca: d.epocaAtual,
          erro: parseFloat(d.erroEpoca.toFixed(6))
        }));
      
      return [...prev, ...newData];
    });


    if (lastItem.parouPor && lastItem.parouPor.some(val => val === 1)) {
 
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      updateQueueRef.current = [];
      
      const reasons = [];
      if (lastItem.parouPor[0] === 1) {
        reasons.push('Erro Aceitável');
      }
      if (lastItem.parouPor[1] === 1) {
        reasons.push('Máximo de Épocas');
      }
      if (lastItem.parouPor[2] === 1) {
        reasons.push('Identificado Platô');
        setIsPlateauStop(true);
        setShowPlateauModal(true);

      }

      setStoppingReason(reasons.join(' + '));
      setIsTraining(false);
    } else if (updateQueueRef.current.length > 0) {
      animationFrameRef.current = requestAnimationFrame(processQueueRef.current);
    } else {
      animationFrameRef.current = null;
    }
  }, []);


  useEffect(() => {
    processQueueRef.current = processQueue;
  }, [processQueue]);

  const handleWebSocketData = useCallback((epochData) => {
    
    

    if (seenEpochsRef.current.has(epochData.epocaAtual)) {

      if (epochData.parouPor === null || epochData.parouPor === undefined) {
        return;
      } else {

      }
    } else {
      seenEpochsRef.current.add(epochData.epocaAtual);
    }
    
    updateQueueRef.current.push(epochData);
    
    

    if (!animationFrameRef.current) {
      animationFrameRef.current = requestAnimationFrame(processQueueRef.current);
    }
  }, []);


  useEffect(() => {
    registerChartUpdate(handleWebSocketData);

    socketRef.current = initWebSocket.current;
    

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [initWebSocket, registerChartUpdate, handleWebSocketData]);


  useEffect(() => {
  }, [showPlateauModal, isPlateauStop]);


  const handleStopTraining = () => {
    setShowPlateauModal(false);
    onTrainingComplete();
  };

  const handleReduceLearningRate = () => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.send('/app/continue', {}, 'learningRate reduce');
      setQuantidadeDeContinuacao(quantidadeDeContinuacao + 1);
      setShowPlateauModal(false);
      setIsTraining(true);
      setIsPlateauStop(false);
      setStoppingReason(null);
    }
  };

  const handleContinueTraining = () => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.send('/app/continue', {}, '');
      setShowPlateauModal(false);
      setIsTraining(true);
      setIsPlateauStop(false);
      setStoppingReason(null);
    }
  };

  return (
    <div className="min-h-screen overflow-y-auto py-8" style={{ backgroundColor: '#230f2b' }}>

      <div className="fixed inset-0 overflow-hidden opacity-10 pointer-events-none">
        <div className="absolute top-20 right-1/4 w-32 h-32 rounded-full" style={{ backgroundColor: '#f21d41' }}></div>
        <div className="absolute bottom-40 left-1/4 w-24 h-24 rotate-45" style={{ backgroundColor: '#82b3ae' }}></div>
        <div className="absolute top-1/3 left-1/3 w-16 h-16 rounded-full" style={{ backgroundColor: '#bce3c5' }}></div>
      </div>

      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-6 left-6 z-50 p-3 rounded-xl backdrop-blur-md border-2 hover:scale-110 transition-transform"
        style={{ backgroundColor: 'rgba(35, 15, 43, 0.9)', borderColor: '#82b3ae' }}
      >
        <svg className="w-6 h-6" fill="none" stroke="#ebebbc" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div
        className={`fixed top-0 left-0 h-full w-80 backdrop-blur-xl border-r-2 transform transition-transform duration-300 z-40 overflow-y-auto ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ backgroundColor: 'rgba(35, 15, 43, 0.95)', borderColor: '#82b3ae' }}
      >
        <div className="p-6 mt-16">
          <h2 className="text-2xl font-bold mb-6" style={{ color: '#ebebbc' }}>
            Configurações
          </h2>

          {config ? (
            <div className="space-y-4">

              <div className="p-4 rounded-xl border" style={{ backgroundColor: 'rgba(130, 179, 174, 0.1)', borderColor: '#82b3ae' }}>
                <h3 className="text-sm font-bold mb-3" style={{ color: '#82b3ae' }}>NEURÔNIOS</h3>
                <div className="space-y-2 text-sm" style={{ color: '#ebebbc' }}>
                  <div className="flex justify-between">
                    <span>Entrada:</span>
                    <span className="font-mono font-bold">{config.inputLayer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Oculta:</span>
                    <span className="font-mono font-bold">{config.hiddenLayer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saída:</span>
                    <span className="font-mono font-bold">{config.outputLayer}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border" style={{ backgroundColor: 'rgba(242, 29, 65, 0.1)', borderColor: '#f21d41' }}>
                <h3 className="text-sm font-bold mb-3" style={{ color: '#f21d41' }}>PARÂMETROS</h3>
                <div className="space-y-2 text-sm" style={{ color: '#ebebbc' }}>
                  <div className="flex justify-between">
                    <span>Erro Aceitável:</span>
                    <span className="font-mono font-bold">{config.errorValue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Máx. Iterações:</span>
                    <span className="font-mono font-bold">{config.iterations}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxa Aprendizado:</span>
                    <span className="font-mono font-bold">{config.learningRate}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border" style={{ backgroundColor: 'rgba(188, 227, 197, 0.1)', borderColor: '#bce3c5' }}>
                <h3 className="text-sm font-bold mb-3" style={{ color: '#bce3c5' }}>CONFIGURAÇÕES</h3>
                <div className="space-y-2 text-sm" style={{ color: '#ebebbc' }}>
                  <div className="flex justify-between">
                    <span>Função Transferência:</span>
                    <span className="font-mono font-bold capitalize">{config.transferFunction}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Usar Bias:</span>
                    <span className="font-mono font-bold">{config.useBias ? 'Sim' : 'Não'}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl border text-center" style={{ backgroundColor: 'rgba(242, 29, 65, 0.1)', borderColor: '#f21d41' }}>
              <p className="text-sm" style={{ color: '#ebebbc' }}>
                Nenhuma configuração disponível
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10 max-w-7xl">
   
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 backdrop-blur-sm mb-6" 
               style={{ borderColor: '#82b3ae', backgroundColor: 'rgba(188, 227, 197, 0.1)' }}>
            <div className={`w-2 h-2 rounded-full ${isTraining ? 'animate-pulse' : ''}`} 
                 style={{ backgroundColor: isTraining ? '#f21d41' : '#82b3ae' }}></div>
            <span className="text-sm font-medium" style={{ color: '#bce3c5' }}>
              {isTraining ? 'Treinamento em Andamento' : 'Treinamento Concluído'}
            </span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold mb-4" style={{ color: '#ebebbc' }}>
            Visualização do Treinamento
          </h1>
          <p className="text-lg opacity-80" style={{ color: '#bce3c5' }}>
            Acompanhe a evolução do erro por época em tempo real
          </p>
        </div>

        {!isTraining && !isPlateauStop && (
          <div className="mb-8 flex justify-center">
            <button
              onClick={onTrainingComplete}
              className="px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 hover:shadow-lg"
              style={{ backgroundColor: '#82b3ae', color: '#230f2b' }}
            >
              Próxima Etapa: Teste →
            </button>
          </div>
        )}

        {stoppingReason && (
          <div className="mb-8 p-6 rounded-2xl backdrop-blur-sm border-2 text-center animate-pulse" 
               style={{ backgroundColor: 'rgba(242, 29, 65, 0.15)', borderColor: '#f21d41' }}>
            <div className="flex items-center justify-center gap-3">
              <svg className="w-6 h-6" fill="none" stroke="#f21d41" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xl font-bold" style={{ color: '#ebebbc' }}>
                Treinamento Parou: <span style={{ color: '#f21d41' }}>{stoppingReason}</span>
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Época Atual */}
          <div className="p-6 rounded-2xl backdrop-blur-sm border-2 text-center transform hover:scale-105 transition-all" 
               style={{ backgroundColor: 'rgba(130, 179, 174, 0.1)', borderColor: '#82b3ae' }}>
            <div className="text-sm font-medium mb-2" style={{ color: '#bce3c5' }}>Época Atual</div>
            <div className="text-4xl font-bold" style={{ color: '#82b3ae' }}>{currentEpoch}</div>
          </div>

          <div className="p-6 rounded-2xl backdrop-blur-sm border-2 text-center transform hover:scale-105 transition-all" 
               style={{ backgroundColor: 'rgba(242, 29, 65, 0.1)', borderColor: '#f21d41' }}>
            <div className="text-sm font-medium mb-2" style={{ color: '#bce3c5' }}>Erro Atual</div>
            <div className="text-3xl font-bold" style={{ color: '#f21d41' }}>
              {currentError.toFixed(6)}
            </div>
          </div>

          <div className="p-6 rounded-2xl backdrop-blur-sm border-2 text-center transform hover:scale-105 transition-all" 
               style={{ backgroundColor: 'rgba(188, 227, 197, 0.1)', borderColor: '#bce3c5' }}>
            <div className="text-sm font-medium mb-2" style={{ color: '#bce3c5' }}>Erro Mínimo</div>
            <div className="text-3xl font-bold" style={{ color: '#bce3c5' }}>
              {minError === Infinity ? '---' : minError.toFixed(6)}
            </div>
          </div>

          <div className="p-6 rounded-2xl backdrop-blur-sm border-2 text-center transform hover:scale-105 transition-all" 
               style={{ backgroundColor: 'rgba(235, 235, 188, 0.1)', borderColor: '#ebebbc' }}>
            <div className="text-sm font-medium mb-2" style={{ color: '#bce3c5' }}>Erro Máximo</div>
            <div className="text-3xl font-bold" style={{ color: '#ebebbc' }}>
              {maxError === 0 ? '---' : maxError.toFixed(6)}
            </div>
          </div>
        </div>

        <div className="p-8 rounded-2xl backdrop-blur-sm border-2 mb-8" 
             style={{ backgroundColor: 'rgba(242, 29, 65, 0.05)', borderColor: '#f21d41' }}>
          <h2 className="text-2xl font-bold mb-6" style={{ color: '#ebebbc' }}>
            Convergência do Erro
          </h2>

          {trainingData.length > 0 ? (
            <div style={{ height: '400px' }}>
              <Line
                data={{
                  labels: trainingData.map(d => d.epoca),
                  datasets: [
                    {
                      label: 'Erro',
                      data: trainingData.map(d => d.erro),
                      borderColor: '#f21d41',
                      backgroundColor: 'rgba(242, 29, 65, 0.1)',
                      borderWidth: 2,
                      pointRadius: 0,
                      pointHitRadius: 10,
                      tension: 0.1
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  animation: {
                    duration: 0
                  },
                  interaction: {
                    mode: 'nearest',
                    intersect: false
                  },
                  plugins: {
                    legend: {
                      display: false
                    },
                    tooltip: {
                      backgroundColor: 'rgba(35, 15, 43, 0.95)',
                      titleColor: '#ebebbc',
                      bodyColor: '#f21d41',
                      borderColor: '#82b3ae',
                      borderWidth: 2,
                      padding: 12,
                      displayColors: false,
                      callbacks: {
                        title: (context) => `Época ${context[0].label}`,
                        label: (context) => `Erro: ${context.parsed.y.toFixed(6)}`
                      }
                    }
                  },
                  scales: {
                    x: {
                      type: 'category',
                      ticks: {
                        color: '#bce3c5',
                        maxTicksLimit: 10
                      },
                      grid: {
                        color: 'rgba(242, 29, 65, 0.1)'
                      }
                    },
                    y: {
                      type: 'logarithmic',
                      ticks: {
                        color: '#bce3c5'
                      },
                      grid: {
                        color: 'rgba(242, 29, 65, 0.1)'
                      }
                    }
                  }
                }}
              />
            </div>
          ) : (
            <div className="h-[400px] flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" 
                     style={{ borderColor: '#82b3ae', borderTopColor: 'transparent' }}></div>
                <p className="text-lg" style={{ color: '#ebebbc' }}>Aguardando dados de treinamento...</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-8 rounded-2xl backdrop-blur-sm border-2" 
             style={{ backgroundColor: 'rgba(235, 235, 188, 0.05)', borderColor: '#ebebbc' }}>
          <h2 className="text-2xl font-bold mb-6" style={{ color: '#ebebbc' }}>
            Histórico de Épocas
          </h2>
          
          <div className="max-h-[400px] overflow-y-auto rounded-lg" 
               style={{ backgroundColor: 'rgba(35, 15, 43, 0.3)' }}>
            <table className="w-full">
              <thead className="sticky top-0" style={{ backgroundColor: '#230f2b' }}>
                <tr>
                  <th className="px-6 py-4 text-left font-bold border-b-2" style={{ color: '#82b3ae', borderColor: '#82b3ae' }}>
                    Época
                  </th>
                  <th className="px-6 py-4 text-left font-bold border-b-2" style={{ color: '#f21d41', borderColor: '#82b3ae' }}>
                    Erro
                  </th>
                  <th className="px-6 py-4 text-left font-bold border-b-2" style={{ color: '#bce3c5', borderColor: '#82b3ae' }}>
                    Variação
                  </th>
                </tr>
              </thead>
              <tbody>
                {trainingData.map((data, index) => {
                  const variation = index > 0 
                    ? ((data.erro - trainingData[index - 1].erro) / trainingData[index - 1].erro * 100).toFixed(2)
                    : 0;
                  
                  return (
                    <tr key={index} className="border-b transition-colors hover:bg-opacity-10" 
                        style={{ borderColor: '#82b3ae20' }}>
                      <td className="px-6 py-3" style={{ color: '#ebebbc' }}>
                        {data.epoca}
                      </td>
                      <td className="px-6 py-3 font-mono" style={{ color: '#f21d41' }}>
                        {data.erro.toFixed(6)}
                      </td>
                      <td className="px-6 py-3 font-mono" style={{ 
                        color: variation < 0 ? '#82b3ae' : variation > 0 ? '#f21d41' : '#ebebbc' 
                      }}>
                        {variation !== 0 && (variation > 0 ? '+' : '')}{variation}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showPlateauModal && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}>
          <div className="max-w-2xl w-full p-8 rounded-2xl border-2" 
               style={{ backgroundColor: '#230f2b', borderColor: '#f21d41' }}>
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" 
                   style={{ backgroundColor: 'rgba(242, 29, 65, 0.2)' }}>
                <svg className="w-10 h-10" fill="none" stroke="#f21d41" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold mb-2" style={{ color: '#ebebbc' }}>
                Platô Identificado
              </h2>
              <p className="text-lg" style={{ color: '#bce3c5' }}>
                O erro parou de diminuir. Escolha como deseja continuar:
              </p>
            </div>

            {/* Opções */}
            <div className="space-y-4 mb-6">
              {/* Interromper Treinamento */}
              <button
                onClick={handleStopTraining}
                className="w-full p-6 rounded-xl border-2 text-left transition-all hover:scale-102 hover:shadow-lg group"
                style={{ backgroundColor: 'rgba(242, 29, 65, 0.1)', borderColor: '#f21d41' }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform" 
                       style={{ backgroundColor: 'rgba(242, 29, 65, 0.3)' }}>
                    <svg className="w-6 h-6" fill="none" stroke="#f21d41" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1" style={{ color: '#f21d41' }}>Interromper Treinamento</h3>
                    <p className="text-sm" style={{ color: '#bce3c5' }}>Finalizar e prosseguir para a próxima etapa</p>
                  </div>
                </div>
              </button>

              {/* Reduzir Taxa de Aprendizado */}
              <button
                onClick={handleReduceLearningRate}
                className="w-full p-6 rounded-xl border-2 text-left transition-all hover:scale-102 hover:shadow-lg group"
                style={{ backgroundColor: 'rgba(130, 179, 174, 0.1)', borderColor: '#82b3ae' }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform" 
                       style={{ backgroundColor: 'rgba(130, 179, 174, 0.3)' }}>
                    <svg className="w-6 h-6" fill="none" stroke="#82b3ae" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1" style={{ color: '#82b3ae' }}>Reduzir Taxa de Aprendizado</h3>
                    <p className="text-sm" style={{ color: '#bce3c5' }}>{quantidadeDeContinuacao == 2? "Irá continuar com a mesma configuração mas desativará a identificação de platô": "Continuar com taxa de aprendizado reduzida"}</p>
                  </div>
                </div>
              </button>

              {/* Continuar Sem Alterações */}
              <button
                onClick={handleContinueTraining}
                className="w-full p-6 rounded-xl border-2 text-left transition-all hover:scale-102 hover:shadow-lg group"
                style={{ backgroundColor: 'rgba(235, 235, 188, 0.1)', borderColor: '#ebebbc' }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform" 
                       style={{ backgroundColor: 'rgba(235, 235, 188, 0.2)' }}>
                    <svg className="w-6 h-6" fill="none" stroke="#ebebbc" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1" style={{ color: '#ebebbc' }}>Continuar Sem Alterações</h3>
                    <p className="text-sm" style={{ color: '#bce3c5' }}>Prosseguir com a configuração atual - Irá desativar a identificação de platô</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
