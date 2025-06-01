package com.helpdesk.repository;

import com.helpdesk.model.Attachment;
import com.helpdesk.model.Profile;
import com.helpdesk.model.Ticket;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttachmentRepository extends MongoRepository<Attachment, String> {
    List<Attachment> findByTicket(Ticket ticket);
    List<Attachment> findByUploadedBy(Profile uploadedBy);
}
