package com.example.PetRadar.notification;

import com.example.PetRadar.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "notification")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 알림을 받는 사용자
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiver_id") // DB 컬럼명을 지정
    private User receiver;

    // 알림을 보낸 사용자 (sender)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id")
    private User sender;

    @Column(nullable = false)
    private String postType;

    @Column(nullable = false)
    private Long postId;

    /**
     * 이 알림을 부른 대상. 보호소 알림에서는 유기번호를 담는다.
     *
     * postId만으로는 "어느 실종 글에 온 알림"까지만 알 수 있어, 화면이
     * 어떤 아이 때문인지 보여줄 수가 없었다. 개체 정보를 여기 베껴 두지는
     * 않는다 — 입양·반환되면 공공 목록에서 빠지므로 매번 새로 찾는 편이
     * 맞고, 못 찾으면 그것대로 "이미 나갔다"는 신호가 된다.
     */
    @Column(length = 32)
    private String targetRef;

    @CreationTimestamp
    @Column(nullable = false)
    private LocalDateTime createdAt;
}