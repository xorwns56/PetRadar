package com.example.PetRadar.image;

/**
 * DB에 저장된 이미지 키를 클라이언트가 쓸 경로로 조립한다.
 * missing, report 양쪽 DTO에서 함께 쓰므로 이미지 패키지에 둔다.
 */
public final class ImageUrls {

    private ImageUrls() {
    }

    /** 이미지가 없으면 null을 그대로 반환해 프론트의 기본 이미지가 뜨게 한다 */
    public static String of(String key, String baseUrl) {
        return (key == null || key.isBlank()) ? null : baseUrl + "/" + key;
    }
}
