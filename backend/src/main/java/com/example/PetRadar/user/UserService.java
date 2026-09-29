package com.example.PetRadar.user;

import com.example.PetRadar.auth.AuthDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.regex.Pattern;
import com.example.PetRadar.global.error.NotFoundException;
import com.example.PetRadar.global.error.InvalidRequestException;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private static final String HP_REGEX = "^01[0-9]{1}-\\d{3,4}-\\d{4}$";
    private static final String PW_REGEX = "^(?=.*[a-zA-Z])(?=.*\\d)(?=.*[^\\w\\s]).{8,}$";

    /** 가입은 모든 값이 있어야 한다 */
    private void validateUserRegistration(AuthDTO authDTO) {
        validateHp(authDTO.getHp());
        if (authDTO.getPw() == null || authDTO.getPw().isEmpty()) {
            throw new InvalidRequestException("비밀번호를 입력해주세요.");
        }
        validatePassword(authDTO.getPw());
    }

    private void validateHp(String hp) {
        if (hp == null || hp.isBlank()) {
            throw new InvalidRequestException("휴대폰 번호를 입력해주세요.");
        }
        if (!Pattern.matches(HP_REGEX, hp)) {
            throw new InvalidRequestException("유효한 휴대폰 번호 형식이 아닙니다.");
        }
    }

    private void validatePassword(String pw) {
        if (!Pattern.matches(PW_REGEX, pw)) {
            // 문구가 규칙과 어긋나 있었다. 정규식은 영문(대소문자 구분 없이) 1자,
            // 숫자 1자, 특수문자 1자를 요구한다
            throw new InvalidRequestException(
                    "비밀번호는 8자 이상이며 영문, 숫자, 특수문자를 각각 1개 이상 포함해야 합니다.");
        }
    }

    @Transactional
    public void registerUser(AuthDTO authDTO) {
        // 회원가입 시 유효성 검사를 수행합니다.
        validateUserRegistration(authDTO);
        User user = new User();
        user.setLoginId(authDTO.getId());
        user.setHp(authDTO.getHp());
        user.setPwHash(passwordEncoder.encode(authDTO.getPw()));
        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public UserDTO findById(Long id) {
        return userRepository.findById(id)
                .map(user -> new UserDTO(user.getId(), user.getLoginId(), user.getHp()))
                .orElseThrow(() -> new NotFoundException("사용자를 찾을 수 없습니다."));
    }

    @Transactional(readOnly = true)
    public Optional<User> findByLoginId(String loginId) {
        return userRepository.findByLoginId(loginId);
    }

    /**
     * 회원 정보 수정.
     *
     * 가입과 규칙이 다르다. 가입은 모든 값이 있어야 하지만, 수정은 보낸 것만
     * 고치고 안 보낸 것은 놔둔다. 예전에는 가입용 검증기를 그대로 불러
     * 비밀번호가 없으면 막혔고, 그래서 연락처만 고칠 수가 없었다.
     */
    @Transactional
    public void updateUser(Long userId, UserUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("사용자를 찾을 수 없습니다."));

        validateHp(request.getHp());
        user.setHp(request.getHp());

        if (request.wantsPasswordChange()) {
            // 토큰만 쥔 사람이 비밀번호까지 바꾸지 못하게 지금 것을 확인한다
            if (request.getCurrentPw() == null || request.getCurrentPw().isBlank()) {
                throw new InvalidRequestException("현재 비밀번호를 입력해주세요.");
            }
            if (!passwordEncoder.matches(request.getCurrentPw(), user.getPwHash())) {
                throw new InvalidRequestException("현재 비밀번호가 올바르지 않습니다.");
            }
            validatePassword(request.getNewPw());
            user.setPwHash(passwordEncoder.encode(request.getNewPw()));
        }

        userRepository.save(user);
    }

    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("사용자를 찾을 수 없습니다."));
        userRepository.delete(user);
    }

}