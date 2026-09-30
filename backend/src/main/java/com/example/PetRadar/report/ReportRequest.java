package com.example.PetRadar.report;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 목격 제보 등록 요청 본문 (multipart의 report 파트).
 *
 * 엔티티(Report)를 그대로 받으면 클라이언트가 {"user": {"id": 1}}을 실어
 * 남의 이름으로 제보를 남길 수 있다. 작성자는 인증 정보에서, 대상 글과
 * 이미지는 서버가 정하고, 여기서는 내용만 받는다.
 */
@Getter
@Setter
@NoArgsConstructor
public class ReportRequest {

    /** varchar(255) 컬럼의 상한 */
    private static final int MAX_LINE = 255;

    /** 본문은 TEXT(65,535바이트) 컬럼이다. 한글은 글자당 3바이트라 그 아래로 둔다 */
    private static final int MAX_BODY = 20000;

    @NotBlank(message = "제목을 입력해주세요.")
    @Size(max = MAX_LINE, message = "제목은 {max}자까지 입력할 수 있습니다.")
    private String title;

    @NotBlank(message = "내용을 입력해주세요.")
    @Size(max = MAX_BODY, message = "내용은 {max}자까지 입력할 수 있습니다.")
    private String content;

    @Size(max = MAX_LINE, message = "발견장소는 {max}자까지 입력할 수 있습니다.")
    private String petReportPlace;
    private Double latitude;
    private Double longitude;

    public Report toEntity() {
        Report report = new Report();
        report.setTitle(title);
        report.setContent(content);
        report.setPetReportPlace(petReportPlace);
        report.setLatitude(latitude);
        report.setLongitude(longitude);
        return report;
    }
}
