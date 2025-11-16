package org.example.backend.Service;

import org.springframework.context.annotation.Scope;
import org.springframework.context.annotation.ScopedProxyMode;
import org.springframework.stereotype.Service;
import org.springframework.web.context.annotation.SessionScope;
import org.springframework.web.multipart.MultipartFile;

@Service
@Scope(value = "session", proxyMode = ScopedProxyMode.TARGET_CLASS)
@SessionScope
public class FileHolder {

    private byte[] fileData;

    private byte[] testFileData;

    public void setFileData(MultipartFile file) throws Exception {
        this.fileData = file.getBytes();
    }

    public boolean hasTestFile() {
        return testFileData != null;
    }

    public void setTestFileData(MultipartFile file) throws Exception {
        this.testFileData = file.getBytes();
    }

    public byte[] getTestFileData() {
        return testFileData;
    }

    public byte[] getFileData() {
        return fileData;
    }

    public boolean hasFile() {
        return fileData != null;
    }

    public void reset() {
        this.fileData = null;
        this.testFileData = null;
    }
}
