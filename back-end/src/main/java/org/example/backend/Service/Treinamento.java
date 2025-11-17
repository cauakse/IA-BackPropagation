package org.example.backend.Service;

import org.example.backend.Entitie.Config;
import org.example.backend.Entitie.Rede;
import org.example.backend.Entitie.RespostaIteracao;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.context.annotation.ScopedProxyMode;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.context.annotation.SessionScope;

import java.io.IOException;
import java.util.List;

@Service
@Scope(value = "session", proxyMode = ScopedProxyMode.TARGET_CLASS)
@SessionScope
public class Treinamento {
    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // 2. CRIE MÉTODOS HELPER PARA PEGAR OS BEANS REAIS
    private ConfigurateInitial getConfig(SimpMessageHeaderAccessor accessor) {
        return (ConfigurateInitial) accessor.getSessionAttributes().get("configurateInitial");
    }

    private Rede getRede(SimpMessageHeaderAccessor accessor) {
        return this.rede;
    }

    public void sendIteration(RespostaIteracao respostaIteracao) {
        messagingTemplate.convertAndSend("/topic/progress", respostaIteracao);
    }

    public void sendConfusionMatrix(int[][] confusionMatrix) {
        messagingTemplate.convertAndSend("/topic/progress", confusionMatrix);
    }

    private FileHolder getFileHolder(SimpMessageHeaderAccessor accessor) {
        return (FileHolder) accessor.getSessionAttributes().get("fileHolder");
    }

    private int epocaAtual = 0;

    private Rede rede;

    private int quantasVezesContinuou =0;

    public boolean initializeTraining(SimpMessageHeaderAccessor headerAccessor) throws IOException {
        ConfigurateInitial configurateInitial = getConfig(headerAccessor);
        if (configurateInitial.isConfigured()){
            treinarInicial(headerAccessor);
        } else {
            return false;
        }
        return true;
    }


    private void treinarInicial(SimpMessageHeaderAccessor headerAccessor) throws IOException{
        ConfigurateInitial configurateInitial = getConfig(headerAccessor);
        this.rede = new Rede();
        epocaAtual = 0;
        Config config = configurateInitial.getConfig();

       rede.definirMatrizes(config);
       rede.setUseBias(config.isUseBias());
       rede.setFunctionName(config.getTransferFunction());
       boolean erroAceitavel = false;
       boolean naoMudouErroSignificativamente = false;
       List<List<String>> dadosTreinamento = configurateInitial.getNormalizedData();
       double erroUltimaEpoca = 0;

       while (epocaAtual<config.getIterations()&& !erroAceitavel && !naoMudouErroSignificativamente){
           epocaAtual++;
           for (List<String> dado : dadosTreinamento){
               rede.putInInputLayer(dado);
               //passar para a camada oculta
               //pegar o valor da camada de entrada, multiplicar pelo peso e colocar no net da camada oculta e aplica a funcao de ativacao
               rede.fowardOcultLayer();
               //passar para a camada de saida, pega o dado do i da camada oculta, multiplica pelo peso e coloca no net da camada de saida e aplica a funcao de ativacao
               rede.fowardOutputLayer();
               //calcular o erro da camada de saida
               rede.calculateOutputError(dado.get(dado.size()-1),configurateInitial.getClasses());
               //backpropagation da camada de saida para a oculta
               rede.backpropagationOutputToHidden(config.getLearningRate());
               //backpropagation da camada oculta para a de entrada
               rede.backpropagationHiddenToInput(config.getLearningRate());
               //calcular erro da rede
               rede.calculateNetworkError(dado.get(dado.size()-1));
           }
           double erroEpoca = rede.getErroDessaEpoca();
           RespostaIteracao respostaIteracao = new RespostaIteracao();
           respostaIteracao.setErroEpoca(erroEpoca);
           respostaIteracao.setEpocaAtual(epocaAtual);

           //verificar erro aceitavel
           if (erroEpoca<=config.getErrorValue()){
                erroAceitavel = true;
                respostaIteracao.setParouPor(new int[]{1,0,0});
           }
           //Para identificar o platô, avalia pelo menos 10 épocas e o desvio padrão da média
           //do erro da Rede. Se ele estiver entre 0 e 0,00001, por exemplo, considere o
           //treinamento estagnado.
           else {
                if (rede.getErrosPorEpoca().size()>=10){
                     double somaDiferencas =0;
                     for (int i = rede.getErrosPorEpoca().size()-1;i>rede.getErrosPorEpoca().size()-10;i--){
                          somaDiferencas += Math.abs(rede.getErrosPorEpoca().get(i)-rede.getErrosPorEpoca().get(i-1));
                     }
                     if (somaDiferencas<0.00001){
                          naoMudouErroSignificativamente = true;
                          respostaIteracao.setParouPor(new int[]{0,0,1});
                     }else{
                         erroUltimaEpoca = rede.getErrosPorEpoca().get(rede.getErrosPorEpoca().size()-1);
                     }
                }
           }
           //enviar progresso
           rede.getErrosPorEpoca().add(rede.getErroDessaEpoca());
           rede.setErroDessaEpoca(0);
           if (epocaAtual<config.getIterations())
            sendIteration(respostaIteracao);
       }

       if (epocaAtual==config.getIterations()){
           RespostaIteracao respostaIteracao = new RespostaIteracao();
           respostaIteracao.setErroEpoca(erroUltimaEpoca);
           respostaIteracao.setEpocaAtual(epocaAtual);
           respostaIteracao.setParouPor(new int[]{0,1,0});
           sendIteration(respostaIteracao);
       }
    }

    public void continueTrainingWithLearningRateReduce(SimpMessageHeaderAccessor headerAccessor) throws IOException {
        ConfigurateInitial configurateInitial = getConfig(headerAccessor);
        double quantoDeveReduzir = 0.1;
        if (quantasVezesContinuou == 2){
            quantoDeveReduzir = 0.4;
        }
        int epocasPosContinuar=0;
        quantasVezesContinuou++;

        Config config = configurateInitial.getConfig();
        config.setLearningRate(config.getLearningRate() * (1 - quantoDeveReduzir));
        configurateInitial.SetUserConfig(config);

        boolean erroAceitavel = false;
        boolean naoMudouErroSignificativamente = false;
        List<List<String>> dadosTreinamento = configurateInitial.getNormalizedData();
        double erroUltimaEpoca = 0;

        while (epocaAtual<config.getIterations()&& !erroAceitavel && !naoMudouErroSignificativamente){
            epocaAtual++;
            epocasPosContinuar++;
            for (List<String> dado : dadosTreinamento){
                rede.putInInputLayer(dado);
                //passar para a camada oculta
                //pegar o valor da camada de entrada, multiplicar pelo peso e colocar no net da camada oculta e aplica a funcao de ativacao
                rede.fowardOcultLayer();
                //passar para a camada de saida, pega o dado do i da camada oculta, multiplica pelo peso e coloca no net da camada de saida e aplica a funcao de ativacao
                rede.fowardOutputLayer();
                //calcular o erro da camada de saida
                rede.calculateOutputError(dado.get(dado.size()-1),configurateInitial.getClasses());
                //backpropagation da camada de saida para a oculta
                rede.backpropagationOutputToHidden(config.getLearningRate());
                //backpropagation da camada oculta para a de entrada
                rede.backpropagationHiddenToInput(config.getLearningRate());
                //calcular erro da rede
                rede.calculateNetworkError(dado.get(dado.size()-1));
            }
            double erroEpoca = rede.getErroDessaEpoca();
            RespostaIteracao respostaIteracao = new RespostaIteracao();
            respostaIteracao.setErroEpoca(erroEpoca);
            respostaIteracao.setEpocaAtual(epocaAtual);

            //verificar erro aceitavel
            if (erroEpoca<=config.getErrorValue()){
                erroAceitavel = true;
                respostaIteracao.setParouPor(new int[]{1,0,0});
            }
            //Para identificar o platô, avalia pelo menos 10 épocas e o desvio padrão da média
            //do erro da Rede. Se ele estiver entre 0 e 0,00001, por exemplo, considere o
            //treinamento estagnado.
            //a quantidade de épocas deve ser após ter escolhido para continuar o treinamento
            else {
                if (quantasVezesContinuou<=2){

                    if (epocasPosContinuar>=10 && rede.getErrosPorEpoca().size()>=10){
                        double somaDiferencas =0;
                        for (int i = rede.getErrosPorEpoca().size()-1;i>rede.getErrosPorEpoca().size()-10;i--){
                            somaDiferencas += Math.abs(rede.getErrosPorEpoca().get(i)-rede.getErrosPorEpoca().get(i-1));
                        }
                        if (somaDiferencas<0.00001){
                            naoMudouErroSignificativamente = true;
                            respostaIteracao.setParouPor(new int[]{0,0,1});
                        }else{
                            erroUltimaEpoca = rede.getErrosPorEpoca().get(rede.getErrosPorEpoca().size()-1);
                        }
                    } else{
                        erroUltimaEpoca = rede.getErrosPorEpoca().get(rede.getErrosPorEpoca().size()-1);
                    }
                }else{
                    erroUltimaEpoca = rede.getErrosPorEpoca().get(rede.getErrosPorEpoca().size()-1);
                }
            }
            //enviar progresso
            rede.getErrosPorEpoca().add(rede.getErroDessaEpoca());
            rede.setErroDessaEpoca(0);
            if (epocaAtual<config.getIterations())
                sendIteration(respostaIteracao);
        }

        if (epocaAtual==config.getIterations()){
            RespostaIteracao respostaIteracao = new RespostaIteracao();
            respostaIteracao.setErroEpoca(erroUltimaEpoca);
            respostaIteracao.setEpocaAtual(epocaAtual);
            respostaIteracao.setParouPor(new int[]{0,1,0});
            sendIteration(respostaIteracao);
        }
    }

    public void continueTraining(SimpMessageHeaderAccessor headerAccessor) throws IOException {
        ConfigurateInitial configurateInitial = getConfig(headerAccessor);
        Config config = configurateInitial.getConfig();
        boolean erroAceitavel = false;
        boolean naoMudouErroSignificativamente = false;
        List<List<String>> dadosTreinamento = configurateInitial.getNormalizedData();
        double erroUltimaEpoca = 0;

        while (epocaAtual<config.getIterations()&& !erroAceitavel && !naoMudouErroSignificativamente){
            epocaAtual++;
            for (List<String> dado : dadosTreinamento){
                rede.putInInputLayer(dado);
                //passar para a camada oculta
                //pegar o valor da camada de entrada, multiplicar pelo peso e colocar no net da camada oculta e aplica a funcao de ativacao
                rede.fowardOcultLayer();
                //passar para a camada de saida, pega o dado do i da camada oculta, multiplica pelo peso e coloca no net da camada de saida e aplica a funcao de ativacao
                rede.fowardOutputLayer();
                //calcular o erro da camada de saida
                rede.calculateOutputError(dado.get(dado.size()-1),configurateInitial.getClasses());
                //backpropagation da camada de saida para a oculta
                rede.backpropagationOutputToHidden(config.getLearningRate());
                //backpropagation da camada oculta para a de entrada
                rede.backpropagationHiddenToInput(config.getLearningRate());
                //calcular erro da rede
                rede.calculateNetworkError(dado.get(dado.size()-1));
            }
            double erroEpoca = rede.getErroDessaEpoca();
            RespostaIteracao respostaIteracao = new RespostaIteracao();
            respostaIteracao.setErroEpoca(erroEpoca);
            respostaIteracao.setEpocaAtual(epocaAtual);

            //verificar erro aceitavel
            if (erroEpoca<=config.getErrorValue()){
                erroAceitavel = true;
                respostaIteracao.setParouPor(new int[]{1,0,0});
            }
            rede.getErrosPorEpoca().add(rede.getErroDessaEpoca());
            rede.setErroDessaEpoca(0);
            if (epocaAtual<config.getIterations())
                sendIteration(respostaIteracao);
        }

        if (epocaAtual==config.getIterations()){
            RespostaIteracao respostaIteracao = new RespostaIteracao();
            respostaIteracao.setErroEpoca(erroUltimaEpoca);
            respostaIteracao.setEpocaAtual(epocaAtual);
            respostaIteracao.setParouPor(new int[]{0,1,0});
            sendIteration(respostaIteracao);
        }
    }

    public void startTesting(SimpMessageHeaderAccessor headerAccessor) throws IOException {

        if (this.rede == null) {
            System.err.println("ERRO em startTesting: A rede (this.rede) está nula. O treinamento foi executado primeiro?");
            // Você pode querer enviar uma mensagem de erro de volta
            // messagingTemplate.convertAndSend("/topic/progress", "ERRO: Treine a rede antes de testar.");
            return;
        }

        ConfigurateInitial configurateInitial = getConfig(headerAccessor);
        FileHolder fileHolder = getFileHolder(headerAccessor);

        if (configurateInitial == null || fileHolder == null) {
            System.err.println("ERRO em startTesting: Nao foi possivel pegar beans da sessao WebSocket.");
            return;
        }

        List<List<String>> dadosTeste = configurateInitial.getNormalizedTestData(fileHolder);

        if (dadosTeste.isEmpty()) {
            System.err.println("ERRO em startTesting: Nao há dados de teste. O upload do arquivo de teste foi feito?");
            // Você pode querer enviar uma mensagem de erro de volta ao frontend aqui
            // messagingTemplate.convertAndSend("/topic/progress", "ERRO: Arquivo de teste não encontrado");
            return;
        }

        System.out.println("Iniciando teste com " + dadosTeste.size() + " registros.");
        //gerar a matriz de confusão
        int quantidadeDeClasses = configurateInitial.getClasses().size();
        int[][] matrizDeConfusao = new int[quantidadeDeClasses][quantidadeDeClasses];
        for (List<String> dado : dadosTeste){
            rede.putInInputLayer(dado);
            rede.fowardOcultLayer();
            rede.fowardOutputLayer();
            String s = dado.get(dado.size()-1);
            double iSaida[] = rede.getiSaida();
            List<String> classes = configurateInitial.getClasses();
            //descobrir qual classe foi a prevista
            int classePrevista = 0;
            double maiorValor = iSaida[0];
            for (int i =1;i<iSaida.length;i++){
                if (iSaida[i]>maiorValor){
                    maiorValor = iSaida[i];
                    classePrevista = i;
                }
            }
            int classeReal = classes.indexOf(s);
            matrizDeConfusao[classeReal][classePrevista]++;
            sendConfusionMatrix(matrizDeConfusao);
        }
    }

    public void resetTraining() {
        this.epocaAtual = 0;
        this.rede = null;
        this.quantasVezesContinuou = 0;
    }
}
