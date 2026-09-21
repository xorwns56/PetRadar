package com.example.PetRadar.missing;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 실종 신고 등록·수정 요청 본문 (multipart의 missing 파트).
 *
 * 엔티티(Missing)를 그대로 @RequestPart로 받으면 클라이언트가 보낸 JSON이
 * 엔티티 필드에 그대로 바인딩된다. id를 실어 보내면 save()가 등록이 아니라
 * 남의 글 수정이 되고, user·createdAt처럼 서버가 정해야 할 값까지 덮어쓸 수 있다.
 * 받아도 되는 값만 여기에 추려 둔다.
 */
@Getter
@Setter
@NoArgsConstructor
public class MissingRequest {

    @NotBlank(message = "반려동물 이름을 입력해주세요.")
    private String petName;

    @NotBlank(message = "종류를 선택해주세요.")
    private String petType;

    @NotBlank(message = "성별을 선택해주세요.")
    private String petGender;

    // 품종은 선택 항목이다
    private String petBreed;

    @NotBlank(message = "출생년도를 선택해주세요.")
    private String petAge;

    @NotBlank(message = "실종일자를 입력해주세요.")
    private String petMissingDate;

    // 실종장소는 지도에서 좌표(latitude/longitude)로 찍고, 주소 문자열은
    // 아직 화면에 입력칸이 없어 늘 빈 값으로 온다. 필수로 걸면 등록이 막힌다
    private String petMissingPlace;

    private Double latitude;
    private Double longitude;

    @NotBlank(message = "제목을 입력해주세요.")
    private String title;

    @NotBlank(message = "내용을 입력해주세요.")
    private String content;

    /** 등록용. 소유자와 이미지는 서비스가 채운다 */
    public Missing toEntity() {
        Missing missing = new Missing();
        applyTo(missing);
        return missing;
    }

    /** 수정용. 사용자가 고칠 수 있는 필드만 덮어쓴다 */
    public void applyTo(Missing missing) {
        missing.setPetName(petName);
        missing.setPetType(petType);
        missing.setPetGender(petGender);
        missing.setPetBreed(petBreed);
        missing.setPetAge(petAge);
        missing.setPetMissingDate(petMissingDate);
        missing.setPetMissingPlace(petMissingPlace);
        missing.setLatitude(latitude);
        missing.setLongitude(longitude);
        missing.setTitle(title);
        missing.setContent(content);
    }
}
