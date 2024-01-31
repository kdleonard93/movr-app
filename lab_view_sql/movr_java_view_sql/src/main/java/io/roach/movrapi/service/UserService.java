package io.roach.movrapi.service;

import io.roach.movrapi.entity.User;
import io.roach.movrapi.exception.NotFoundException;
import io.roach.movrapi.exception.UserAlreadyExistsException;

/**
 * Service to handle basic CRUD functions for user entity
 */

public interface UserService {

    User getUser(String email) throws NotFoundException;
    String addUser(String email, String firstName, String lastName, String[] phoneNumbers) throws UserAlreadyExistsException;
    void delete(String email) throws NotFoundException;
}
