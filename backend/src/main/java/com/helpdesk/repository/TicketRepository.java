package com.helpdesk.repository;

import com.helpdesk.model.Profile;
import com.helpdesk.model.Ticket;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends MongoRepository<Ticket, String> {
    List<Ticket> findByCreatedBy(Profile createdBy);
    List<Ticket> findByAssignedTo(Profile assignedTo);
    List<Ticket> findByStatus(Ticket.Status status);
    List<Ticket> findByCategory(Profile.Department category);
    List<Ticket> findByPriority(Ticket.Priority priority);
    List<Ticket> findByCategoryAndStatus(Profile.Department category, Ticket.Status status);
}
