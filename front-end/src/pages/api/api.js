import axios from "axios";

const api = axios.create({
    baseURL: 'http://localhost:8080',
    validateStatus: (status) => status >= 200 && status < 500,
});

export const postFilePath = async (formData) => {
    try {
        const response = await api.post('/api/upload-csv', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response;
    }catch (error) {    
        console.error("Erro ao enviar o caminho do arquivo:", error);
        return null;
    }
}
