package org.example.backend.Entitie;

public class RespostaIteracao {
    private double erroEpoca;
    private int epocaAtual;
    private int[] parouPor; //0 - erro aceitavel, 1 - maximo de epocas, 2 - erro nao mudou significativamente

    public RespostaIteracao(double erroEpoca, int epocaAtual, int[] parouPor) {
        this.erroEpoca = erroEpoca;
        this.epocaAtual = epocaAtual;
        this.parouPor = parouPor;
    }

    public RespostaIteracao() {
    }

    public double getErroEpoca() {
        return erroEpoca;
    }

    public void setErroEpoca(double erroEpoca) {
        this.erroEpoca = erroEpoca;
    }

    public int getEpocaAtual() {
        return epocaAtual;
    }

    public void setEpocaAtual(int epocaAtual) {
        this.epocaAtual = epocaAtual;
    }

    public int[] getParouPor() {
        return parouPor;
    }

    public void setParouPor(int[] parouPor) {
        this.parouPor = parouPor;
    }
}
