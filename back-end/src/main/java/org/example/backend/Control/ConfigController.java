package org.example.backend.Control;

import org.example.backend.Entitie.Config;
import org.example.backend.Service.ConfigurateInitial;
import org.example.backend.Service.FileHolder;
import org.example.backend.Service.Treinamento;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RequestMapping("/api/config")
public class ConfigController {

    @Autowired
    private FileHolder fileHolder;
    @Autowired
    private ConfigurateInitial configurateInitial;
    @Autowired
    private Treinamento treinamento;

    @GetMapping
    public ResponseEntity<Object> getConfig(){

        if (fileHolder.hasFile()){
            try{
                treinamento.resetTraining();
                Config config = configurateInitial.ConfigureInitialAndNormalize(fileHolder.getFileData());
                configurateInitial.setConfigured(true);
                return ResponseEntity.ok(config);
            } catch (Exception e) {
                return ResponseEntity.status(500).body("Error processing file: " + e.getMessage());
            }
        }
        return ResponseEntity.badRequest().body("File not uploaded");
    }

    @PostMapping
    public ResponseEntity<Object> setConfig(@RequestBody Config config){
        configurateInitial.SetUserConfig(config);
        return ResponseEntity.ok("Configuration set successfully");
    }

    @GetMapping("/reset")
    public ResponseEntity<Object> resetConfig(){
        fileHolder.reset();
        configurateInitial.reset();
        treinamento.resetTraining();
        return ResponseEntity.ok("Configuration reset successfully");
    }
}
