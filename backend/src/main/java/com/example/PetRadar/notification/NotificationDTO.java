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
     * 알림 한 줄에 띄울 최소 정보.
     *
     * 알림을 보낼 당시의 내용을 베껴 두지 않고 조회할 때 찾아 붙인다.
     * 대상이 사라지면(보호동물이 입양되거나 제보가 지워지면) 저절로 비는데,
     * 비어 있는 것 자체가 "이미 없다"는 신호가 된다.
     */
    private Preview preview;

    /**
     * 종류마다 담는 것이 다르다. 문구는 화면이 만들므로 여기엔 값만 둔다.
     *
     *   보호소  title=품종        subtitle=관할 지자체
     *   제보    title=제보 제목    subtitle=어느 아이에 대한 제보인지
     */
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Preview {
        private String title;
        private String subtitle;
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
