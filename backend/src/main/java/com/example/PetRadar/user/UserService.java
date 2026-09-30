package com.example.PetRadar.user;

import com.example.PetRadar.auth.AuthDTO;
import com.example.PetRadar.missing.MissingService;
import com.example.PetRadar.report.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
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
    // 탈퇴할 때 각 도메인이 남긴 것(제보 행, 검색 색인, 업로드 파일)을 치우게 한다
    private final MissingService missingService;
    private final ReportService reportService;

    private static final String HP_REGEX = "^01[0-9]{1}-\\d{3,4}-\\d{4}$";
    private static final String PW_REGEX = "^(?=.*[a-zA-Z])(?=.*\\d)(?=.*[^\\w\\s]).{8,}$";

    /** 화면(RegisterForm)의 규칙과 같아야 한다. 한쪽만 고치면 통과한 값이 반대편에서 막힌다 */
    private static final String LOGIN_ID_REGEX = "^[a-z0-9]+$";
    private static final int LOGIN_ID_MAX_LENGTH = 20;

    /** 가입은 모든 값이 있어야 한다 */
    private void validateUserRegistration(AuthDTO authDTO) {
        validateLoginId(authDTO.getId());
        validateHp(authDTO.getHp());
        if (authDTO.getPw() == null || authDTO.getPw().isEmpty()) {
            throw new InvalidRequestException("비밀번호를 입력해주세요.");
        }
        validatePassword(authDTO.getPw());
    }

    /**
     * 아이디 검증.
     *
     * 예전에는 서버가 아이디를 전혀 보지 않아 화면을 거치지 않은 요청이면
     * 빈 아이디로도 가입됐다. login_id는 unique지만 NULL은 여러 개가 허용되니
     * DB도 막아주지 않는다. 그렇게 만들어진 계정은 로그인할 방법이 없다.
     */
    private void validateLoginId(String loginId) {
        if (loginId == null || loginId.isBlank()) {
            throw new InvalidRequestException("아이디를 입력해주세요.");
        }
        if (!Pattern.matches(LOGIN_ID_REGEX, loginId)) {
            throw new InvalidRequestException("아이디는 영문 소문자와 숫자만 사용할 수 있습니다.");
        }
        if (loginId.length() > LOGIN_ID_MAX_LENGTH) {
            throw new InvalidRequestException(
                    "아이디는 " + LOGIN_ID_MAX_LENGTH + "자까지 입력할 수 있습니다.");
        }
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
        if (userRepository.findByLoginId(authDTO.getId()).isPresent()) {
            throw new InvalidRequestException("이미 사용 중인 아이디입니다.");
        }
        User user = new User();
        user.setLoginId(authDTO.getId());
        user.setHp(authDTO.getHp());
        user.setPwHash(passwordEncoder.encode(authDTO.getPw()));
        try {
            userRepository.save(user);
        } catch (DataIntegrityViolationException e) {
            // 위 확인과 INSERT 사이에 같은 아이디가 들어온 경우(동시 가입).
            // 받아주지 않으면 unique 제약 위반이 그대로 올라가 500이 나간다
            throw new InvalidRequestException("이미 사용 중인 아이디입니다.");
        }
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

    /**
     * 회원 탈퇴.
     *
     * User의 cascade만으로는 두 가지가 정리되지 않았다.
     *   - 남의 글에 남긴 제보: User에도 Missing에도 매달려 있지 않아 행이 남고,
     *     report.user_id가 사라진 사용자를 가리켜 FK 제약에 걸렸다.
     *     제보를 한 번이라도 한 사람은 탈퇴가 500으로 막혀 있었다
     *   - 내가 쓴 실종 글의 검색 색인과 이미지 파일: cascade는 DB 행만 지운다.
     *     지워진 글이 검색 결과에는 계속 떠서 눌러 들어가면 404가 났다
     *
     * 그래서 각 도메인에 "그쪽이 남긴 것"을 먼저 치우게 하고 마지막에 계정을 지운다.
     */
    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("사용자를 찾을 수 없습니다."));
        reportService.deleteAllByUser(userId);
        missingService.deleteAllByUser(userId);
        userRepository.delete(user);
    }

}