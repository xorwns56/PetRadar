package com.example.PetRadar.image;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

/**
 * 이미지 파일을 서버 볼륨에 저장한다.
 * DB에는 여기서 반환하는 키(파일명)만 저장하고, 전체 URL은 조회 시 base-url을 붙여 조립한다.
 * 이렇게 해두면 나중에 S3 등으로 옮길 때 설정만 바꾸면 되고 DB는 손대지 않아도 된다.
 */
@Service
public class ImageStorageService {

    private final Path uploadDir;

    public ImageStorageService(@Value("${app.image.upload-dir}") String uploadDir) {
        this.uploadDir = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    @PostConstruct
    void createDirectory() {
        try {
            Files.createDirectories(uploadDir);
        } catch (IOException e) {
            throw new IllegalStateException("이미지 저장 디렉터리를 만들 수 없습니다: " + uploadDir, e);
        }
    }

    /**
     * 파일을 저장하고 키(파일명)를 반환한다. 파일이 없으면 null.
     * 원본 파일명이 겹치거나 경로 문자가 섞여 들어오는 것을 막기 위해 UUID + 확장자로만 저장한다.
     */
    public String store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return null;
        }
        String key = UUID.randomUUID() + extensionOf(file.getOriginalFilename());
        try (InputStream in = file.getInputStream()) {
            Files.copy(in, uploadDir.resolve(key), StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new IllegalStateException("이미지 저장에 실패했습니다.", e);
        }
        return key;
    }

    /** 저장된 이미지를 삭제한다. 이미 없으면 조용히 넘어간다. */
    public void delete(String key) {
        if (!StringUtils.hasText(key)) {
            return;
        }
        try {
            // 키에 경로 구분자가 섞여 상위 디렉터리로 빠져나가지 못하게 파일명만 사용
            Files.deleteIfExists(uploadDir.resolve(Paths.get(key).getFileName()));
        } catch (IOException e) {
            // 파일 삭제 실패가 글 삭제 자체를 막을 이유는 없다
        }
    }

    private String extensionOf(String originalFilename) {
        String ext = StringUtils.getFilenameExtension(originalFilename);
        return ext == null ? "" : "." + ext.toLowerCase();
    }
}
