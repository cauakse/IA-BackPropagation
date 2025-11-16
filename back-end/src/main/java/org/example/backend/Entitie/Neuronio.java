package org.example.backend.Entitie;

public class Neuronio {
    private Double net;
    private Double i;
    private Double erro;

    public Neuronio(Double net, Double i, Double erro) {
        this.net = net;
        this.i = i;
        this.erro = erro;
    }

    public Neuronio() {
    }

    public Double getNet() {
        return net;
    }

    public void setNet(Double net) {
        this.net = net;
    }

    public Double getI() {
        return i;
    }

    public void setI(Double i) {
        this.i = i;
    }

    public Double getErro() {
        return erro;
    }

    public void setErro(Double erro) {
        this.erro = erro;
    }


}
