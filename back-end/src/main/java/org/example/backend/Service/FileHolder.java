package org.example.backend.Service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileHolder {

    private byte[] fileData;

    public void setFileData(MultipartFile file) throws Exception {
        this.fileData = file.getBytes();
    }

    public byte[] getFileData() {
        return fileData;
    }

    public boolean hasFile() {
        return fileData != null;
    }
}
