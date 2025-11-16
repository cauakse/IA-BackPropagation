package org.example.backend.Control;

import org.example.backend.Entitie.Rede;
import org.example.backend.Service.ConfigurateInitial;
import org.example.backend.Service.FileHolder;
import org.example.backend.Service.Treinamento;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RequestMapping("/api/file")
public class FileController {


    @Autowired
    private FileHolder fileHolder;

    @Autowired
    private ConfigurateInitial configurateInitial;

    @Autowired
    private Treinamento treinamento;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Object> uploadFile(@RequestParam("file") MultipartFile file){
        //salvar no singleton o arquivo recebido
        try {
            fileHolder.setFileData(file);
            return ResponseEntity.ok("File uploaded successfully");
        }catch (Exception e){
            return ResponseEntity.status(500).body("Error uploading file: " + e.getMessage());
        }
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @RequestMapping("/test")
    public ResponseEntity<Object> uploadTestFile (@RequestParam("file") MultipartFile file){
        try {
            fileHolder.setTestFileData(file);
            return ResponseEntity.ok("Test File uploaded successfully");
        }catch (Exception e){
            return ResponseEntity.status(500).body("Error uploading test file: " + e.getMessage());
        }
    }

}
