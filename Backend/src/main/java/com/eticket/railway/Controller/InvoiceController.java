package com.eticket.railway.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eticket.railway.DTO.TicketDTO;
import com.eticket.railway.Entity.Invoice;
import com.eticket.railway.Exception.NoDataFoundException;
import com.eticket.railway.Service.InvoiceService;

@RestController
@RequestMapping("/api")
public class InvoiceController {

    @Autowired
    private InvoiceService invoiceService;

    @PostMapping("/booking/invoice/create")
    public ResponseEntity<?> createInvoice(@RequestBody List<TicketDTO> request) {
        try {
            Invoice invoice = invoiceService.createInvoice(request);
            return ResponseEntity.ok(invoice);        
        } catch (NoDataFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("BookingId not found");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Something went wrong");
        }
        
    }
    @PostMapping("/booking/invoice/save")
    public ResponseEntity<?> saveInvoice(@RequestBody Invoice invoice) {
        try {
            invoice = invoiceService.saveInvoice(invoice);
            return ResponseEntity.ok(invoice);        
        } catch (NoDataFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("could not save invoice");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Something went wrong");
        }
        
    }
}
