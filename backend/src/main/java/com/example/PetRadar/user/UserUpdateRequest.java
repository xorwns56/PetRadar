package com.example.PetRadar.user;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 회원 정보 수정 요청.
 *
 * 회원가입 본문(AuthDTO)을 그대로 쓰던 때는 가입용 검증기가 그대로 돌아
 * 비밀번호가 반드시 있어야 했다. 화면은 "바꾸지 않으려면 비워두세요"라고
 * 안내하는데 서버는 필수로 받아, 연락처만 고칠 방법이 없었다.
 *
 * 수정은 가입과 규칙이 다르다 — 보낸 것만 고치고, 안 보낸 것은 놔둔다.
 */
@Getter
@Setter
@NoArgsConstructor
public class UserUpdateRequest {

    private String hp;

    /** 비어 있으면 비밀번호를 바꾸지 않는다 */
    private String newPw;

    /** 비밀번호를 바꿀 때만 필요하다. 연락처만 고치는 데 현재 비밀번호를 물을 이유가 없다 */
    private String currentPw;

    public boolean wantsPasswordChange() {
        return newPw != null && !newPw.isBlank();
    }
}
