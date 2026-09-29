package com.example.PetRadar.notification;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class NotificationDTO {
    private Long id;
    private String receiverId;
    private String senderId;
    private String postType;
    private Long postId;

    /**
     * 알림 한 줄에 띄울 최소 정보. 보호소 알림에서만 채워진다.
     *
     * 알림을 보낼 당시의 내용을 베껴 두지 않고 조회할 때 찾아 붙인다.
     * 입양·반환되면 공공 목록에서 빠지는데, 그때 비어 있는 것 자체가
     * "이미 나갔다"는 신호가 된다.
     */
    private Preview preview;

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Preview {
        private String breed;
        private String orgNm;
        private String thumbnailUrl;
    }

    public static NotificationDTO from(Notification notification) {
        return from(notification, null);
    }

    public static NotificationDTO from(Notification notification, Preview preview) {
        String senderId = null;
        if (notification.getSender() != null) {
            senderId = notification.getSender().getLoginId();
        }
        return new NotificationDTO(
                notification.getId(),
                notification.getReceiver().getLoginId(),
                senderId,
                notification.getPostType(),
                notification.getPostId(),
                preview
        );
    }
}
