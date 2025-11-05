'use client';

import { postFilePath } from '@/pages/api/api';
import { useState, useRef } from 'react';

export default function TrainingForm({ onFileUploaded }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith('.csv')) {
      setSelectedFile(file);
    } else {
      alert('Por favor, selecione um arquivo CSV válido');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.csv')) {
      setSelectedFile(file);
    } else {
      alert('Por favor, selecione um arquivo CSV válido');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Por favor, selecione um arquivo primeiro');
      return;
    }

    setIsUploading(true);

    try {
      // Criar FormData para enviar o arquivo
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('filePath', selectedFile.name);

      // Chamada de exemplo para a API (você vai implementar)

      const response = await postFilePath(formData);
    
        if (response && response.status === 200) {
        // Se retornar 200, chama a função para ir para próxima etapa
        onFileUploaded();
      } else {
        alert('Erro ao fazer upload do arquivo');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao fazer upload do arquivo');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen h-screen flex items-center justify-center overflow-hidden relative" style={{ backgroundColor: '#230f2b' }}>
      {/* Formas geométricas decorativas no fundo */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute top-20 right-1/4 w-32 h-32 rounded-full" style={{ backgroundColor: '#f21d41' }}></div>
        <div className="absolute bottom-40 left-1/4 w-24 h-24 rotate-45" style={{ backgroundColor: '#82b3ae' }}></div>
        <div className="absolute top-1/3 left-1/3 w-16 h-16 rounded-full" style={{ backgroundColor: '#bce3c5' }}></div>
        <div className="absolute bottom-20 left-1/2 w-20 h-20" style={{ backgroundColor: '#ebebbc' }}></div>
      </div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">

          <h1 className="text-4xl lg:text-5xl font-bold mb-4" style={{ color: '#ebebbc' }}>
            Selecione o Arquivo de Treinamento
          </h1>
          <p className="text-lg opacity-80" style={{ color: '#bce3c5' }}>
            Faça upload do arquivo CSV contendo os dados para treinamento da rede neural
          </p>
        </div>

        {/* Upload Area */}
        <div className="space-y-6">
          {/* Drag & Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative p-12 rounded-2xl border-3 border-dashed cursor-pointer transition-all duration-300 backdrop-blur-sm ${
              isDragging ? 'scale-105 shadow-2xl' : 'hover:scale-102'
            }`}
            style={{
              borderColor: isDragging ? '#f21d41' : '#82b3ae',
              backgroundColor: isDragging ? 'rgba(242, 29, 65, 0.1)' : 'rgba(130, 179, 174, 0.05)',
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div className="flex flex-col items-center gap-6">
              {/* Ícone */}
              <div className="relative">
                <div className="absolute inset-0 rounded-full blur-xl opacity-30" 
                     style={{ backgroundColor: '#82b3ae' }}></div>
                <div className="relative w-24 h-24 rounded-full flex items-center justify-center" 
                     style={{ backgroundColor: 'rgba(130, 179, 174, 0.2)' }}>
                  <svg className="w-12 h-12" style={{ color: '#82b3ae' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
              </div>

              {/* Texto */}
              <div className="text-center">
                <p className="text-xl font-semibold mb-2" style={{ color: '#ebebbc' }}>
                  {selectedFile ? selectedFile.name : 'Clique ou arraste o arquivo aqui'}
                </p>
                <p className="text-sm opacity-70" style={{ color: '#bce3c5' }}>
                  Formatos suportados: CSV (separado por vírgula)
                </p>
              </div>

              {/* Indicador de arquivo selecionado */}
              {selectedFile && (
                <div className="flex items-center gap-3 px-6 py-3 rounded-lg" 
                     style={{ backgroundColor: 'rgba(130, 179, 174, 0.2)' }}>
                  <svg className="w-5 h-5" style={{ color: '#82b3ae' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium" style={{ color: '#ebebbc' }}>
                    Arquivo selecionado
                  </span>
                </div>
              )}
            </div>
          </div>


          {/* Botão de Upload */}
          <div className="flex justify-center pt-6">
            <button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="group relative px-10 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              style={{ 
                backgroundColor: isHovered && !isUploading ? '#f21d41' : '#82b3ae',
                color: '#230f2b'
              }}
            >
              <span className="relative z-10 flex items-center gap-2">
                {isUploading ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enviando...
                  </>
                ) : (
                  <>
                    Continuar
                    <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" 
                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </span>
              
              {/* Efeito de brilho no hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                   style={{ backgroundColor: '#ebebbc' }}></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
