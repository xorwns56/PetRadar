package com.example.PetRadar.notification;

import java.util.Optional;

/**
 * 보호소 알림에 붙일 요약을 찾아 준다.
 *
 * 알림 도메인이 보호소 도메인을 직접 알지 않도록 사이에 둔다.
 * 알림은 "어떤 대상인지"만 기억하고, 그 대상이 무엇인지는 보호소 쪽이 안다.
 */
public interface ShelterPreviewProvider {

    /** 이미 입양·반환된 개체는 공공 목록에 없으므로 비어 있을 수 있다 */
    Optional<NotificationDTO.Preview> find(String desertionNo);
}
