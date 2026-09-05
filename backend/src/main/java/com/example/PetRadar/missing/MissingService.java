package com.example.PetRadar.missing;

import com.example.PetRadar.image.ImageStorageService;
import com.example.PetRadar.notification.NotificationService;
import com.example.PetRadar.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MissingService {
    private final MissingRepository missingRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final ImageStorageService imageStorageService;

    @Value("${app.image.base-url}")
    private String imageBaseUrl;

    public List<MissingDTO> getMissingList(String searchInput, Sort sort) {
        return missingRepository.findByTitleContainingIgnoreCase(searchInput, sort).stream()
                .map(missing -> MissingDTO.from(missing, imageBaseUrl))
                .collect(Collectors.toList());
    }

    public List<MissingDTO> getMissingList(Long userId, Sort sort){
        return missingRepository.findByUserIdWithUser(userId, sort).stream()
                .map(missing -> MissingDTO.from(missing, imageBaseUrl))
                .collect(Collectors.toList());
    }

    public MissingDTO getMissingDetail(Long id) {
        Missing missing = missingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 ID의 게시글이 없습니다."));
        return MissingDTO.from(missing, imageBaseUrl);
    }

    public void createMissing(long userId, Missing missing, MultipartFile image) {
        missing.setUser(userRepository.getReferenceById(userId));
        // 이미지는 파일로 저장하고 DB에는 키만 남긴다
        missing.setPetImage(imageStorageService.store(image));
        missingRepository.save(missing);
        notificationService.createNotificationToAllUsers(userId,"missing", missing.getId());
    }

    public void updateMissing(Long id, Missing updatedMissing, long userId, MultipartFile image) {
        Missing existingMissing = missingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Missing post not found."));
        if (!existingMissing.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("You are not authorized to update this post.");
        }
        existingMissing.setPetName(updatedMissing.getPetName());
        existingMissing.setPetType(updatedMissing.getPetType());
        existingMissing.setPetGender(updatedMissing.getPetGender());
        existingMissing.setPetBreed(updatedMissing.getPetBreed());
        existingMissing.setPetAge(updatedMissing.getPetAge());
        existingMissing.setPetMissingDate(updatedMissing.getPetMissingDate());
        existingMissing.setPetMissingPlace(updatedMissing.getPetMissingPlace());
        existingMissing.setLatitude(updatedMissing.getLatitude());
        existingMissing.setLongitude(updatedMissing.getLongitude());
        // 새 이미지를 올린 경우에만 교체하고, 교체 시 이전 파일은 지운다
        if (image != null && !image.isEmpty()) {
            String previousKey = existingMissing.getPetImage();
            existingMissing.setPetImage(imageStorageService.store(image));
            imageStorageService.delete(previousKey);
        }
        existingMissing.setTitle(updatedMissing.getTitle());
        existingMissing.setContent(updatedMissing.getContent());
        missingRepository.save(existingMissing);
    }

    public void deleteMissing(Long missingId, Long userId) {
        Missing missing = missingRepository.findById(missingId)
                .orElseThrow(() -> new IllegalArgumentException("Missing report not found."));
        if (!missing.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("You are not authorized to delete this post.");
        }
        // 글이 지워지면 이미지 파일도 함께 정리한다
        imageStorageService.delete(missing.getPetImage());
        missingRepository.delete(missing);
    }
}
