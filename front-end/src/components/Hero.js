'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function Hero({ onStart }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="min-h-screen h-screen flex items-center overflow-hidden relative" style={{ backgroundColor: '#230f2b' }}>
      {/* Formas geométricas decorativas no fundo */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute top-20 right-1/4 w-32 h-32 rounded-full" style={{ backgroundColor: '#f21d41' }}></div>
        <div className="absolute bottom-40 right-1/3 w-24 h-24 rotate-45" style={{ backgroundColor: '#82b3ae' }}></div>
        <div className="absolute top-1/3 right-1/2 w-16 h-16 rounded-full" style={{ backgroundColor: '#bce3c5' }}></div>
        <div className="absolute bottom-20 right-1/4 w-20 h-20" style={{ backgroundColor: '#ebebbc' }}></div>
      </div>

      <div className="container mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10 max-w-7xl">
        {/* Seção da esquerda - Texto */}
        <div className="space-y-8 py-12">
          {/* Logo/Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 backdrop-blur-sm" 
               style={{ borderColor: '#82b3ae', backgroundColor: 'rgba(188, 227, 197, 0.1)' }}>
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#f21d41' }}></div>
            <span className="text-sm font-medium" style={{ color: '#bce3c5' }}>Trabalho de IA – 2º Bimestre</span>
          </div>

          {/* Título Principal */}
          <div className="space-y-4">
            <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
              <span style={{ color: '#ebebbc' }}>Rede Neural</span>
              <br />
              <span className="relative inline-block mt-2">
                <span style={{ color: '#f21d41' }}>MLP</span>
                <div className="absolute -bottom-2 left-0 w-full h-1 rounded-full" 
                     style={{ backgroundColor: '#82b3ae' }}></div>
              </span>
            </h1>
            
            <h2 className="text-2xl lg:text-3xl font-semibold" style={{ color: '#bce3c5' }}>
              Backpropagation
            </h2>
          </div>

          {/* Descrição */}
          <p className="text-lg leading-relaxed opacity-90 max-w-xl" style={{ color: '#ebebbc' }}>
            Implementação de uma ferramenta para treinamento de Redes Neurais Multilayer Perceptron 
            utilizando o algoritmo Backpropagation para classificação de dados.
          </p>

          {/* Botão CTA */}
          <div className="pt-4">
            <button
              onClick={onStart}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="group relative px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl overflow-hidden"
              style={{ 
                backgroundColor: isHovered ? '#f21d41' : '#82b3ae',
                color: '#230f2b'
              }}
            >
              <span className="relative z-10 flex items-center gap-2">
                Iniciar Treinamento
                <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" 
                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              
              {/* Efeito de brilho no hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                   style={{ backgroundColor: '#ebebbc' }}></div>
            </button>
          </div>

        </div>

        {/* Seção da direita - Ilustrações */}
        <div className="relative hidden lg:block h-full py-12">
          {/* Grid de formas geométricas decorativas */}
          <div className="absolute inset-0 grid grid-cols-4 gap-4 opacity-20">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="relative">
                {i % 3 === 0 && (
                  <div className="w-full aspect-square rounded-full animate-pulse" 
                       style={{ 
                         backgroundColor: ['#f21d41', '#82b3ae', '#bce3c5'][i % 3],
                         animationDelay: `${i * 0.2}s`
                       }}></div>
                )}
                {i % 3 === 1 && (
                  <div className="w-full aspect-square rotate-45" 
                       style={{ 
                         backgroundColor: '#ebebbc',
                         animationDelay: `${i * 0.2}s`
                       }}></div>
                )}
                {i % 3 === 2 && (
                  <div className="w-full aspect-square rounded-lg" 
                       style={{ 
                         backgroundColor: '#82b3ae',
                         animationDelay: `${i * 0.2}s`
                       }}></div>
                )}
              </div>
            ))}
          </div>

          {/* Ilustrações SVG principais */}
          <div className="relative z-10 h-full flex flex-col justify-center space-y-8">
            {/* Ilustração principal - AI */}
            <div className="relative w-full max-w-md mx-auto transform hover:scale-105 transition-transform duration-500">
              <div className="absolute -inset-4 rounded-3xl opacity-20 blur-2xl" 
                   style={{ backgroundColor: '#f21d41' }}></div>
              <div className="relative p-8 rounded-3xl backdrop-blur-sm border-2" 
                   style={{ backgroundColor: 'rgba(188, 227, 197, 0.05)', borderColor: '#bce3c5' }}>
                <Image 
                  src="/undraw_artificial-intelligence_43qa.svg" 
                  alt="Artificial Intelligence" 
                  width={400} 
                  height={300}
                  className="w-full h-auto"
                />
              </div>
            </div>

          </div>

          {/* Círculos decorativos flutuantes */}
          <div className="absolute top-1/4 right-0 w-24 h-24 rounded-full animate-bounce" 
               style={{ backgroundColor: '#f21d41', opacity: 0.3, animationDuration: '3s' }}></div>
          <div className="absolute bottom-1/4 left-0 w-16 h-16 rounded-full animate-bounce" 
               style={{ backgroundColor: '#bce3c5', opacity: 0.3, animationDuration: '4s', animationDelay: '1s' }}></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
}
