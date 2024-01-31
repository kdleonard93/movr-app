package io.roach.movrapi.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import io.roach.movrapi.dto.MessagesDTO;
import io.roach.movrapi.dto.UserDTO;
import io.roach.movrapi.dto.UserResponseDTO;
import io.roach.movrapi.entity.User;
import io.roach.movrapi.exception.NotFoundException;
import io.roach.movrapi.exception.UserAlreadyExistsException;
import io.roach.movrapi.service.UserService;
import static io.roach.movrapi.util.Constants.MSG_DELETED_EMAIL;
import org.modelmapper.ModelMapper;

/**
 * REST Controller to manage user activities
 */

@RestController
@RequestMapping("/api")
public class UserController {

    private static final ModelMapper modelMapper = new ModelMapper();

    private UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Registers a new user (add a User entity).
     *
     * @param userDTO                      a POJO holding the json that was passed in containing the user information
     * @return                             the email of the added user
     * @throws UserAlreadyExistsException  if the email already exists
     */
    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@RequestBody @Validated UserDTO userDTO) throws UserAlreadyExistsException {

        String userEmail = userService.addUser(userDTO.getEmail(), userDTO.getFirstName(), userDTO.getLastName(),
            userDTO.getPhoneNumbers().toArray(new String[0]));
        return ResponseEntity.ok(userEmail);
    }

    /**
     * Gets a user.
     *
     * @param email                the email of the user to retrieve
     * @return                     Json with the details about the user
     * @throws NotFoundException   if the email does not exist
     */
    @GetMapping("/users")
    public ResponseEntity<UserResponseDTO> getProfile(@RequestParam String email) throws NotFoundException {

        User user = userService.getUser(email);
        return ResponseEntity.ok(toDto(user));
    }

    /**
     * Deletes a user.
     *
     * @param email                the email of the user to delete
     * @return                     a message indicated the user was deleted
     * @throws NotFoundException   if the email does not exist
     */
    @DeleteMapping("/users/delete")
    public ResponseEntity<MessagesDTO> delete(@RequestParam String email) throws NotFoundException {

        userService.delete(email);
        return ResponseEntity.ok(new MessagesDTO(MSG_DELETED_EMAIL));
    }

    /**
     * Converts the User entity object to a Data Transfer Object.
     *
     * @param user  the User entity object
     * @return      UserDTO
     */
    private UserResponseDTO toDto(User user) {
        UserDTO userDTO = modelMapper.map(user, UserDTO.class);
        return new UserResponseDTO(userDTO, null);
    }
}

