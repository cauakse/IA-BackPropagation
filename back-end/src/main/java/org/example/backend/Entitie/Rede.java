package org.example.backend.Entitie;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.context.annotation.ScopedProxyMode;
import org.springframework.stereotype.Service;
import org.springframework.web.context.annotation.SessionScope;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Service
@Scope(value = "session", proxyMode = ScopedProxyMode.TARGET_CLASS)
@SessionScope
public class Rede {
    private double[][] pesoEntradaParaOculta;
    private double[][] pesoOcultaParaSaida;
    private double[] erroOculta;
    private double[] erroSaida;
    private double[] netOculta;
    private double[] netSaida;
    private double[] iOculta;
    private double[] iSaida;
    private double[] iEntrada;
    private double[] erroSaidaOriginal;
    private double[] biasOculta;
    private double[] biasSaida;
    private List<Double> errosPorEpoca = new ArrayList<>();
    private String functionName;
    private double erroDessaEpoca = 0D;
    private boolean useBias = false;

    public Rede() {
    }

    public Double funcaoLinear(Double net){
        return net/10;
    }
    public Double derivadaFuncaoLinear(Double net){
        return 1D/10D;
    }


    public Double funcaoLogistica(Double net){
        return  1 / (1 + Math.exp(-net));
    }
    public Double derivadaFuncaoLogistica(Double net){
        Double fx = funcaoLogistica(net);
        return fx * (1 - fx);
    }

    public Double funcaoTangenteHiperbolica(Double net){
      return Math.tanh(net);
    }
    public Double derivadaFuncaoTangenteHiperbolica(Double net){
        Double fx = funcaoTangenteHiperbolica(net);
        return 1 - (fx * fx);
    }

    public Double funcao(Double net){
        return switch (functionName) {
            case "linear" -> funcaoLinear(net);
            case "logistica" -> funcaoLogistica(net);
            case "hiperbolica" -> funcaoTangenteHiperbolica(net);
            default -> 0D;
        };
    }

    public Double derivada(Double net){
        return switch (functionName) {
            case "linear" -> derivadaFuncaoLinear(net);
            case "logistica" -> derivadaFuncaoLogistica(net);
            case "hiperbolica" -> derivadaFuncaoTangenteHiperbolica(net);
            default -> 0D;
        };
    }


    public void definirMatrizes(Config config) {
        Random random = new Random();
        this.pesoEntradaParaOculta = new double[config.getInputLayer()][config.getHiddenLayer()];
        this.pesoOcultaParaSaida = new double[config.getHiddenLayer()][config.getOutputLayer()];
        this.erroOculta = new double[config.getHiddenLayer()];
        this.erroSaida = new double[config.getOutputLayer()];
        this.netOculta = new double[config.getHiddenLayer()];
        this.netSaida = new double[config.getOutputLayer()];
        this.iOculta = new double[config.getHiddenLayer()];
        this.iSaida = new double[config.getOutputLayer()];
        this.iEntrada = new double[config.getInputLayer()];
        this.erroSaidaOriginal = new double[config.getOutputLayer()];
        this.biasOculta = new double[config.getHiddenLayer()];
        this.biasSaida = new double[config.getOutputLayer()];


        for (int i = 0; i < config.getInputLayer(); i++) {
            for (int j = 0; j < config.getHiddenLayer(); j++) {
                this.pesoEntradaParaOculta[i][j] = -0.1 + 0.2 * random.nextDouble();
            }
        }

        for (int i = 0; i < config.getHiddenLayer(); i++) {
            for (int j = 0; j < config.getOutputLayer(); j++) {
                this.pesoOcultaParaSaida[i][j] = -0.1 + 0.2 * random.nextDouble();
            }
        }
    }

    public void putInInputLayer(List<String> data){
        for (int i = 0; i < data.size()-1; i++) {
            this.iEntrada[i] = Double.parseDouble(data.get(i));
        }
    }

    public void fowardOcultLayerWithBias(){
        for (int j = 0; j < netOculta.length; j++) {
            netOculta[j] = 0;
            for (int i = 0; i < iEntrada.length; i++) {
                netOculta[j] += iEntrada[i] * pesoEntradaParaOculta[i][j] + biasOculta[j];
            }
            iOculta[j] = funcao(netOculta[j]);
        }
    }

    public void fowardOcultLayerWithoutBias(){
        for (int j = 0; j < netOculta.length; j++) {
            netOculta[j] = 0;
            for (int i = 0; i < iEntrada.length; i++) {
                netOculta[j] += iEntrada[i] * pesoEntradaParaOculta[i][j];
            }
            iOculta[j] = funcao(netOculta[j]);
        }
    }

    public void fowardOcultLayer() {
        if (useBias){
            fowardOcultLayerWithBias();
        } else {
            fowardOcultLayerWithoutBias();
        }
    }

    public void fowardOutputLayerWithBias() {
        for (int j = 0; j < netSaida.length; j++) {
            netSaida[j] = 0;
            for (int i = 0; i < iOculta.length; i++) {
                netSaida[j] += iOculta[i] * pesoOcultaParaSaida[i][j] + biasSaida[j];
            }
            iSaida[j] = funcao(netSaida[j]);
        }
    }

    public void fowardOutputLayerWithoutBias() {
        for (int j = 0; j < netSaida.length; j++) {
            netSaida[j] = 0;
            for (int i = 0; i < iOculta.length; i++) {
                netSaida[j] += iOculta[i] * pesoOcultaParaSaida[i][j];
            }
            iSaida[j] = funcao(netSaida[j]);
        }
    }

    public void fowardOutputLayer() {
        if (useBias){
            fowardOutputLayerWithBias();
        } else {
            fowardOutputLayerWithoutBias();
        }
    }


    public double[][] getPesoEntradaParaOculta() {
        return pesoEntradaParaOculta;
    }

    public void setPesoEntradaParaOculta(double[][] pesoEntradaParaOculta) {
        this.pesoEntradaParaOculta = pesoEntradaParaOculta;
    }

    public double[][] getPesoOcultaParaSaida() {
        return pesoOcultaParaSaida;
    }

    public void setPesoOcultaParaSaida(double[][] pesoOcultaParaSaida) {
        this.pesoOcultaParaSaida = pesoOcultaParaSaida;
    }

    public double[] getErroOculta() {
        return erroOculta;
    }

    public void setErroOculta(double[] erroOculta) {
        this.erroOculta = erroOculta;
    }

    public double[] getErroSaida() {
        return erroSaida;
    }

    public void setErroSaida(double[] erroSaida) {
        this.erroSaida = erroSaida;
    }

    public double[] getNetOculta() {
        return netOculta;
    }

    public void setNetOculta(double[] netOculta) {
        this.netOculta = netOculta;
    }

    public double[] getNetSaida() {
        return netSaida;
    }

    public void setNetSaida(double[] netSaida) {
        this.netSaida = netSaida;
    }

    public double[] getiOculta() {
        return iOculta;
    }

    public void setiOculta(double[] iOculta) {
        this.iOculta = iOculta;
    }

    public double[] getiSaida() {
        return iSaida;
    }

    public void setiSaida(double[] iSaida) {
        this.iSaida = iSaida;
    }

    public double[] getiEntrada() {
        return iEntrada;
    }

    public void setiEntrada(double[] iEntrada) {
        this.iEntrada = iEntrada;
    }

    public List<Double> getErrosPorEpoca() {
        return errosPorEpoca;
    }

    public void setErrosPorEpoca(List<Double> errosPorEpoca) {
        this.errosPorEpoca = errosPorEpoca;
    }

    public String getFunctionName() {
        return functionName;
    }

    public void setFunctionName(String functionName) {
        this.functionName = functionName;
    }

    public double[] getErroSaidaOriginal() {
        return erroSaidaOriginal;
    }

    public void setErroSaidaOriginal(double[] erroSaidaOriginal) {
        this.erroSaidaOriginal = erroSaidaOriginal;
    }

    public double getErroDessaEpoca() {
        return erroDessaEpoca;
    }

    public void setErroDessaEpoca(double erroDessaEpoca) {
        this.erroDessaEpoca = erroDessaEpoca;
    }



    public void calculateOutputError(String s, List<String> classes) {
        //pegar o maior valor da camada de saida -> esse é o resultado da rede
        //verificar se o resultado da rede é igual ao valor esperado
        //saida 0 significa classe 0

        for (int i =0 ;i < erroSaida.length;i++){
            double desiredOutput = (classes.indexOf(s) == i) ? 1D : 0D;
            erroSaida[i] = (desiredOutput - iSaida[i]) * derivada(netSaida[i]);
            erroSaidaOriginal[i] = erroSaida[i];
        }
    }

    public void backpropagationOutputToHiddenWithBias(double learningRate) {
        //para cada neuronio da camada oculta fazer a soma dos erros da camada de saida multiplicado pelo peso
        for (int i = 0; i < erroOculta.length; i++) {
            erroOculta[i] = 0;
            for (int j = 0; j < erroSaida.length; j++) {
                erroOculta[i] += erroSaida[j] * pesoOcultaParaSaida[i][j];
            }
            erroOculta[i] *= derivada(netOculta[i]);
        }

        //atualizar os pesos da camada de saida para a oculta
        for (int i = 0; i < pesoOcultaParaSaida.length; i++) {
            for (int j = 0; j < pesoOcultaParaSaida[0].length; j++) {
                pesoOcultaParaSaida[i][j] += learningRate * erroSaida[j] * iOculta[i];
                biasSaida[j] += learningRate * erroSaida[j];
            }
        }
    }

    public void backpropagationOutputToHiddenWithoutBias(double learningRate) {
        //para cada neuronio da camada oculta fazer a soma dos erros da camada de saida multiplicado pelo peso
        for (int i = 0; i < erroOculta.length; i++) {
            erroOculta[i] = 0;
            for (int j = 0; j < erroSaida.length; j++) {
                erroOculta[i] += erroSaida[j] * pesoOcultaParaSaida[i][j];
            }
            erroOculta[i] *= derivada(netOculta[i]);
        }

        //atualizar os pesos da camada de saida para a oculta
        for (int i = 0; i < pesoOcultaParaSaida.length; i++) {
            for (int j = 0; j < pesoOcultaParaSaida[0].length; j++) {
                pesoOcultaParaSaida[i][j] += learningRate * erroSaida[j] * iOculta[i];
            }
        }
    }

    public void backpropagationOutputToHidden(double learningRate) {
        if (useBias){
            backpropagationOutputToHiddenWithBias(learningRate);
        } else {
            backpropagationOutputToHiddenWithoutBias(learningRate);
        }
    }

    public void backpropagationHiddenToInputWithBias(double learningRate) {
        //atualizar os pesos da camada oculta para a de entrada
        for (int i = 0; i < pesoEntradaParaOculta.length; i++) {
            for (int j = 0; j < pesoEntradaParaOculta[0].length; j++) {
                pesoEntradaParaOculta[i][j] += learningRate * erroOculta[j] * iEntrada[i];
                biasOculta[j] += learningRate * erroOculta[j];
            }
        }
    }

    public void backpropagationHiddenToInputWithoutBias(double learningRate) {
        //atualizar os pesos da camada oculta para a de entrada
        for (int i = 0; i < pesoEntradaParaOculta.length; i++) {
            for (int j = 0; j < pesoEntradaParaOculta[0].length; j++) {
                pesoEntradaParaOculta[i][j] += learningRate * erroOculta[j] * iEntrada[i];
            }
        }
    }

    public void backpropagationHiddenToInput(double learningRate) {
        if (useBias){
            backpropagationHiddenToInputWithBias(learningRate);
        } else {
            backpropagationHiddenToInputWithoutBias(learningRate);
        }
    }

    public void calculateNetworkError(String s) {
        double somaErro = 0;
        for (double v : erroSaidaOriginal) {
            somaErro += v * v;
        }
        double erroRede = 0.5 * somaErro;
        erroDessaEpoca += erroRede;
    }

    public double[] getBiasOculta() {
        return biasOculta;
    }

    public void setBiasOculta(double[] biasOculta) {
        this.biasOculta = biasOculta;
    }

    public double[] getBiasSaida() {
        return biasSaida;
    }

    public void setBiasSaida(double[] biasSaida) {
        this.biasSaida = biasSaida;
    }

    public boolean isUseBias() {
        return useBias;
    }

    public void setUseBias(boolean useBias) {
        this.useBias = useBias;
    }
}
