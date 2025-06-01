package com.helpdesk.service;

import com.helpdesk.model.KnowledgeDocument;
import com.helpdesk.model.Profile;
import com.helpdesk.model.Ticket;
import com.helpdesk.repository.KnowledgeDocumentRepository;
import com.helpdesk.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for managing knowledge base documents
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class KnowledgeService {

    private final KnowledgeDocumentRepository knowledgeRepository;
    private final ProfileRepository profileRepository;
    private final AIService aiService;

    /**
     * Get all knowledge documents
     *
     * @return List of all knowledge documents
     */
    @Transactional(readOnly = true)
    public List<KnowledgeDocument> getAllDocuments() {
        return knowledgeRepository.findAll();
    }

    /**
     * Get knowledge document by ID
     *
     * @param id Document ID
     * @return The knowledge document
     * @throws NoSuchElementException if document not found
     */
    @Transactional(readOnly = true)
    public KnowledgeDocument getDocumentById(String id) {
        return knowledgeRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Knowledge document not found with id: " + id));
    }

    /**
     * Create a new knowledge document
     *
     * @param document The document to create
     * @param creatorId ID of the user creating the document
     * @return The created document
     */
    @Transactional
    public KnowledgeDocument createDocument(KnowledgeDocument document, String creatorId) {
        Profile creator = profileRepository.findById(creatorId)
                .orElseThrow(() -> new NoSuchElementException("User not found with id: " + creatorId));
        
        document.setCreatedBy(creator);
        document.setLastUpdatedBy(creator);
        
        KnowledgeDocument savedDocument = knowledgeRepository.save(document);
        log.info("Created knowledge document with ID: {}", savedDocument.getId());
        
        return savedDocument;
    }

    /**
     * Update an existing knowledge document
     *
     * @param id Document ID
     * @param documentDetails Updated document details
     * @param updaterId ID of the user updating the document
     * @return The updated document
     */
    @Transactional
    public KnowledgeDocument updateDocument(String id, KnowledgeDocument documentDetails, String updaterId) {
        KnowledgeDocument document = getDocumentById(id);
        Profile updater = profileRepository.findById(updaterId)
                .orElseThrow(() -> new NoSuchElementException("User not found with id: " + updaterId));
        
        if (documentDetails.getTitle() != null) {
            document.setTitle(documentDetails.getTitle());
        }
        
        if (documentDetails.getContent() != null) {
            document.setContent(documentDetails.getContent());
        }
        
        if (documentDetails.getDocumentType() != null) {
            document.setDocumentType(documentDetails.getDocumentType());
        }
        
        if (documentDetails.getTags() != null) {
            document.setTags(documentDetails.getTags());
        }
        
        if (documentDetails.getDepartment() != null) {
            document.setDepartment(documentDetails.getDepartment());
        }
        
        document.setPublished(documentDetails.isPublished());
        document.setLastUpdatedBy(updater);
        
        KnowledgeDocument updatedDocument = knowledgeRepository.save(document);
        log.info("Updated knowledge document with ID: {}", updatedDocument.getId());
        
        return updatedDocument;
    }

    /**
     * Delete a knowledge document
     *
     * @param id Document ID
     */
    @Transactional
    public void deleteDocument(String id) {
        KnowledgeDocument document = getDocumentById(id);
        knowledgeRepository.delete(document);
        log.info("Deleted knowledge document with ID: {}", id);
    }

    /**
     * Search for knowledge documents by text
     *
     * @param searchText Text to search for
     * @return List of matching documents
     */
    @Transactional(readOnly = true)
    public List<KnowledgeDocument> searchDocuments(String searchText) {
        return knowledgeRepository.searchByText(searchText);
    }

    /**
     * Find relevant knowledge documents for a ticket
     *
     * @param ticket The ticket to find relevant documents for
     * @return List of relevant documents
     */
    @Transactional(readOnly = true)
    public List<KnowledgeDocument> findRelevantDocuments(Ticket ticket) {
        // First, get documents from the same department
        List<KnowledgeDocument> departmentDocs = ticket.getCategory() != null ?
                knowledgeRepository.findByDepartmentAndPublished(ticket.getCategory(), true) :
                Collections.emptyList();
        
        // Then search by keywords from the ticket title and description
        Set<KnowledgeDocument> relevantDocs = new HashSet<>(departmentDocs);
        
        if (ticket.getTitle() != null && !ticket.getTitle().isEmpty()) {
            relevantDocs.addAll(knowledgeRepository.searchByText(ticket.getTitle()));
        }
        
        if (ticket.getDescription() != null && !ticket.getDescription().isEmpty()) {
            try {
                // Use AI service to extract key terms from the description
                Map<String, Object> keyTerms = aiService.detectPatterns(Collections.singletonList(ticket.getDescription()));
                
                @SuppressWarnings("unchecked")
                List<String> patterns = (List<String>) keyTerms.getOrDefault("patterns", Collections.emptyList());
                
                // Search for documents matching each key term
                for (String term : patterns) {
                    relevantDocs.addAll(knowledgeRepository.searchByText(term));
                }
                
                // Fallback to simple word extraction if AI returns no patterns
                if (patterns.isEmpty()) {
                    // Extract keywords from description
                    String[] words = ticket.getDescription().split("\\s+");
                    for (String word : words) {
                        if (word.length() > 4) { // Only use significant words
                            relevantDocs.addAll(knowledgeRepository.searchByText(word));
                        }
                    }
                }
            } catch (Exception e) {
                log.warn("Error using AI to extract key terms: {}", e.getMessage());
                // Fallback to simple word extraction
                String[] words = ticket.getDescription().split("\\s+");
                for (String word : words) {
                    if (word.length() > 4) { // Only use significant words
                        relevantDocs.addAll(knowledgeRepository.searchByText(word));
                    }
                }
            }
        }
        
        // Sort by relevance (for now, just by most recent)
        return relevantDocs.stream()
                .sorted(Comparator.comparing(KnowledgeDocument::getUpdatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .collect(Collectors.toList());
    }

    /**
     * Get documents by department
     *
     * @param department The department
     * @param publishedOnly Whether to return only published documents
     * @return List of documents for the department
     */
    @Transactional(readOnly = true)
    public List<KnowledgeDocument> getDocumentsByDepartment(Profile.Department department, boolean publishedOnly) {
        if (publishedOnly) {
            return knowledgeRepository.findByDepartmentAndPublished(department, true);
        } else {
            return knowledgeRepository.findByDepartment(department);
        }
    }

    /**
     * Get documents by type
     *
     * @param documentType The document type
     * @param publishedOnly Whether to return only published documents
     * @return List of documents of the specified type
     */
    @Transactional(readOnly = true)
    public List<KnowledgeDocument> getDocumentsByType(KnowledgeDocument.DocumentType documentType, boolean publishedOnly) {
        List<KnowledgeDocument> documents = knowledgeRepository.findByDocumentType(documentType);
        
        if (publishedOnly) {
            return documents.stream()
                    .filter(KnowledgeDocument::isPublished)
                    .collect(Collectors.toList());
        } else {
            return documents;
        }
    }

    /**
     * Get documents by tag
     *
     * @param tag The tag to search for
     * @param publishedOnly Whether to return only published documents
     * @return List of documents with the specified tag
     */
    @Transactional(readOnly = true)
    public List<KnowledgeDocument> getDocumentsByTag(String tag, boolean publishedOnly) {
        List<KnowledgeDocument> documents = knowledgeRepository.findByTagsContaining(tag);
        
        if (publishedOnly) {
            return documents.stream()
                    .filter(KnowledgeDocument::isPublished)
                    .collect(Collectors.toList());
        } else {
            return documents;
        }
    }
}
