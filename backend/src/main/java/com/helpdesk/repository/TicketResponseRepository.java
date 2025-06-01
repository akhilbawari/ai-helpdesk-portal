package com.helpdesk.repository;

import com.helpdesk.model.Profile;
import com.helpdesk.model.Ticket;
import com.helpdesk.model.TicketResponse;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketResponseRepository extends MongoRepository<TicketResponse, String> {
    List<TicketResponse> findByTicket(Ticket ticket);
    List<TicketResponse> findByTicketOrderByCreatedAtAsc(Ticket ticket);
    List<TicketResponse> findByUser(Profile user);
    List<TicketResponse> findByTicketAndInternal(Ticket ticket, boolean internal);
}
