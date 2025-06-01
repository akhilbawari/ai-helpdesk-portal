package com.helpdesk.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class SupabaseStorageService {
    
    private final RestTemplate restTemplate;
    
    @Value("${supabase.url}")
    private String supabaseUrl;
    
    @Value("${supabase.key}")
    private String supabaseKey;
    
    @Value("${supabase.storage.bucket}")
    private String bucketName;
    
    /**
     * Upload a file to Supabase Storage
     *
     * @param filePath Path where the file will be stored in the bucket
     * @param file     The file to upload
     * @throws IOException If there's an error reading the file
     */
    public void uploadFile(String filePath, MultipartFile file) throws IOException {
        String url = supabaseUrl + "/storage/v1/object/" + bucketName + "/" + filePath;
        
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + supabaseKey);
        headers.setContentType(MediaType.valueOf(file.getContentType()));
        
        HttpEntity<byte[]> requestEntity = new HttpEntity<>(file.getBytes(), headers);
        
        restTemplate.exchange(url, HttpMethod.POST, requestEntity, String.class);
    }
    
    /**
     * Download a file from Supabase Storage
     *
     * @param filePath Path to the file in the bucket
     * @return The file content as byte array
     * @throws IOException If there's an error downloading the file
     */
    public byte[] downloadFile(String filePath) throws IOException {
        String url = supabaseUrl + "/storage/v1/object/" + bucketName + "/" + filePath;
        
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + supabaseKey);
        
        HttpEntity<String> requestEntity = new HttpEntity<>(headers);
        
        ResponseEntity<byte[]> response = restTemplate.exchange(
                url, HttpMethod.GET, requestEntity, byte[].class);
        
        return response.getBody();
    }
    
    /**
     * Delete a file from Supabase Storage
     *
     * @param filePath Path to the file in the bucket
     * @throws IOException If there's an error deleting the file
     */
    public void deleteFile(String filePath) throws IOException {
        String url = supabaseUrl + "/storage/v1/object/" + bucketName + "/" + filePath;
        
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + supabaseKey);
        
        HttpEntity<String> requestEntity = new HttpEntity<>(headers);
        
        restTemplate.exchange(url, HttpMethod.DELETE, requestEntity, String.class);
    }
    
    /**
     * Get a public URL for a file
     *
     * @param filePath Path to the file in the bucket
     * @return Public URL for the file
     */
    public String getPublicUrl(String filePath) {
        return supabaseUrl + "/storage/v1/object/public/" + bucketName + "/" + filePath;
    }
}
