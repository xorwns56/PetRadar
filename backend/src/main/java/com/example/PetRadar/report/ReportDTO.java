package com.example.PetRadar.report;

import com.example.PetRadar.image.ImageUrls;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class ReportDTO {
    private Long id;
    private Long petMissingId;
    private Long userId;
    private String petReportPlace;
    private PetReportPoint petReportPoint;
    private String petImage;
    private String title;
    private String content;

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PetReportPoint{
        private Double lat;
        private Double lng;
    }

    /**
     * @param imageBaseUrl DB에 저장된 이미지 키 앞에 붙일 경로 (app.image.base-url)
     */
    public static ReportDTO from(Report report, String imageBaseUrl) {
        Long userId = null;
        if(report.getUser() != null){
            userId = report.getUser().getId();
        }
        PetReportPoint point = null;
        if (report.getLatitude() != null && report.getLongitude() != null) {
            point = new PetReportPoint(report.getLatitude(), report.getLongitude());
        }
        return new ReportDTO(
                report.getId(),
                report.getMissing().getId(),
                userId,
                report.getPetReportPlace(),
                point,
                ImageUrls.of(report.getPetImage(), imageBaseUrl),
                report.getTitle(),
                report.getContent()
        );
    }
}
