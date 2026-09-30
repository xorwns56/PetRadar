package com.example.PetRadar.missing;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
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
 *
 * 길이 제한은 제품 규칙이 아니라 컬럼 크기에 맞춘 것이다. 없을 때는 긴 값이
 * MySQL의 데이터 절단 오류로 올라가 400이 아닌 500이 나갔고, 화면에는
 * "일시적인 문제가 발생했습니다"만 떠서 무엇을 줄여야 하는지 알 수 없었다.
 */
@Getter
@Setter
@NoArgsConstructor
public class MissingRequest {

    /** varchar(255) 컬럼의 상한 */
    private static final int MAX_LINE = 255;

    /**
     * 본문 상한. content는 TEXT(65,535바이트) 컬럼이다.
     * 한글은 UTF-8에서 글자당 3바이트라 21,845자쯤에서 넘치므로 그 아래로 둔다.
     */
    private static final int MAX_BODY = 20000;

    @NotBlank(message = "반려동물 이름을 입력해주세요.")
    @Size(max = MAX_LINE, message = "반려동물 이름은 {max}자까지 입력할 수 있습니다.")
    private String petName;

    // 아래 네 개는 화면에서 고르는 값이라 길이를 넘길 일이 없다.
    // 그래도 걸어 두는 이유는 폼을 거치지 않은 요청까지 500이 아닌 400으로
    // 돌려주기 위해서다 (어떤 값이 허용되는지까지는 아직 보지 않는다)
    @NotBlank(message = "종류를 선택해주세요.")
    @Size(max = MAX_LINE, message = "종류 값이 올바르지 않습니다.")
    private String petType;

    @NotBlank(message = "성별을 선택해주세요.")
    @Size(max = MAX_LINE, message = "성별 값이 올바르지 않습니다.")
    private String petGender;

    // 품종은 선택 항목이다
    @Size(max = MAX_LINE, message = "품종은 {max}자까지 입력할 수 있습니다.")
    private String petBreed;

    @NotBlank(message = "출생년도를 선택해주세요.")
    @Size(max = MAX_LINE, message = "출생년도 값이 올바르지 않습니다.")
    private String petAge;

    @NotBlank(message = "실종일자를 입력해주세요.")
    @Size(max = MAX_LINE, message = "실종일자 값이 올바르지 않습니다.")
    private String petMissingDate;

    // 실종장소는 지도에서 좌표(latitude/longitude)로 찍고, 주소 문자열은
    // 아직 화면에 입력칸이 없어 늘 빈 값으로 온다. 필수로 걸면 등록이 막힌다
    //
    // 다만 아예 빠뜨리고 보내면 null이 되는데, missing.pet_missing_place는
    // NOT NULL이라 INSERT에서 터져 400이 아닌 500이 나갔다. applyTo에서 ""로 맞춘다
    @Size(max = MAX_LINE, message = "실종장소는 {max}자까지 입력할 수 있습니다.")
    private String petMissingPlace;

    private Double latitude;
    private Double longitude;

    /** 실종 지점의 관할 지자체. 화면이 좌표에서 구해 함께 보낸다 */
    @Size(max = MAX_LINE, message = "지역 이름은 {max}자까지 입력할 수 있습니다.")
    private String region;

    @NotBlank(message = "제목을 입력해주세요.")
    @Size(max = MAX_LINE, message = "제목은 {max}자까지 입력할 수 있습니다.")
    private String title;

    @NotBlank(message = "내용을 입력해주세요.")
    @Size(max = MAX_BODY, message = "내용은 {max}자까지 입력할 수 있습니다.")
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
        /* 선택 항목이지만 컬럼은 NOT NULL이라 null을 그대로 넘기면 INSERT가 깨진다.
           컬럼을 nullable로 푸는 대신 여기서 맞추는 이유는 ddl-auto=update가
           이미 만들어진 컬럼의 제약을 바꾸지 않아서다 — 새로 뜬 DB만 풀리고
           운영 DB는 그대로 남아 두 곳이 다르게 동작한다 */
        missing.setPetMissingPlace(petMissingPlace == null ? "" : petMissingPlace);
        missing.setLatitude(latitude);
        missing.setLongitude(longitude);
        missing.setRegion(region);
        missing.setTitle(title);
        missing.setContent(content);
    }
}
