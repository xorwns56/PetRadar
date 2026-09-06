package com.example.PetRadar.search;

import com.example.PetRadar.missing.Missing;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

/**
 * Elasticsearch 인덱스 문서 (JPA의 @Entity에 해당).
 * 검색 결과 카드를 그리는 데 필요한 값을 담아 DB를 다시 조회하지 않아도 되게 한다.
 */
@Document(indexName = "missing")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MissingDocument {

    // MySQL missing.id를 그대로 쓴다.
    // 같은 글을 여러 번 색인해도 덮어쓰기가 되고, 삭제 시 id만으로 지울 수 있다
    @Id
    private Long id;

    @Field(type = FieldType.Long)
    private Long userId;

    // text 타입: 토큰화해서 부분 일치 검색 (검색 시 fuzziness로 오타 보정)
    @Field(type = FieldType.Text)
    private String title;

    @Field(type = FieldType.Text)
    private String content;

    @Field(type = FieldType.Text)
    private String petName;

    // keyword 타입: 분석하지 않고 정확히 일치시킨다 (필터 용도)
    @Field(type = FieldType.Keyword)
    private String petType;

    @Field(type = FieldType.Keyword)
    private String petGender;

    @Field(type = FieldType.Text)
    private String petBreed;

    @Field(type = FieldType.Keyword)
    private String petAge;

    @Field(type = FieldType.Text)
    private String petMissingPlace;

    // 아래는 검색 대상이 아니라 결과 표시용이므로 색인하지 않는다 (인덱스 용량 절약)
    @Field(type = FieldType.Keyword, index = false)
    private String petMissingDate;

    // 이미지 키만 저장한다. 전체 경로는 응답을 만들 때 base-url을 붙여 조립한다
    @Field(type = FieldType.Keyword, index = false)
    private String petImage;

    public static MissingDocument from(Missing missing) {
        return MissingDocument.builder()
                .id(missing.getId())
                .userId(missing.getUser().getId())
                .title(missing.getTitle())
                .content(missing.getContent())
                .petName(missing.getPetName())
                .petType(missing.getPetType())
                .petGender(missing.getPetGender())
                .petBreed(missing.getPetBreed())
                .petAge(missing.getPetAge())
                .petMissingPlace(missing.getPetMissingPlace())
                .petMissingDate(missing.getPetMissingDate())
                .petImage(missing.getPetImage())
                .build();
    }
}
