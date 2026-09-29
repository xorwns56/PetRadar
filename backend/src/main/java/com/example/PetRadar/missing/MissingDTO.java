package com.example.PetRadar.missing;

import com.example.PetRadar.image.ImageUrls;
import lombok.*;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class MissingDTO {
    private Long id;
    private Long userId;
    private String petName;
    private String petType;
    private String petGender;
    private String petBreed;
    private String petAge;
    private String petMissingDate;
    private String petMissingPlace;
    /** 실종 지점의 관할 지자체. 화면이 좌표에서 다시 구하지 않아도 되게 실어 보낸다 */
    private String region;
    private PetMissingPoint petMissingPoint;
    private String petImage;
    private String title;
    private String content;

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PetMissingPoint{
        private Double lat;
        private Double lng;
    }

    /**
     * @param imageBaseUrl DB에 저장된 이미지 키 앞에 붙일 경로 (app.image.base-url)
     */
    public static MissingDTO from(Missing missing, String imageBaseUrl) {
        PetMissingPoint point = null;
        if (missing.getLatitude() != null && missing.getLongitude() != null) {
            point = new PetMissingPoint(missing.getLatitude(), missing.getLongitude());
        }
        return new MissingDTO(
                missing.getId(),
                missing.getUser().getId(),
                missing.getPetName(),
                missing.getPetType(),
                missing.getPetGender(),
                missing.getPetBreed(),
                missing.getPetAge(),
                missing.getPetMissingDate(),
                missing.getPetMissingPlace(),
                missing.getRegion(),
                point,
                ImageUrls.of(missing.getPetImage(), imageBaseUrl),
                missing.getTitle(),
                missing.getContent()
        );
    }
}

