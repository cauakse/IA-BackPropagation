"use client";

import { getConfig, postConfig } from "@/pages/api/api";
import { useState, useEffect } from "react";

export default function ConfigForm({ onConfigComplete }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
 const [config, setConfig] = useState({
  
    inputLayer: 6,
    outputLayer: 5,
    hiddenLayer: 10,


    errorValue: 0.01,
    iterations: 1000,


    learningRate: 0.1,


    useBias: true,

  
    transferFunction: "logistica",
  });


  useEffect(() => {
    const loadDefaultConfig = async () => {
      try {
        const response = await getConfig();

        setConfig({
          inputLayer: response.inputLayer || 6,
          outputLayer: response.outputLayer || 5,
          hiddenLayer: response.hiddenLayer || 10,
          errorValue: response.errorValue || 0.01,
          iterations: response.iterations || 1000,
          learningRate: response.learningRate || 0.1,
          useBias: response.useBias !== undefined ? response.useBias : true,
          transferFunction: response.transferFunction || "logistica",
        });
      } catch (error) {
        console.error("Erro ao carregar configurações padrão:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDefaultConfig();
  }, []);

  const handleInputChange = (field, value) => {
    setConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateAndSubmit = async () => {
  
    if (
      config.inputLayer < 1 ||
      config.outputLayer < 1 ||
      config.hiddenLayer < 1
    ) {
      alert("O número de neurônios deve ser maior que 0");
      return;
    }

    if (config.errorValue <= 0 || config.errorValue > 1) {
      alert("O valor do erro deve ser maior que 0 e menor ou igual a 1");
      return;
    }

    if (config.iterations < 1) {
      alert("O número de iterações deve ser maior que 0");
      return;
    }

    if (config.learningRate <= 0 || config.learningRate > 1) {
      alert(
        "O fator de aprendizado (N) deve ser maior que 0 e menor ou igual a 1"
      );
      return;
    }


    const response = await postConfig(config);
    if (!response) {
      alert("Erro ao enviar a configuração para o servidor");
      return;
    }

    onConfigComplete(config);
  };

  if (isLoading) {
    return (
      <div
        className="min-h-screen h-screen flex items-center justify-center"
        style={{ backgroundColor: "#230f2b" }}
      >
        <div className="text-center">
          <div
            className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: "#82b3ae", borderTopColor: "transparent" }}
          ></div>
          <p className="text-lg" style={{ color: "#ebebbc" }}>
            Carregando configurações...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen overflow-y-auto py-12"
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
        <div
          className="absolute bottom-20 right-1/3 w-20 h-20"
          style={{ backgroundColor: "#ebebbc" }}
        ></div>
      </div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10 max-w-5xl">

        <div className="text-center mb-12">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 backdrop-blur-sm mb-6"
            style={{
              borderColor: "#82b3ae",
              backgroundColor: "rgba(188, 227, 197, 0.1)",
            }}
          >
            <div
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: "#f21d41" }}
            ></div>
            <span className="text-sm font-medium" style={{ color: "#bce3c5" }}>
              Etapa 2 de 2
            </span>
          </div>

          <h1
            className="text-4xl lg:text-5xl font-bold mb-4"
            style={{ color: "#ebebbc" }}
          >
            Configuração da Rede Neural
          </h1>
          <p className="text-lg opacity-80" style={{ color: "#bce3c5" }}>
            Ajuste os parâmetros para o treinamento da rede MLP
          </p>
        </div>

        <div className="space-y-8">

          <div
            className="p-8 rounded-2xl backdrop-blur-sm border-2"
            style={{
              backgroundColor: "rgba(130, 179, 174, 0.05)",
              borderColor: "#82b3ae",
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "rgba(130, 179, 174, 0.2)" }}
              >
                <span className="text-xl">🧠</span>
              </div>
              <h2 className="text-2xl font-bold" style={{ color: "#ebebbc" }}>
                Número de Neurônios
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "#bce3c5" }}
                >
                  Camada de Entrada
                </label>
                <input
                  type="number"
                  min="1"
                  value={config.inputLayer}
                  onChange={(e) =>
                    handleInputChange(
                      "inputLayer",
                      parseInt(e.target.value) || 0
                    )
                  }
                  className="w-full px-4 py-3 rounded-lg border-2 font-semibold text-lg transition-all focus:outline-none focus:scale-105"
                  style={{
                    backgroundColor: "rgba(235, 235, 188, 0.1)",
                    borderColor: "#82b3ae",
                    color: "#ebebbc",
                  }}
                />
              </div>


              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "#bce3c5" }}
                >
                  Camada Oculta
                </label>
                <input
                  type="number"
                  min="1"
                  value={config.hiddenLayer}
                  onChange={(e) =>
                    handleInputChange(
                      "hiddenLayer",
                      parseInt(e.target.value) || 0
                    )
                  }
                  className="w-full px-4 py-3 rounded-lg border-2 font-semibold text-lg transition-all focus:outline-none focus:scale-105"
                  style={{
                    backgroundColor: "rgba(235, 235, 188, 0.1)",
                    borderColor: "#82b3ae",
                    color: "#ebebbc",
                  }}
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "#bce3c5" }}
                >
                  Camada de Saída
                </label>
                <input
                  type="number"
                  min="1"
                  value={config.outputLayer}
                  onChange={(e) =>
                    handleInputChange(
                      "outputLayer",
                      parseInt(e.target.value) || 0
                    )
                  }
                  className="w-full px-4 py-3 rounded-lg border-2 font-semibold text-lg transition-all focus:outline-none focus:scale-105"
                  style={{
                    backgroundColor: "rgba(235, 235, 188, 0.1)",
                    borderColor: "#82b3ae",
                    color: "#ebebbc",
                  }}
                />
              </div>
            </div>
          </div>

          <div
            className="p-8 rounded-2xl backdrop-blur-sm border-2"
            style={{
              backgroundColor: "rgba(242, 29, 65, 0.05)",
              borderColor: "#f21d41",
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "rgba(242, 29, 65, 0.2)" }}
              >
                <span className="text-xl">📊</span>
              </div>
              <h2 className="text-2xl font-bold" style={{ color: "#ebebbc" }}>
                Parâmetros de Treinamento
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "#bce3c5" }}
                >
                  Valor do Erro
                  <span className="text-xs opacity-70 ml-2">
                    (0 &lt; valor ≤ 1)
                  </span>
                </label>
                <input
                  type="number"
                  step="0.001"
                  min="0.001"
                  max="1"
                  value={config.errorValue}
                  onChange={(e) =>
                    handleInputChange(
                      "errorValue",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className="w-full px-4 py-3 rounded-lg border-2 font-semibold text-lg transition-all focus:outline-none focus:scale-105"
                  style={{
                    backgroundColor: "rgba(235, 235, 188, 0.1)",
                    borderColor: "#f21d41",
                    color: "#ebebbc",
                  }}
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "#bce3c5" }}
                >
                  Número de Iterações
                </label>
                <input
                  type="number"
                  min="1"
                  value={config.iterations}
                  onChange={(e) =>
                    handleInputChange(
                      "iterations",
                      parseInt(e.target.value) || 0
                    )
                  }
                  className="w-full px-4 py-3 rounded-lg border-2 font-semibold text-lg transition-all focus:outline-none focus:scale-105"
                  style={{
                    backgroundColor: "rgba(235, 235, 188, 0.1)",
                    borderColor: "#f21d41",
                    color: "#ebebbc",
                  }}
                />
              </div>
            </div>
          </div>

          <div
            className="p-8 rounded-2xl backdrop-blur-sm border-2"
            style={{
              backgroundColor: "rgba(188, 227, 197, 0.05)",
              borderColor: "#bce3c5",
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "rgba(188, 227, 197, 0.2)" }}
              >
                <span className="text-xl">⚡</span>
              </div>
              <h2 className="text-2xl font-bold" style={{ color: "#ebebbc" }}>
                Parâmetros de Aprendizado
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "#bce3c5" }}
                >
                  Learning Rate (N)
                  <span className="text-xs opacity-70 ml-2">(0 &lt; N ≤ 1)</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="1"
                  value={config.learningRate}
                  onChange={(e) =>
                    handleInputChange(
                      "learningRate",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className="w-full px-4 py-3 rounded-lg border-2 font-semibold text-lg transition-all focus:outline-none focus:scale-105"
                  style={{
                    backgroundColor: "rgba(235, 235, 188, 0.1)",
                    borderColor: "#bce3c5",
                    color: "#ebebbc",
                  }}
                />
                <p
                  className="text-xs mt-2 opacity-70"
                  style={{ color: "#bce3c5" }}
                >
                  Controla a velocidade de aprendizado da rede neural
                </p>
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "#bce3c5" }}
                >
                  Configuração de Bias
                </label>
                <label
                  className="flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-all hover:scale-102 border-2 h-[60px]"
                  style={{
                    backgroundColor: config.useBias
                      ? "rgba(188, 227, 197, 0.2)"
                      : "rgba(235, 235, 188, 0.05)",
                    borderColor: config.useBias ? "#bce3c5" : "transparent",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={config.useBias}
                    onChange={(e) =>
                      handleInputChange("useBias", e.target.checked)
                    }
                    className="w-5 h-5 cursor-pointer rounded"
                    style={{ accentColor: "#bce3c5" }}
                  />
                  <div className="flex-1">
                    <div
                      className="font-semibold text-lg"
                      style={{ color: "#ebebbc" }}
                    >
                      Usar Bias
                    </div>
                    <div
                      className="text-sm opacity-70"
                      style={{ color: "#bce3c5" }}
                    >
                      Adiciona termo de viés aos neurônios
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div
            className="p-8 rounded-2xl backdrop-blur-sm border-2"
            style={{
              backgroundColor: "rgba(235, 235, 188, 0.05)",
              borderColor: "#ebebbc",
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "rgba(235, 235, 188, 0.2)" }}
              >
                <span className="text-xl">📈</span>
              </div>
              <h2 className="text-2xl font-bold" style={{ color: "#ebebbc" }}>
                Função de Transferência
              </h2>
            </div>

            <div className="space-y-4">

              <label
                className="flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-all hover:scale-102 border-2"
                style={{
                  backgroundColor:
                    config.transferFunction === "linear"
                      ? "rgba(130, 179, 174, 0.2)"
                      : "rgba(235, 235, 188, 0.05)",
                  borderColor:
                    config.transferFunction === "linear"
                      ? "#82b3ae"
                      : "transparent",
                }}
              >
                <input
                  type="radio"
                  name="transferFunction"
                  value="linear"
                  checked={config.transferFunction === "linear"}
                  onChange={(e) =>
                    handleInputChange("transferFunction", e.target.value)
                  }
                  className="w-5 h-5 cursor-pointer"
                  style={{ accentColor: "#82b3ae" }}
                />
                <div className="flex-1">
                  <div
                    className="font-semibold text-lg"
                    style={{ color: "#ebebbc" }}
                  >
                    Linear
                  </div>
                  <div
                    className="text-sm opacity-70"
                    style={{ color: "#bce3c5" }}
                  >
                    f(x) = x
                  </div>
                </div>
              </label>

              <label
                className="flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-all hover:scale-102 border-2"
                style={{
                  backgroundColor:
                    config.transferFunction === "logistica"
                      ? "rgba(130, 179, 174, 0.2)"
                      : "rgba(235, 235, 188, 0.05)",
                  borderColor:
                    config.transferFunction === "logistica"
                      ? "#82b3ae"
                      : "transparent",
                }}
              >
                <input
                  type="radio"
                  name="transferFunction"
                  value="logistica"
                  checked={config.transferFunction === "logistica"}
                  onChange={(e) =>
                    handleInputChange("transferFunction", e.target.value)
                  }
                  className="w-5 h-5 cursor-pointer"
                  style={{ accentColor: "#82b3ae" }}
                />
                <div className="flex-1">
                  <div
                    className="font-semibold text-lg"
                    style={{ color: "#ebebbc" }}
                  >
                    Logística (Sigmoid)
                  </div>
                  <div
                    className="text-sm opacity-70"
                    style={{ color: "#bce3c5" }}
                  >
                    f(x) = 1 / (1 + e^-x)
                  </div>
                </div>
              </label>

              <label
                className="flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-all hover:scale-102 border-2"
                style={{
                  backgroundColor:
                    config.transferFunction === "hiperbolica"
                      ? "rgba(130, 179, 174, 0.2)"
                      : "rgba(235, 235, 188, 0.05)",
                  borderColor:
                    config.transferFunction === "hiperbolica"
                      ? "#82b3ae"
                      : "transparent",
                }}
              >
                <input
                  type="radio"
                  name="transferFunction"
                  value="hiperbolica"
                  checked={config.transferFunction === "hiperbolica"}
                  onChange={(e) =>
                    handleInputChange("transferFunction", e.target.value)
                  }
                  className="w-5 h-5 cursor-pointer"
                  style={{ accentColor: "#82b3ae" }}
                />
                <div className="flex-1">
                  <div
                    className="font-semibold text-lg"
                    style={{ color: "#ebebbc" }}
                  >
                    Hiperbólica (Tanh)
                  </div>
                  <div
                    className="text-sm opacity-70"
                    style={{ color: "#bce3c5" }}
                  >
                    f(x) = tanh(x)
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="flex justify-center pt-6">
            <button
              onClick={validateAndSubmit}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="group relative px-10 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl overflow-hidden"
              style={{
                backgroundColor: isHovered ? "#f21d41" : "#82b3ae",
                color: "#230f2b",
              }}
            >
              <span className="relative z-10 flex items-center gap-2">
                Iniciar Treinamento
                <svg
                  className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </span>

              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                style={{ backgroundColor: "#ebebbc" }}
              ></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
