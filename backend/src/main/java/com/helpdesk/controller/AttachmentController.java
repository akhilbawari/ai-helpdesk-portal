package com.helpdesk.controller;

import com.helpdesk.dto.ApiResponse;
import com.helpdesk.model.Attachment;
import com.helpdesk.service.AttachmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/attachments")
@RequiredArgsConstructor
@Slf4j
public class AttachmentController {
    
    private final AttachmentService attachmentService;
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<Attachment>>> getAllAttachments() {
        log.info("Fetching all attachments");
        List<Attachment> attachments = attachmentService.getAllAttachments();
        return ResponseEntity.ok(ApiResponse.success(attachments, "Attachments retrieved successfully"));
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPPORT') or @ticketSecurity.canViewAttachment(authentication, #id)")
    public ResponseEntity<ApiResponse<Attachment>> getAttachmentById(@PathVariable String id) {
        log.info("Fetching attachment with id: {}", id);
        Attachment attachment = attachmentService.getAttachmentById(id);
        return ResponseEntity.ok(ApiResponse.success(attachment, "Attachment retrieved successfully"));
    }
    
    @GetMapping("/ticket/{ticketId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPPORT') or @ticketSecurity.isTicketCreator(authentication, #ticketId)")
    public ResponseEntity<ApiResponse<List<Attachment>>> getAttachmentsByTicket(@PathVariable String ticketId) {
        log.info("Fetching attachments for ticket: {}", ticketId);
        List<Attachment> attachments = attachmentService.getAttachmentsByTicket(ticketId);
        return ResponseEntity.ok(ApiResponse.success(attachments, "Attachments retrieved successfully"));
    }
    
    @GetMapping("/uploader/{uploaderId}")
    @PreAuthorize("hasRole('ADMIN') or #uploaderId == authentication.principal.id")
    public ResponseEntity<ApiResponse<List<Attachment>>> getAttachmentsByUploader(@PathVariable String uploaderId) {
        log.info("Fetching attachments by uploader: {}", uploaderId);
        List<Attachment> attachments = attachmentService.getAttachmentsByUploader(uploaderId);
        return ResponseEntity.ok(ApiResponse.success(attachments, "Attachments retrieved successfully"));
    }
    
    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<Attachment>> uploadAttachment(
            @RequestParam("ticketId") String ticketId,
            @RequestParam("file") MultipartFile file,
            Authentication authentication) throws IOException {
        
        String uploaderId = authentication.getName();
        log.info("Uploading attachment for ticket: {} by user: {}, filename: {}", ticketId, uploaderId, file.getOriginalFilename());
        
        Attachment attachment = attachmentService.uploadAttachment(ticketId, uploaderId, file);
        return new ResponseEntity<>(
                ApiResponse.success(attachment, "File uploaded successfully"),
                HttpStatus.CREATED);
    }
    
    @GetMapping("/download/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPPORT') or @ticketSecurity.canViewAttachment(authentication, #id)")
    public ResponseEntity<Resource> downloadAttachment(@PathVariable String id) throws IOException {
        Attachment attachment = attachmentService.getAttachmentById(id);
        byte[] data = attachmentService.downloadAttachment(id);
        
        ByteArrayResource resource = new ByteArrayResource(data);
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + attachment.getFileName() + "\"")
                .contentType(MediaType.parseMediaType(attachment.getMimeType()))
                .contentLength(attachment.getFileSize())
                .body(resource);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @ticketSecurity.isAttachmentUploader(authentication, #id)")
    public ResponseEntity<ApiResponse<Void>> deleteAttachment(@PathVariable String id) throws IOException {
        log.info("Deleting attachment with id: {}", id);
        attachmentService.deleteAttachment(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Attachment deleted successfully"));
    }
}
