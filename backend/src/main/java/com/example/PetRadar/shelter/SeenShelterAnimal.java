package com.example.PetRadar.shelter;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * 한 번이라도 본 적 있는 유기동물.
 *
 * 공공 API는 "지금 보호 중인 목록"만 준다. 어제와 비교해야 오늘 새로 들어온
 * 개체를 알 수 있고, 그래야 신고자에게 알릴 거리가 생긴다.
 *
 * 개체 정보를 그대로 베끼지는 않는다. 화면에 보여줄 내용은 공공 API에서
 * 매번 새로 받으므로(입양·반환되면 저절로 빠진다) 여기엔 "봤다"는 사실만 남긴다.
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "seen_shelter_animal")
public class SeenShelterAnimal {

    /** 공공 API의 유기번호. 전국에서 고유하다 */
    @Id
    @Column(name = "desertion_no", length = 32)
    private String desertionNo;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime firstSeenAt;

    public SeenShelterAnimal(String desertionNo) {
        this.desertionNo = desertionNo;
    }
}
