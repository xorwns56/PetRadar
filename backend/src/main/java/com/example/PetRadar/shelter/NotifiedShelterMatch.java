package com.example.PetRadar.shelter;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * 이미 알린 (실종 글, 유기동물) 짝.
 *
 * 없으면 매 주기마다 같은 아이를 다시 알리게 된다. 공공 API는 개체가
 * 보호 중인 동안 계속 목록에 남아 있기 때문이다.
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(
        name = "notified_shelter_match",
        uniqueConstraints = @UniqueConstraint(columnNames = {"missing_id", "desertion_no"})
)
public class NotifiedShelterMatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "missing_id", nullable = false)
    private Long missingId;

    @Column(name = "desertion_no", nullable = false, length = 32)
    private String desertionNo;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime notifiedAt;

    public NotifiedShelterMatch(Long missingId, String desertionNo) {
        this.missingId = missingId;
        this.desertionNo = desertionNo;
    }
}
