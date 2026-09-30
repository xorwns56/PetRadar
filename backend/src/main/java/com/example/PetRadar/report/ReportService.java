package com.example.PetRadar.report;

import com.example.PetRadar.image.ImageStorageService;
import com.example.PetRadar.missing.Missing;
import com.example.PetRadar.missing.MissingRepository;
import com.example.PetRadar.notification.NotificationService;
import com.example.PetRadar.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;
import com.example.PetRadar.global.error.NotFoundException;

@Service
@RequiredArgsConstructor
public class ReportService {
    private final ReportRepository reportRepository;
    private final MissingRepository missingRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final ImageStorageService imageStorageService;

    @Value("${app.image.base-url}")
    private String imageBaseUrl;

    public ReportDTO findReportById(Long reportId) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new NotFoundException("제보를 찾을 수 없습니다."));
        return ReportDTO.from(report, imageBaseUrl);
    }

    public Page<ReportDTO> getReportsByMissingId(Long missingId, Pageable pageable) {
        Page<Report> reportPage = reportRepository.findByMissingId(missingId, pageable);
        List<ReportDTO> reportDTOList = reportPage.stream()
                .map(report -> ReportDTO.from(report, imageBaseUrl))
                .collect(Collectors.toList());
        return new PageImpl<>(reportDTOList, pageable, reportPage.getTotalElements());
    }

    /**
     * 한 사람이 남긴 제보를 전부 지운다 (회원 탈퇴).
     *
     * 남의 글에 남긴 제보는 User에도 Missing에도 매달려 있지 않아 cascade가
     * 닿지 않는다. 남겨 두면 report.user_id가 사라진 사용자를 가리켜 FK 제약에
     * 걸리고, 탈퇴가 통째로 500으로 실패했다.
     */
    @Transactional
    public void deleteAllByUser(Long userId) {
        List<Report> reports = reportRepository.findByUserId(userId);
        reports.forEach(report -> imageStorageService.delete(report.getPetImage()));
        reportRepository.deleteAll(reports);
    }

    public void createReport(Long userId, Long missingId, ReportRequest request, MultipartFile image) {
        Report report = request.toEntity();
        report.setUser(userRepository.getReferenceById(userId));
        Missing missing = missingRepository.findById(missingId)
                .orElseThrow(() -> new NotFoundException("제보할 실종 신고를 찾을 수 없습니다."));
        report.setMissing(missing);
        // 이미지는 파일로 저장하고 DB에는 키만 남긴다
        String imageKey = imageStorageService.store(image);
        report.setPetImage(imageKey);
        try {
            reportRepository.save(report);
        } catch (RuntimeException e) {
            // 제보가 남지 않으면 그 파일은 아무도 가리키지 않는 채로 볼륨에 쌓인다
            imageStorageService.delete(imageKey);
            throw e;
        }
        // 어느 제보인지 남겨야 알림에 사진과 제목을 띄울 수 있다
        notificationService.createNotificationToUser(
                userId, missing.getUser().getId(), "report", missingId,
                String.valueOf(report.getId()));
    }
}
