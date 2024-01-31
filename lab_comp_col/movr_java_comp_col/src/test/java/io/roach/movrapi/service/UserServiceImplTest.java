package io.roach.movrapi.service;

import java.util.Arrays;
import java.util.Optional;

import io.roach.movrapi.dao.UserRepository;
import io.roach.movrapi.entity.User;
import io.roach.movrapi.exception.NotFoundException;
import io.roach.movrapi.exception.UserAlreadyExistsException;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.MockitoAnnotations;
import org.modelmapper.ModelMapper;

/**
 * Unit Tests for UserServiceImpl.class
 */


public class UserServiceImplTest {

    private static final String TEST_EMAIL_EXISTING = "existing@test.com";
    private static final String TEST_EMAIL = "test@test.com";
    private static final String TEST_FNAME = "John";
    private static final String TEST_LNAME = "Smith";
    private static final String[] PHONE_ARRAY = { "404-555-1212" , "678-123-4567" };

    @Mock
    private UserRepository userRepository;

    private ModelMapper modelMapper = new ModelMapper();

    private UserService userService;

    @BeforeEach
    public void init() {

        MockitoAnnotations.initMocks(this);
        userService = new UserServiceImpl(userRepository);
        when(userRepository.findById(TEST_EMAIL_EXISTING)).thenReturn(Optional.of(dummyUser(TEST_EMAIL_EXISTING)));
        when(userRepository.save(any(User.class))).thenReturn(dummyUser(TEST_EMAIL));
    }

    @Test()
    public void testAdd() throws UserAlreadyExistsException {

        ArgumentCaptor<User> userArgumentCaptor =
            ArgumentCaptor.forClass(User.class);

        userService.addUser(TEST_EMAIL, TEST_FNAME, TEST_LNAME, PHONE_ARRAY);
        verify(userRepository).save(userArgumentCaptor.capture());
        User user= userArgumentCaptor.getValue();
        assertEquals(TEST_EMAIL, user.getEmail());
        assertEquals(TEST_FNAME, user.getFirstName());
        assertEquals(TEST_LNAME, user.getLastName());
        String[] phones = user.getPhoneNumbers();
        assertTrue(Arrays.equals(PHONE_ARRAY, phones));
    }


    @Test
    public void testExisting()  {

        assertThrows(UserAlreadyExistsException.class, () -> {
            userService.addUser(TEST_EMAIL_EXISTING, TEST_FNAME, TEST_LNAME, PHONE_ARRAY);
        });
    }

    @Test
    public void testGet() throws NotFoundException {
        assertThrows(NotFoundException.class, () -> {
            userService.getUser(TEST_EMAIL);
        });
        User user = userService.getUser(TEST_EMAIL_EXISTING);
        assertEquals(TEST_EMAIL_EXISTING, user.getEmail());
    }

    @Test
    public void testRemove() throws NotFoundException {

        ArgumentCaptor<User> userArgumentCaptor =
            ArgumentCaptor.forClass(User.class);

        assertThrows(NotFoundException.class, () -> {
            userService.delete(TEST_EMAIL);
        });
        userService.delete(TEST_EMAIL_EXISTING);
        verify(userRepository).delete(userArgumentCaptor.capture());

        assertEquals(TEST_EMAIL_EXISTING, userArgumentCaptor.getValue().getEmail());
    }



    private User dummyUser(String email) {
        User user = new User();
        user.setEmail(email);
        return user;
    }
    

}
