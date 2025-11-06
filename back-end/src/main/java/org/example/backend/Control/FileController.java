package org.example.backend.Control;

import org.example.backend.Service.FileHolder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@CrossOrigin
@RequestMapping("/api/file")
public class FileController {

    @Autowired
    private  FileHolder fileHolder;

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

}
