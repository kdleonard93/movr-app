package io.roach.movrapi.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.roach.movrapi.dto.AuthenticationResponseDTO;
import io.roach.movrapi.dto.CredentialsDTO;
import io.roach.movrapi.exception.NotFoundException;
import io.roach.movrapi.service.UserService;

/**
 * REST Controller to manage login/logout activities
 * (in an actual application, these functions would provide authentication checks and other security features.)
 */

@RestController
@RequestMapping("/api")
public class AccessController {

    private UserService userService;

    @Autowired
    public AccessController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Logs in the user.
     *
     * @param credentialsDTO        a POJO holding the json (email) that was passed in
     * @return                      json indicating if the user was authenticated or not
     * @throws NotFoundException    if the passed email does not exist
     */
    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponseDTO> login(@RequestBody CredentialsDTO credentialsDTO)
        throws NotFoundException {

        userService.getUser(credentialsDTO.getEmail());
        // in a normal app, we would perform a security check before returning a token or some other security method
        AuthenticationResponseDTO authenticationResponseDTO = new AuthenticationResponseDTO();
        authenticationResponseDTO.setAuthenticated(true);
        return ResponseEntity.ok(authenticationResponseDTO);
    }

    /**
     * Logs out the user (currently does nothing but validate that the email is valid).
     *
     * @param email                 the email of the user to logout
     * @return                      "nothing"
     * @throws NotFoundException    if the passed email does not exist
     */
    @PostMapping("/logout/{email}")
    public ResponseEntity<Void> logout(@PathVariable String email) throws NotFoundException {

        userService.getUser(email);
        // in a normal app, we would invalidate a user token or something similar here, but we'll just return success
        return ResponseEntity.noContent().build();
    }


}
