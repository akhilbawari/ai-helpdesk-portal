package com.helpdesk.repository;

import com.helpdesk.model.KnowledgeDoc;
import com.helpdesk.model.Profile;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KnowledgeDocRepository extends MongoRepository<KnowledgeDoc, String> {
    List<KnowledgeDoc> findByCategory(Profile.Department category);
    List<KnowledgeDoc> findByCreatedBy(Profile createdBy);
    List<KnowledgeDoc> findByTitleContainingIgnoreCase(String title);
    
    @Query(value = "{}", fields = "{}") // TODO: Update with proper MongoDB vector search query
    List<KnowledgeDoc> findSimilarDocuments(@Param("embedding") byte[] embedding, @Param("limit") int limit);
}
