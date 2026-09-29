package com.example.PetRadar.missing;

import com.example.PetRadar.report.Report;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import com.example.PetRadar.user.User;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "missing")
public class Missing{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToMany(mappedBy = "missing", cascade = CascadeType.REMOVE, orphanRemoval = true)
    private List<Report> reports = new ArrayList<>();

    @Column(nullable = false)
    private String petName;

    @Column(nullable = false)
    private String petType;

    @Column(nullable = false)
    private String petGender;

    private String petBreed;

    @Column(nullable = false)
    private String petAge;

    @Column(nullable = false)
    private String petMissingDate;

    @Column(nullable = false)
    private String petMissingPlace;

    /**
     * 실종 지점의 관할 지자체 ("서울특별시 구로구").
     *
     * 좌표를 지역 이름으로 바꾸는 일은 카카오 SDK를 쓸 수 있는 화면이 한다.
     * 서버에는 지오코더가 없는데, 보호동물과 맞춰보려면 지역이 필요하다 —
     * 공공 API는 발견 지점의 좌표를 주지 않고 관할 지자체만 준다.
     */
    private String region;

    @Column(columnDefinition = "DECIMAL(10, 8)")
    private Double latitude;

    @Column(columnDefinition = "DECIMAL(11, 8)")
    private Double longitude;

    // 이미지 파일의 키(파일명)만 저장한다. 전체 URL은 DTO 변환 시 base-url을 붙여 만든다
    private String petImage;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}