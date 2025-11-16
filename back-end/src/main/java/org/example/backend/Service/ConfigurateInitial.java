package org.example.backend.Service;

import org.example.backend.Entitie.Config;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.context.annotation.ScopedProxyMode;
import org.springframework.stereotype.Service;
import org.springframework.web.context.annotation.SessionScope;

import java.io.File;
import java.util.*;

@Service
@Scope(value = "session", proxyMode = ScopedProxyMode.TARGET_CLASS)
@SessionScope
public class ConfigurateInitial {

    @Autowired
    FileHolder fileHolder;

    private boolean isConfigured = false;
    private  Config config;
    private List<Double> menorValorPorAtributo = new ArrayList<>();
    private List<Double> maiorValorPorAtributo = new ArrayList<>();
    private List<List<String>> normalizedData;
    private List<List<String>> normalizedTestData;
    private List<String> classes = new ArrayList<>();

    public boolean isConfigured() {
        return isConfigured;
    }

    public void reset(){
        isConfigured = false;
        this.config = null;
        this.menorValorPorAtributo = new ArrayList<>();
        this.maiorValorPorAtributo = new ArrayList<>();
        this.normalizedData = new ArrayList<>();
        this.normalizedTestData = new ArrayList<>();
        this.classes = new ArrayList<>();
    }


    public void setConfigured(boolean configured) {
        isConfigured = configured;
    }

    public Config getConfig() {
        return config;
    }

    public void setConfig(Config config) {
        this.config = config;
    }

    public List<Double> getMenorValorPorAtributo() {
        return menorValorPorAtributo;
    }

    public void setMenorValorPorAtributo(List<Double> menorValorPorAtributo) {
        this.menorValorPorAtributo = menorValorPorAtributo;
    }

    public List<Double> getMaiorValorPorAtributo() {
        return maiorValorPorAtributo;
    }

    public void setMaiorValorPorAtributo(List<Double> maiorValorPorAtributo) {
        this.maiorValorPorAtributo = maiorValorPorAtributo;
    }

    public List<List<String>> getNormalizedData() {
        if (normalizedData == null) return Collections.emptyList();
        List<List<String>> copia = new ArrayList<>(normalizedData);
        Collections.shuffle(copia);
        return copia;
    }

    public void setNormalizedData(List<List<String>> normalizedData) {
        this.normalizedData = normalizedData;
    }

    public void SetUserConfig(Config userConfig){
        config = userConfig;
        isConfigured = true;
    }

    public List<String> getClasses() {
        return classes;
    }

    public void setClasses(List<String> classes) {
        this.classes = classes;
    }

    public Config ConfigureInitialAndNormalize(byte[] fileData) {
        //lógica para calcular as configurações padrões
        //QUANTIDADE DE NEURONIOS DE SAIDA = QUANTIDADE DE CLASSES
        //QUANTIDADE DE NEURONIOS DE ENTRADA = QUANTIDADE DE COLUNAS/ATRIBUTOS
        //QUANTIDADE DE NEURONIOS DA CAMADA OCULTA = (ENTRADA + SAIDA) / 2
        //logica para normalizar o arquivo
        //retornar as configurações padrão

        menorValorPorAtributo = new ArrayList<>();
        maiorValorPorAtributo = new ArrayList<>();
        classes = new ArrayList<>();
        normalizedData = new ArrayList<>();
        config = new Config();

        int quantidadeDeAtributos = 0, quantidadeDeClasses = 0;
        HashMap<String,String> classes = new HashMap<>();

        String fileContent = new String(fileData, java.nio.charset.StandardCharsets.UTF_8);
        fileContent=fileContent.substring(fileContent.indexOf("\n")+1); //remover a primeira linha de cabeçalho se existir
        List<String> lines = Arrays.asList(fileContent.split("\n"));


        for (String line : lines) {
            List<String> atributos = Arrays.asList(line.trim().split(","));

            if (quantidadeDeAtributos == 0 || quantidadeDeAtributos< atributos.size() - 1) //sempre pega a maior quantidade de atributos
                quantidadeDeAtributos = atributos.size() - 1; // Último atributo é a classe

            String classe = atributos.get(atributos.size() - 1);
            if (!classes.containsKey(classe)){
                classes.put(classe, classe);
                this.classes.add(classe);
                quantidadeDeClasses++;
            }

            atributos = atributos.subList(0,atributos.size()-1);

            //pegar maior e menor valor por atributo
            for (int i =0;i<atributos.size();i++){
                if (menorValorPorAtributo.size() <= i){
                    menorValorPorAtributo.add(Double.parseDouble(atributos.get(i)));
                    maiorValorPorAtributo.add(Double.parseDouble(atributos.get(i)));
                }else{
                    if (menorValorPorAtributo.get(i) > Double.parseDouble(atributos.get(i))){
                        menorValorPorAtributo.set(i,Double.parseDouble(atributos.get(i)));
                    }
                    if (maiorValorPorAtributo.get(i) < Double.parseDouble(atributos.get(i))){
                        maiorValorPorAtributo.set(i,Double.parseDouble(atributos.get(i)));
                    }
                }
            }
        }


        //normalizar
        for (String line : lines) {
            List<String> atributos = new ArrayList<>(Arrays.asList(line.trim().split(",")));
            for (int i =0;i<atributos.size()-1;i++){ //nao pega a classe
                double valor = Double.parseDouble(atributos.get(i));
                double valorNormalizado = (valor - menorValorPorAtributo.get(i)) / (maiorValorPorAtributo.get(i) - menorValorPorAtributo.get(i));
                atributos.set(i, String.valueOf(valorNormalizado));
            }

            //lista onde cada pos é uma lista em que cada pós é um atributo normalizado e o ultimo é a classe
            normalizedData.add(atributos);
        }

        config = new Config();
        config.setInputLayer(quantidadeDeAtributos);
        config.setOutputLayer(quantidadeDeClasses);
        config.setHiddenLayer((quantidadeDeAtributos + quantidadeDeClasses) / 2);
        config.setErrorValue(0.00001);
        config.setIterations(2000);
        config.setLearningRate(0.01);
        config.setTransferFunction("linear");
        isConfigured = true;
        return config;
    }

    public List<List<String>> getNormalizedTestData() {
        byte[] fileData = fileHolder.getTestFileData();
        //normalizar os dados de teste usando os valores minimos e maximos ja calculados
        List<List<String>> normalizedTestData = new ArrayList<>();
        String fileContent = new String(fileData, java.nio.charset.StandardCharsets.UTF_8);
        fileContent=fileContent.substring(fileContent.indexOf("\n")+1); //remover a primeira linha de cabeçalho se existir
        List<String> lines = Arrays.asList(fileContent.split("\n"));
        for (String line : lines) {
            List<String> atributos = new ArrayList<>(Arrays.asList(line.trim().split(",")));
            for (int i =0;i<atributos.size()-1;i++){ //nao pega a classe
                double valor = Double.parseDouble(atributos.get(i));
                double valorNormalizado = (valor - menorValorPorAtributo.get(i)) / (maiorValorPorAtributo.get(i) - menorValorPorAtributo.get(i));
                atributos.set(i, String.valueOf(valorNormalizado));
            }

            //lista onde cada pos é uma lista em que cada pós é um atributo normalizado e o ultimo é a classe
            normalizedTestData.add(atributos);
        }
        Collections.shuffle(normalizedTestData);
        return normalizedTestData;
    }

    public List<List<String>> getNormalizedTestData(FileHolder realFileHolder) {
        if (realFileHolder == null || !realFileHolder.hasTestFile()) {
            System.err.println("ERRO: FileHolder nulo ou sem arquivo de teste em getNormalizedTestData.");
            return new ArrayList<>(); // Retorna lista vazia se não houver arquivo
        }

        byte[] fileData = realFileHolder.getTestFileData();

        // Copie sua lógica original de normalização daqui para baixo
        List<List<String>> normalizedTestData = new ArrayList<>();
        String fileContent = new String(fileData, java.nio.charset.StandardCharsets.UTF_8);
        fileContent = fileContent.substring(fileContent.indexOf("\n") + 1); //remover a primeira linha de cabeçalho se existir
        List<String> lines = Arrays.asList(fileContent.split("\n"));

        for (String line : lines) {
            List<String> atributos = new ArrayList<>(Arrays.asList(line.trim().split(",")));
            for (int i = 0; i < atributos.size() - 1; i++) { //nao pega a classe
                double valor = Double.parseDouble(atributos.get(i));
                double valorNormalizado = (valor - menorValorPorAtributo.get(i)) / (maiorValorPorAtributo.get(i) - menorValorPorAtributo.get(i));
                atributos.set(i, String.valueOf(valorNormalizado));
            }
            normalizedTestData.add(atributos);
        }
        Collections.shuffle(normalizedTestData);
        return normalizedTestData;
    }
}

