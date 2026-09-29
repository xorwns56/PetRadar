package com.example.PetRadar.notification;

import com.example.PetRadar.user.User;
import com.example.PetRadar.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;
import com.example.PetRadar.global.error.NotFoundException;
import com.example.PetRadar.global.error.ForbiddenException;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate simpMessagingTemplate;
    private final ShelterPreviewProvider shelterPreviewProvider;

    public void createNotificationToUser(Long senderId, Long receiverId, String postType, Long postId) {
        createNotificationToUser(senderId, receiverId, postType, postId, null);
    }

    /**
     * @param targetRef 이 알림을 부른 대상(보호소 알림의 유기번호).
     *                  화면이 "어떤 아이 때문인지"를 보여주려면 필요하다
     */
    public void createNotificationToUser(Long senderId, Long receiverId, String postType, Long postId, String targetRef) {
        User sender = null;
        if (senderId != null) {
            sender = userRepository.findById(senderId)
                    .orElse(null);
        }
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new NotFoundException("알림을 받을 사용자를 찾을 수 없습니다."));
        Notification notification = new Notification();
        notification.setSender(sender);
        notification.setReceiver(receiver);
        notification.setPostType(postType);
        notification.setPostId(postId);
        notification.setTargetRef(targetRef);
        notificationRepository.save(notification);
        simpMessagingTemplate.convertAndSendToUser(String.valueOf(receiverId), "/queue/notification", NotificationDTO.from(notification));
    }

    @Async
    public void createNotificationToAllUsers(Long senderId, String postType, Long postId) {
        List<User> allUsers = userRepository.findAll();
        for (User user : allUsers) {
            if(user.getId().equals(senderId)) continue;
            createNotificationToUser(senderId, user.getId(), postType, postId);
        }
    }

    /**
     * 보호소 알림에는 어떤 아이인지 요약을 붙여 내려준다.
     * 실종자가 가장 빨리 판단하는 건 사진이라, 눌러 들어가지 않고도
     * 아닌 것을 걸러낼 수 있어야 한다.
     */
    public List<NotificationDTO> findByReceiverId(Long receiverId) {
        return notificationRepository.findByReceiverIdOrderByCreatedAtDesc(receiverId).stream()
                .map(n -> NotificationDTO.from(n, previewOf(n)))
                .collect(Collectors.toList());
    }

    private NotificationDTO.Preview previewOf(Notification notification) {
        if (!"shelter".equals(notification.getPostType()) || notification.getTargetRef() == null) {
            return null;
        }
        // 이미 나간 아이는 공공 목록에 없다. 그때는 요약 없이 기본 문구로 둔다
        return shelterPreviewProvider.find(notification.getTargetRef()).orElse(null);
    }

    public void deleteNotification(Long receiverId, Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new NotFoundException("알림을 찾을 수 없습니다."));
        if (!notification.getReceiver().getId().equals(receiverId)) {
            throw new ForbiddenException("본인에게 온 알림만 지울 수 있습니다.");
        }
        notificationRepository.delete(notification);
    }


}
