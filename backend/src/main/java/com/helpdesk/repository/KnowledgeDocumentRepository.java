package com.helpdesk.repository;

import com.helpdesk.model.KnowledgeDocument;
import com.helpdesk.model.Profile;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for knowledge base documents
 */
@Repository
public interface KnowledgeDocumentRepository extends MongoRepository<KnowledgeDocument, String> {
    
    // Find documents by department
    List<KnowledgeDocument> findByDepartment(Profile.Department department);
    
    // Find documents by type
    List<KnowledgeDocument> findByDocumentType(KnowledgeDocument.DocumentType documentType);
    
    // Find documents by tag
    List<KnowledgeDocument> findByTagsContaining(String tag);
    
    // Find published documents
    List<KnowledgeDocument> findByPublishedTrue();
    
    // Find documents by creator
    List<KnowledgeDocument> findByCreatedBy(Profile createdBy);
    
    // Find documents by department and published status
    List<KnowledgeDocument> findByDepartmentAndPublished(Profile.Department department, boolean published);
    
    // Text search in title and content
    @Query("{ $text: { $search: ?0 } }")
    List<KnowledgeDocument> searchByText(String searchText);
    
    // Find documents by department and type
    List<KnowledgeDocument> findByDepartmentAndDocumentType(
            Profile.Department department, 
            KnowledgeDocument.DocumentType documentType);
}
