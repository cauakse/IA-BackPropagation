package org.example.backend.Entitie;

public class Config {
    private int inputLayer;
    private int hiddenLayer;
    private int outputLayer;

    private double errorValue;
    private int iterations;

    private double learningRate;

    private String transferFunction;

    private boolean useBias;

    public Config(){

    }

    public Config(int inputLayer, int hiddenLayer, int outputLayer, double errorValue, int iterations, double learningRate, String transferFunction) {
        this.inputLayer = inputLayer;
        this.hiddenLayer = hiddenLayer;
        this.outputLayer = outputLayer;
        this.errorValue = errorValue;
        this.iterations = iterations;
        this.learningRate = learningRate;
        this.transferFunction = transferFunction;
    }

    public int getInputLayer() {
        return inputLayer;
    }

    public void setInputLayer(int inputLayer) {
        this.inputLayer = inputLayer;
    }

    public int getHiddenLayer() {
        return hiddenLayer;
    }

    public void setHiddenLayer(int hiddenLayer) {
        this.hiddenLayer = hiddenLayer;
    }

    public int getOutputLayer() {
        return outputLayer;
    }

    public void setOutputLayer(int outputLayer) {
        this.outputLayer = outputLayer;
    }

    public double getErrorValue() {
        return errorValue;
    }

    public void setErrorValue(double errorValue) {
        this.errorValue = errorValue;
    }

    public int getIterations() {
        return iterations;
    }

    public void setIterations(int iterations) {
        this.iterations = iterations;
    }

    public double getLearningRate() {
        return learningRate;
    }

    public void setLearningRate(double learningRate) {
        this.learningRate = learningRate;
    }

    public String getTransferFunction() {
        return transferFunction;
    }

    public void setTransferFunction(String transferFunction) {
        this.transferFunction = transferFunction;
    }

    public boolean isUseBias() {
        return useBias;
    }

    public void setUseBias(boolean useBias) {
        this.useBias = useBias;
    }
}
