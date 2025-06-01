package com.helpdesk.service;

import com.helpdesk.model.Attachment;
import com.helpdesk.model.Profile;
import com.helpdesk.model.Ticket;
import com.helpdesk.repository.AttachmentRepository;
import com.helpdesk.repository.ProfileRepository;
import com.helpdesk.repository.TicketRepository;
import java.util.NoSuchElementException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AttachmentService {
    
    private final AttachmentRepository attachmentRepository;
    private final TicketRepository ticketRepository;
    private final ProfileRepository profileRepository;
    private final SupabaseStorageService storageService;
    
    @Transactional(readOnly = true)
    public List<Attachment> getAllAttachments() {
        return attachmentRepository.findAll();
    }
    
    @Transactional(readOnly = true)
    public Attachment getAttachmentById(String id) {
        return attachmentRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Attachment not found with id: " + id));
    }
    
    @Transactional(readOnly = true)
    public List<Attachment> getAttachmentsByTicket(String ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new NoSuchElementException("Ticket not found with id: " + ticketId));
        return attachmentRepository.findByTicket(ticket);
    }
    
    @Transactional(readOnly = true)
    public List<Attachment> getAttachmentsByUploader(String uploaderId) {
        Profile uploader = profileRepository.findById(uploaderId)
                .orElseThrow(() -> new NoSuchElementException("User not found with id: " + uploaderId));
        return attachmentRepository.findByUploadedBy(uploader);
    }
    
    @Transactional
    public Attachment uploadAttachment(String ticketId, String uploaderId, MultipartFile file) throws IOException {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new NoSuchElementException("Ticket not found with id: " + ticketId));
        
        Profile uploader = profileRepository.findById(uploaderId)
                .orElseThrow(() -> new NoSuchElementException("User not found with id: " + uploaderId));
        
        // Upload file to Supabase Storage
        String filePath = "tickets/" + ticketId + "/" + file.getOriginalFilename();
        storageService.uploadFile(filePath, file);
        
        // Create and save attachment record
        Attachment attachment = Attachment.builder()
                .ticket(ticket)
                .fileName(file.getOriginalFilename())
                .filePath(filePath)
                .fileSize(file.getSize())
                .mimeType(file.getContentType())
                .uploadedBy(uploader)
                .build();
        
        return attachmentRepository.save(attachment);
    }
    
    @Transactional
    public byte[] downloadAttachment(String attachmentId) throws IOException {
        Attachment attachment = getAttachmentById(attachmentId);
        return storageService.downloadFile(attachment.getFilePath());
    }
    
    @Transactional
    public void deleteAttachment(String id) throws IOException {
        Attachment attachment = getAttachmentById(id);
        
        // Delete from Supabase Storage
        storageService.deleteFile(attachment.getFilePath());
        
        // Delete from database
        attachmentRepository.delete(attachment);
    }
}
