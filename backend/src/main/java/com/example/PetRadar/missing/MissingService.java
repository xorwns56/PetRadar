package com.example.PetRadar.missing;

import com.example.PetRadar.image.ImageStorageService;
import com.example.PetRadar.notification.NotificationService;
import com.example.PetRadar.search.MissingSearchService;
import com.example.PetRadar.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;
import com.example.PetRadar.global.error.NotFoundException;
import com.example.PetRadar.global.error.ForbiddenException;

@Service
@RequiredArgsConstructor
public class MissingService {
    private final MissingRepository missingRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final ImageStorageService imageStorageService;
    private final MissingSearchService searchService;

    @Value("${app.image.base-url}")
    private String imageBaseUrl;

    public Page<MissingDTO> getMissingList(String searchInput, Pageable pageable) {
        return missingRepository.findByTitleContainingIgnoreCase(searchInput, pageable)
                .map(missing -> MissingDTO.from(missing, imageBaseUrl));
    }

    /**
     * 지도가 쓸 전체 목록.
     *
     * 지도는 화면에 들어오는 것을 스스로 골라 그리므로 페이지로 자르면
     * 마커가 임의로 빠진다. 대신 좌표가 있는 글만 넘겨 쓸데없는 양을 줄인다.
     * 글이 크게 늘면 이 자리를 "보이는 범위" 질의로 바꿔야 한다.
     */
    public List<MissingDTO> getMissingPoints() {
        return missingRepository.findAllWithUser().stream()
                .filter(m -> m.getLatitude() != null && m.getLongitude() != null)
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
                .orElseThrow(() -> new NotFoundException("실종 신고를 찾을 수 없습니다."));
        return MissingDTO.from(missing, imageBaseUrl);
    }

    public void createMissing(long userId, MissingRequest request, MultipartFile image) {
        Missing missing = request.toEntity();
        missing.setUser(userRepository.getReferenceById(userId));
        // 이미지는 파일로 저장하고 DB에는 키만 남긴다
        missing.setPetImage(imageStorageService.store(image));
        missingRepository.save(missing);
        searchService.index(missing);
        notificationService.createNotificationToAllUsers(userId,"missing", missing.getId());
    }

    public void updateMissing(Long id, MissingRequest request, long userId, MultipartFile image) {
        Missing existingMissing = missingRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("실종 신고를 찾을 수 없습니다."));
        if (!existingMissing.getUser().getId().equals(userId)) {
            throw new ForbiddenException("본인이 등록한 신고만 수정할 수 있습니다.");
        }
        request.applyTo(existingMissing);
        // 새 이미지를 올린 경우에만 교체하고, 교체 시 이전 파일은 지운다
        if (image != null && !image.isEmpty()) {
            String previousKey = existingMissing.getPetImage();
            existingMissing.setPetImage(imageStorageService.store(image));
            imageStorageService.delete(previousKey);
        }
        missingRepository.save(existingMissing);
        searchService.index(existingMissing);
    }

    public void deleteMissing(Long missingId, Long userId) {
        Missing missing = missingRepository.findById(missingId)
                .orElseThrow(() -> new NotFoundException("실종 신고를 찾을 수 없습니다."));
        if (!missing.getUser().getId().equals(userId)) {
            throw new ForbiddenException("본인이 등록한 신고만 삭제할 수 있습니다.");
        }
        // 글이 지워지면 이미지 파일도 함께 정리한다
        imageStorageService.delete(missing.getPetImage());
        missingRepository.delete(missing);
        searchService.delete(missingId);
    }
}
