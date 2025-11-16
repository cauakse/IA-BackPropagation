"use client";

import { uploadTestFile } from "@/pages/api/api";
import { useState } from "react";

export default function TestForm({ onTestComplete, initWebSocket }) {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.endsWith(".csv")) {
      setFile(droppedFile);
      setUploadStatus(null);
    } else {
      setUploadStatus("error");
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.name.endsWith(".csv")) {
      setFile(selectedFile);
      setUploadStatus(null);
    } else {
      setUploadStatus("error");
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadStatus(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      if (await uploadTestFile(formData)) {
        //mandar para o websocket começar o teste
        if(initWebSocket.current && initWebSocket.current.connected){
            initWebSocket.current.send("/app/startTest", {}, "");
        }

        setUploadStatus("success");
        setTimeout(() => {
          onTestComplete();
        }, 1500);
      } else {
        setUploadStatus("error");
      }
    } catch (error) {
      console.error("Erro ao enviar arquivo:", error);
      setUploadStatus("error");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center py-12"
      style={{ backgroundColor: "#230f2b" }}
    >

      <div className="fixed inset-0 overflow-hidden opacity-10 pointer-events-none">
        <div
          className="absolute top-20 right-1/4 w-32 h-32 rounded-full"
          style={{ backgroundColor: "#f21d41" }}
        ></div>
        <div
          className="absolute bottom-40 left-1/4 w-24 h-24 rotate-45"
          style={{ backgroundColor: "#82b3ae" }}
        ></div>
        <div
          className="absolute top-1/3 left-1/3 w-16 h-16 rounded-full"
          style={{ backgroundColor: "#bce3c5" }}
        ></div>
      </div>

      <div className="container mx-auto px-6 max-w-4xl relative z-10">

        <div className="text-center mb-12">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 backdrop-blur-sm mb-6"
            style={{
              borderColor: "#82b3ae",
              backgroundColor: "rgba(188, 227, 197, 0.1)",
            }}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="#82b3ae"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
            <span className="text-sm font-medium" style={{ color: "#bce3c5" }}>
              Etapa 4: Teste
            </span>
          </div>

          <h1
            className="text-5xl lg:text-6xl font-bold mb-4"
            style={{ color: "#ebebbc" }}
          >
            Teste da Rede Neural
          </h1>
          <p
            className="text-xl opacity-80 max-w-2xl mx-auto"
            style={{ color: "#bce3c5" }}
          >
            Carregue um arquivo CSV com dados de teste para avaliar o desempenho
            da rede neural treinada
          </p>
        </div>

        <div
          className="p-8 rounded-2xl backdrop-blur-sm border-2"
          style={{
            backgroundColor: "rgba(130, 179, 174, 0.05)",
            borderColor: "#82b3ae",
          }}
        >

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
              isDragging ? "scale-105" : ""
            }`}
            style={{
              borderColor: isDragging ? "#f21d41" : "#82b3ae",
              backgroundColor: isDragging
                ? "rgba(242, 29, 65, 0.1)"
                : "rgba(130, 179, 174, 0.05)",
            }}
          >
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />

            {!file ? (
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="flex flex-col items-center gap-4">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "rgba(130, 179, 174, 0.2)" }}
                  >
                    <svg
                      className="w-10 h-10"
                      fill="none"
                      stroke="#82b3ae"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                  </div>

                  <div>
                    <p
                      className="text-2xl font-bold mb-2"
                      style={{ color: "#ebebbc" }}
                    >
                      Arraste seu arquivo CSV aqui
                    </p>
                    <p className="text-lg mb-4" style={{ color: "#bce3c5" }}>
                      ou clique para selecionar
                    </p>
                    <p
                      className="text-sm opacity-60"
                      style={{ color: "#ebebbc" }}
                    >
                      Apenas arquivos .CSV são aceitos
                    </p>
                  </div>
                </div>
              </label>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "rgba(188, 227, 197, 0.3)" }}
                >
                  <svg
                    className="w-10 h-10"
                    fill="none"
                    stroke="#bce3c5"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>

                <div>
                  <p
                    className="text-xl font-bold mb-2"
                    style={{ color: "#bce3c5" }}
                  >
                    {file.name}
                  </p>
                  <p
                    className="text-sm opacity-60"
                    style={{ color: "#ebebbc" }}
                  >
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>

                <button
                  onClick={() => {
                    setFile(null);
                    setUploadStatus(null);
                  }}
                  className="mt-4 px-4 py-2 rounded-lg border-2 transition-all hover:scale-105"
                  style={{
                    borderColor: "#f21d41",
                    color: "#f21d41",
                    backgroundColor: "rgba(242, 29, 65, 0.1)",
                  }}
                >
                  Remover arquivo
                </button>
              </div>
            )}
          </div>

          {uploadStatus === "success" && (
            <div
              className="mt-6 p-4 rounded-xl border-2 text-center animate-pulse"
              style={{
                backgroundColor: "rgba(188, 227, 197, 0.15)",
                borderColor: "#bce3c5",
              }}
            >
              <div className="flex items-center justify-center gap-3">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="#bce3c5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="font-bold" style={{ color: "#bce3c5" }}>
                  Arquivo enviado com sucesso!
                </span>
              </div>
            </div>
          )}

          {uploadStatus === "error" && (
            <div
              className="mt-6 p-4 rounded-xl border-2 text-center"
              style={{
                backgroundColor: "rgba(242, 29, 65, 0.15)",
                borderColor: "#f21d41",
              }}
            >
              <div className="flex items-center justify-center gap-3">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="#f21d41"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                <span className="font-bold" style={{ color: "#f21d41" }}>
                  Erro ao enviar arquivo. Tente novamente.
                </span>
              </div>
            </div>
          )}

          {file && uploadStatus !== "success" && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className={`px-12 py-4 rounded-xl font-bold text-lg transition-all ${
                  isUploading
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:scale-105 hover:shadow-lg"
                }`}
                style={{ backgroundColor: "#82b3ae", color: "#230f2b" }}
              >
                {isUploading ? (
                  <div className="flex items-center gap-3">
                    <div
                      className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"
                      style={{
                        borderColor: "#230f2b",
                        borderTopColor: "transparent",
                      }}
                    ></div>
                    Enviando...
                  </div>
                ) : (
                  "Iniciar Teste →"
                )}
              </button>
            </div>
          )}
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            className="p-4 rounded-xl border"
            style={{
              backgroundColor: "rgba(242, 29, 65, 0.1)",
              borderColor: "#f21d41",
            }}
          >
            <div className="flex items-center gap-3 mb-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="#f21d41"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="font-bold" style={{ color: "#f21d41" }}>
                Formato
              </h3>
            </div>
            <p className="text-sm" style={{ color: "#ebebbc" }}>
              Arquivo CSV com mesma estrutura dos dados de treinamento
            </p>
          </div>

          <div
            className="p-4 rounded-xl border"
            style={{
              backgroundColor: "rgba(130, 179, 174, 0.1)",
              borderColor: "#82b3ae",
            }}
          >
            <div className="flex items-center gap-3 mb-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="#82b3ae"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <h3 className="font-bold" style={{ color: "#82b3ae" }}>
                Velocidade
              </h3>
            </div>
            <p className="text-sm" style={{ color: "#ebebbc" }}>
              Processamento rápido dos dados de teste
            </p>
          </div>

          <div
            className="p-4 rounded-xl border"
            style={{
              backgroundColor: "rgba(188, 227, 197, 0.1)",
              borderColor: "#bce3c5",
            }}
          >
            <div className="flex items-center gap-3 mb-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="#bce3c5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <h3 className="font-bold" style={{ color: "#bce3c5" }}>
                Resultados
              </h3>
            </div>
            <p className="text-sm" style={{ color: "#ebebbc" }}>
              Métricas de desempenho detalhadas
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
