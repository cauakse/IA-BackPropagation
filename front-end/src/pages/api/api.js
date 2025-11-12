import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
  validateStatus: (status) => status >= 200 && status < 500,
});

export const postFilePath = async (formData) => {
  try {
    const response = await api.post("/api/file", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response;
  } catch (error) {
    console.error("Erro ao enviar o caminho do arquivo:", error);
    return null;
  }
};

export const getConfig = async () => {
  try {
    const response = await api.get("/api/config");
    if (response.status == 200) return response.data;
  } catch (error) {
    console.error("Erro ao obter a configuração:", error);
  }

  return {
      inputLayer: 6, // Camada de entrada
      hiddenLayer: 10, // Camada oculta
      outputLayer: 5, // Camada de saída

      // Erro e Iterações
      errorValue: 0.01, // Valor do erro (0 < x <= 1)
      iterations: 1000, // Número de iterações

      // Fator de aprendizado
      learningRate: 0.1, // N (0 < x <= 1)

      // Função de transferência
      transferFunction: "logistica", // 'linear', 'logistica', ou 'hiperbolica'
    };
};

export const postConfig = async (config) => {
  try {
    const response = await api.post("/api/config", config, {});
    if (response.status == 200) {
      return true;
    }
    return false;
  }catch (error) {
    console.error("Erro ao enviar a configuração:", error);
    return false;
  }
}
