package com.helpdesk.controller;

import com.helpdesk.dto.ApiResponse;
import com.helpdesk.model.KnowledgeDocument;
import com.helpdesk.model.Profile;
import com.helpdesk.model.Ticket;
import com.helpdesk.repository.TicketRepository;
import com.helpdesk.service.KnowledgeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.NoSuchElementException;

/**
 * Controller for knowledge base operations
 */
@RestController
@RequestMapping("/knowledge")
@RequiredArgsConstructor
@Slf4j
public class KnowledgeController {

    private final KnowledgeService knowledgeService;
    private final TicketRepository ticketRepository;

    /**
     * Get all knowledge documents
     *
     * @param publishedOnly Whether to return only published documents
     * @return List of knowledge documents
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<KnowledgeDocument>>> getAllDocuments(
            @RequestParam(defaultValue = "true") boolean publishedOnly) {
        
        List<KnowledgeDocument> documents;
        
        if (publishedOnly) {
            documents = knowledgeService.getAllDocuments().stream()
                    .filter(KnowledgeDocument::isPublished)
                    .toList();
        } else {
            documents = knowledgeService.getAllDocuments();
        }
        
        return ResponseEntity.ok(ApiResponse.success(documents, "Knowledge documents retrieved"));
    }

    /**
     * Get knowledge document by ID
     *
     * @param id Document ID
     * @return The knowledge document
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<KnowledgeDocument>> getDocumentById(@PathVariable String id) {
        try {
            KnowledgeDocument document = knowledgeService.getDocumentById(id);
            return ResponseEntity.ok(ApiResponse.success(document, "Knowledge document retrieved"));
        } catch (NoSuchElementException e) {
            log.error("Knowledge document not found with ID: {}", id);
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Create a new knowledge document
     *
     * @param document The document to create
     * @param userId ID of the user creating the document
     * @return The created document
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPPORT')")
    public ResponseEntity<ApiResponse<KnowledgeDocument>> createDocument(
            @RequestBody KnowledgeDocument document,
            @RequestParam String userId) {
        
        try {
            KnowledgeDocument createdDocument = knowledgeService.createDocument(document, userId);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(createdDocument, "Knowledge document created"));
        } catch (NoSuchElementException e) {
            log.error("Error creating knowledge document: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage(),HttpStatus.BAD_REQUEST));
        }
    }

    /**
     * Update an existing knowledge document
     *
     * @param id Document ID
     * @param document Updated document details
     * @param userId ID of the user updating the document
     * @return The updated document
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPPORT')")
    public ResponseEntity<ApiResponse<KnowledgeDocument>> updateDocument(
            @PathVariable String id,
            @RequestBody KnowledgeDocument document,
            @RequestParam String userId) {
        
        try {
            KnowledgeDocument updatedDocument = knowledgeService.updateDocument(id, document, userId);
            return ResponseEntity.ok(ApiResponse.success(updatedDocument, "Knowledge document updated"));
        } catch (NoSuchElementException e) {
            log.error("Error updating knowledge document: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Delete a knowledge document
     *
     * @param id Document ID
     * @return No content on success
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteDocument(@PathVariable String id) {
        try {
            knowledgeService.deleteDocument(id);
            return ResponseEntity.ok(ApiResponse.success(null, "Knowledge document deleted"));
        } catch (NoSuchElementException e) {
            log.error("Error deleting knowledge document: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Search for knowledge documents by text
     *
     * @param query Text to search for
     * @param publishedOnly Whether to return only published documents
     * @return List of matching documents
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<KnowledgeDocument>>> searchDocuments(
            @RequestParam String query,
            @RequestParam(defaultValue = "true") boolean publishedOnly) {
        
        List<KnowledgeDocument> documents = knowledgeService.searchDocuments(query);
        
        if (publishedOnly) {
            documents = documents.stream()
                    .filter(KnowledgeDocument::isPublished)
                    .toList();
        }
        
        return ResponseEntity.ok(ApiResponse.success(documents, "Search results retrieved"));
    }

    /**
     * Find relevant knowledge documents for a ticket
     *
     * @param ticketId The ticket ID
     * @return List of relevant documents
     */
    @GetMapping("/relevant/{ticketId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPPORT')")
    public ResponseEntity<ApiResponse<List<KnowledgeDocument>>> findRelevantDocuments(
            @PathVariable String ticketId) {
        
        try {
            Ticket ticket = ticketRepository.findById(ticketId)
                    .orElseThrow(() -> new NoSuchElementException("Ticket not found with id: " + ticketId));
            
            List<KnowledgeDocument> relevantDocs = knowledgeService.findRelevantDocuments(ticket);
            return ResponseEntity.ok(ApiResponse.success(relevantDocs, "Relevant documents retrieved"));
        } catch (NoSuchElementException e) {
            log.error("Error finding relevant documents: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get documents by department
     *
     * @param department The department
     * @param publishedOnly Whether to return only published documents
     * @return List of documents for the department
     */
    @GetMapping("/department/{department}")
    public ResponseEntity<ApiResponse<List<KnowledgeDocument>>> getDocumentsByDepartment(
            @PathVariable Profile.Department department,
            @RequestParam(defaultValue = "true") boolean publishedOnly) {
        
        List<KnowledgeDocument> documents = knowledgeService.getDocumentsByDepartment(department, publishedOnly);
        return ResponseEntity.ok(ApiResponse.success(documents, "Department documents retrieved"));
    }

    /**
     * Get documents by type
     *
     * @param documentType The document type
     * @param publishedOnly Whether to return only published documents
     * @return List of documents of the specified type
     */
    @GetMapping("/type/{documentType}")
    public ResponseEntity<ApiResponse<List<KnowledgeDocument>>> getDocumentsByType(
            @PathVariable KnowledgeDocument.DocumentType documentType,
            @RequestParam(defaultValue = "true") boolean publishedOnly) {
        
        List<KnowledgeDocument> documents = knowledgeService.getDocumentsByType(documentType, publishedOnly);
        return ResponseEntity.ok(ApiResponse.success(documents, "Documents by type retrieved"));
    }

    /**
     * Get documents by tag
     *
     * @param tag The tag to search for
     * @param publishedOnly Whether to return only published documents
     * @return List of documents with the specified tag
     */
    @GetMapping("/tag/{tag}")
    public ResponseEntity<ApiResponse<List<KnowledgeDocument>>> getDocumentsByTag(
            @PathVariable String tag,
            @RequestParam(defaultValue = "true") boolean publishedOnly) {
        
        List<KnowledgeDocument> documents = knowledgeService.getDocumentsByTag(tag, publishedOnly);
        return ResponseEntity.ok(ApiResponse.success(documents, "Documents by tag retrieved"));
    }
}
