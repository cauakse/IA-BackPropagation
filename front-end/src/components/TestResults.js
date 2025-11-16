'use client';

import { useState, useEffect, useCallback } from 'react';

export default function TestResults({ confusionMatrix, registerTestUpdate, onBackToHome }) {
  const [matrix, setMatrix] = useState(confusionMatrix || []);
  const [isLoading, setIsLoading] = useState(!confusionMatrix);

  const handleTestData = useCallback((data) => {
    if (Array.isArray(data)) {
      setMatrix(data);
      setIsLoading(false);
    } else {
    }
  }, []);

  useEffect(() => {
    if (registerTestUpdate) {
      registerTestUpdate(handleTestData);
    }
  }, [registerTestUpdate, handleTestData]);

  useEffect(() => {
  }, [matrix, isLoading]);

  const calculateMetrics = () => {
    if (!matrix || matrix.length === 0) return null;

    const numClasses = matrix.length;
    let totalCorrect = 0;
    let totalSamples = 0;
    const metrics = [];

    for (let i = 0; i < numClasses; i++) {
      const tp = matrix[i][i];
      let fp = 0; 
      let fn = 0; 
      let tn = 0; 

      for (let j = 0; j < numClasses; j++) {
        if (j !== i) {
          fp += matrix[j][i]; 
          fn += matrix[i][j];
        }
      }

      const precision = tp + fp > 0 ? (tp / (tp + fp)) : 0;
      const recall = tp + fn > 0 ? (tp / (tp + fn)) : 0;
      const f1Score = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;

      metrics.push({
        class: i,
        precision: precision * 100,
        recall: recall * 100,
        f1Score: f1Score * 100,
        support: matrix[i].reduce((sum, val) => sum + val, 0)
      });

      totalCorrect += tp;
      totalSamples += matrix[i].reduce((sum, val) => sum + val, 0);
    }

    const accuracy = totalSamples > 0 ? (totalCorrect / totalSamples) * 100 : 0;

    return { accuracy, metrics };
  };

  const results = calculateMetrics();

  return (
    <div className="min-h-screen overflow-y-auto py-8" style={{ backgroundColor: '#230f2b' }}>
      <div className="fixed inset-0 overflow-hidden opacity-10 pointer-events-none">
        <div className="absolute top-20 right-1/4 w-32 h-32 rounded-full" style={{ backgroundColor: '#f21d41' }}></div>
        <div className="absolute bottom-40 left-1/4 w-24 h-24 rotate-45" style={{ backgroundColor: '#82b3ae' }}></div>
        <div className="absolute top-1/3 left-1/3 w-16 h-16 rounded-full" style={{ backgroundColor: '#bce3c5' }}></div>
      </div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10 max-w-7xl">
        <div className="mb-8 flex justify-center">
          <button
            onClick={onBackToHome}
            className="px-8 py-3 rounded-xl font-bold text-lg transition-all hover:scale-105 hover:shadow-lg flex items-center gap-3"
            style={{ backgroundColor: '#82b3ae', color: '#230f2b' }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Voltar ao Início
          </button>
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 backdrop-blur-sm mb-6" 
               style={{ borderColor: '#82b3ae', backgroundColor: 'rgba(188, 227, 197, 0.1)' }}>
            <svg className="w-5 h-5" fill="none" stroke="#82b3ae" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-sm font-medium" style={{ color: '#bce3c5' }}>Resultados do Teste</span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold mb-4" style={{ color: '#ebebbc' }}>
            Análise de Desempenho
          </h1>
          <p className="text-lg opacity-80" style={{ color: '#bce3c5' }}>
            Métricas detalhadas e matriz de confusão
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" 
                   style={{ borderColor: '#82b3ae', borderTopColor: 'transparent' }}></div>
              <p className="text-lg" style={{ color: '#ebebbc' }}>Aguardando resultados do teste...</p>
            </div>
          </div>
        ) : results ? (
          <>
            <div className="mb-8 p-8 rounded-2xl backdrop-blur-sm border-2 text-center" 
                 style={{ backgroundColor: 'rgba(130, 179, 174, 0.1)', borderColor: '#82b3ae' }}>
              <h2 className="text-xl font-bold mb-2" style={{ color: '#bce3c5' }}>Acurácia Geral</h2>
              <div className="text-6xl font-bold" style={{ color: '#82b3ae' }}>
                {results.accuracy.toFixed(2)}%
              </div>
            </div>

            <div className="mb-8 p-8 rounded-2xl backdrop-blur-sm border-2" 
                 style={{ backgroundColor: 'rgba(242, 29, 65, 0.05)', borderColor: '#f21d41' }}>
              <h2 className="text-2xl font-bold mb-6" style={{ color: '#ebebbc' }}>
                Matriz de Confusão
              </h2>
              
              <div className="overflow-x-auto">
                <table className="mx-auto border-collapse">
                  <thead>
                    <tr>
                      <th className="p-4 border-2" style={{ borderColor: '#82b3ae', color: '#bce3c5' }}></th>
                      {matrix.map((_, i) => (
                        <th key={i} className="p-4 border-2 font-bold" style={{ borderColor: '#82b3ae', color: '#82b3ae' }}>
                          Classe {i}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {matrix.map((row, i) => (
                      <tr key={i}>
                        <th className="p-4 border-2 font-bold" style={{ borderColor: '#82b3ae', color: '#82b3ae' }}>
                          Classe {i}
                        </th>
                        {row.map((value, j) => (
                          <td 
                            key={j} 
                            className="p-4 border-2 text-center font-mono text-lg font-bold"
                            style={{ 
                              borderColor: '#82b3ae',
                              backgroundColor: i === j 
                                ? 'rgba(188, 227, 197, 0.3)' 
                                : value > 0 
                                  ? 'rgba(242, 29, 65, 0.2)' 
                                  : 'transparent',
                              color: i === j ? '#bce3c5' : value > 0 ? '#f21d41' : '#ebebbc'
                            }}
                          >
                            {value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(188, 227, 197, 0.3)' }}></div>
                  <span style={{ color: '#bce3c5' }}>Acertos (Diagonal)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(242, 29, 65, 0.2)' }}></div>
                  <span style={{ color: '#f21d41' }}>Erros</span>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-2xl backdrop-blur-sm border-2" 
                 style={{ backgroundColor: 'rgba(235, 235, 188, 0.05)', borderColor: '#ebebbc' }}>
              <h2 className="text-2xl font-bold mb-6" style={{ color: '#ebebbc' }}>
                Métricas por Classe
              </h2>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead style={{ backgroundColor: '#230f2b' }}>
                    <tr>
                      <th className="px-6 py-4 text-left font-bold border-b-2" style={{ color: '#82b3ae', borderColor: '#82b3ae' }}>
                        Classe
                      </th>
                      <th className="px-6 py-4 text-left font-bold border-b-2" style={{ color: '#bce3c5', borderColor: '#82b3ae' }}>
                        Precisão
                      </th>
                      <th className="px-6 py-4 text-left font-bold border-b-2" style={{ color: '#f21d41', borderColor: '#82b3ae' }}>
                        Recall
                      </th>
                      <th className="px-6 py-4 text-left font-bold border-b-2" style={{ color: '#ebebbc', borderColor: '#82b3ae' }}>
                        F1-Score
                      </th>
                      <th className="px-6 py-4 text-left font-bold border-b-2" style={{ color: '#82b3ae', borderColor: '#82b3ae' }}>
                        Amostras
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.metrics.map((metric, index) => (
                      <tr key={index} className="border-b" style={{ borderColor: '#82b3ae20' }}>
                        <td className="px-6 py-3 font-bold" style={{ color: '#82b3ae' }}>
                          Classe {metric.class}
                        </td>
                        <td className="px-6 py-3 font-mono" style={{ color: '#bce3c5' }}>
                          {metric.precision.toFixed(2)}%
                        </td>
                        <td className="px-6 py-3 font-mono" style={{ color: '#f21d41' }}>
                          {metric.recall.toFixed(2)}%
                        </td>
                        <td className="px-6 py-3 font-mono" style={{ color: '#ebebbc' }}>
                          {metric.f1Score.toFixed(2)}%
                        </td>
                        <td className="px-6 py-3 font-mono" style={{ color: '#82b3ae' }}>
                          {metric.support}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border" style={{ backgroundColor: 'rgba(188, 227, 197, 0.1)', borderColor: '#bce3c5' }}>
                <h3 className="font-bold mb-2" style={{ color: '#bce3c5' }}>Precisão</h3>
                <p className="text-sm" style={{ color: '#ebebbc' }}>
                  Proporção de predições positivas corretas em relação ao total de predições positivas
                </p>
              </div>
              <div className="p-4 rounded-xl border" style={{ backgroundColor: 'rgba(242, 29, 65, 0.1)', borderColor: '#f21d41' }}>
                <h3 className="font-bold mb-2" style={{ color: '#f21d41' }}>Recall</h3>
                <p className="text-sm" style={{ color: '#ebebbc' }}>
                  Proporção de casos positivos corretamente identificados
                </p>
              </div>
              <div className="p-4 rounded-xl border" style={{ backgroundColor: 'rgba(235, 235, 188, 0.1)', borderColor: '#ebebbc' }}>
                <h3 className="font-bold mb-2" style={{ color: '#ebebbc' }}>F1-Score</h3>
                <p className="text-sm" style={{ color: '#ebebbc' }}>
                  Média harmônica entre precisão e recall
                </p>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
