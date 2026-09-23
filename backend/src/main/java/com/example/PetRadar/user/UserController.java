package com.example.PetRadar.user;

import com.example.PetRadar.auth.AuthDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/user")
public class UserController {
    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = Long.parseLong(userDetails.getUsername());
        UserDTO userDto = userService.findById(userId);
        return ResponseEntity.ok(userDto);
    }

    @PatchMapping("/me")
    public ResponseEntity<Void> updateUser(@AuthenticationPrincipal UserDetails userDetails, @RequestBody AuthDTO authDTO) {
        // 값이 규칙에 안 맞으면 InvalidRequestException이 올라가
        // GlobalExceptionHandler가 400과 사유를 내려준다
        Long userId = Long.parseLong(userDetails.getUsername());
        userService.updateUser(userId, authDTO);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteUser(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = Long.parseLong(userDetails.getUsername());
        userService.deleteUser(userId);
        return ResponseEntity.ok().build();
    }
}
