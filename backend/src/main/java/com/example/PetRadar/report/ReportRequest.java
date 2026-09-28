package com.example.PetRadar.report;

import jakarta.validation.constraints.NotBlank;
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

    @NotBlank(message = "제목을 입력해주세요.")
    private String title;

    @NotBlank(message = "내용을 입력해주세요.")
    private String content;

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
