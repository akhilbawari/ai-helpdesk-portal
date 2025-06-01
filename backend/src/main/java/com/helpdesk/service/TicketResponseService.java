package com.helpdesk.service;

import com.helpdesk.model.Profile;
import com.helpdesk.model.Ticket;
import com.helpdesk.model.TicketResponse;
import com.helpdesk.repository.ProfileRepository;
import com.helpdesk.repository.TicketRepository;
import com.helpdesk.repository.TicketResponseRepository;
import java.util.NoSuchElementException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TicketResponseService {
    
    private final TicketResponseRepository ticketResponseRepository;
    private final TicketRepository ticketRepository;
    private final ProfileRepository profileRepository;
    
    @Transactional(readOnly = true)
    public List<TicketResponse> getAllResponses() {
        return ticketResponseRepository.findAll();
    }
    
    @Transactional(readOnly = true)
    public TicketResponse getResponseById(String id) {
        return ticketResponseRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Response not found with id: " + id));
    }
    
    @Transactional(readOnly = true)
    public List<TicketResponse> getResponsesByTicket(String ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new NoSuchElementException("Ticket not found with id: " + ticketId));
        return ticketResponseRepository.findByTicketOrderByCreatedAtAsc(ticket);
    }
    
    @Transactional(readOnly = true)
    public List<TicketResponse> getResponsesByUser(String userId) {
        Profile user = profileRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("User not found with id: " + userId));
        return ticketResponseRepository.findByUser(user);
    }
    
    @Transactional(readOnly = true)
    public List<TicketResponse> getInternalResponsesByTicket(String ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new NoSuchElementException("Ticket not found with id: " + ticketId));
        return ticketResponseRepository.findByTicketAndInternal(ticket, true);
    }
    
    @Transactional(readOnly = true)
    public List<TicketResponse> getPublicResponsesByTicket(String ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new NoSuchElementException("Ticket not found with id: " + ticketId));
        return ticketResponseRepository.findByTicketAndInternal(ticket, false);
    }
    
    @Transactional
    public TicketResponse createResponse(TicketResponse response) {
        // Validate ticket exists
        Ticket ticket = ticketRepository.findById(response.getTicket().getId())
                .orElseThrow(() -> new NoSuchElementException("Ticket not found with id: " + response.getTicket().getId()));
        response.setTicket(ticket);
        
        // Validate user exists
        Profile user = profileRepository.findById(response.getUser().getId())
                .orElseThrow(() -> new NoSuchElementException("User not found with id: " + response.getUser().getId()));
        response.setUser(user);
        
        return ticketResponseRepository.save(response);
    }
    
    @Transactional
    public TicketResponse updateResponse(String id, TicketResponse responseDetails) {
        TicketResponse response = getResponseById(id);
        
        if (responseDetails.getContent() != null) {
            response.setContent(responseDetails.getContent());
        }
        
        if (responseDetails.isInternal() != response.isInternal()) {
            response.setInternal(responseDetails.isInternal());
        }
        
        return ticketResponseRepository.save(response);
    }
    
    @Transactional
    public void deleteResponse(String id) {
        TicketResponse response = getResponseById(id);
        ticketResponseRepository.delete(response);
    }
}
