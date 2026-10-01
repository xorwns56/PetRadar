package com.example.PetRadar.search;

import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import java.util.stream.Stream;

/**
 * 검색어를 MySQL boolean mode 질의로 바꾼다.
 *
 * 오타 교정을 검색 엔진이 아니라 여기서 한다. ngram은 글을 2글자씩 겹쳐 쪼개
 * 비교하는데, 그 겹침만으로 오타를 잡으려 하면 짧은 말에서 무너진다 —
 * 3글자 단어는 조각이 둘뿐이라 가운데가 틀리면 둘 다 깨지고("말치즈" ↔ "말티즈":
 * 겹침 0), 2글자는 조각이 하나라 아예 못 버틴다("시추" ↔ "시츄": 겹침 0).
 *
 * 그래서 찾는 일은 ngram이, 틀린 말을 바로잡는 일은 여기가 맡는다.
 */
final class SearchTerms {

    /** ngram_token_size 기본값. 이보다 짧은 말은 색인되지 않으므로 버린다 */
    static final int NGRAM_SIZE = 2;

    /**
     * boolean mode 연산자.
     *
     * 정제하지 않으면 사용자가 친 문자가 연산자로 해석된다. "말티즈 -중구"를 그대로
     * 넘기면 중구를 빼라는 뜻이 되어 결과가 조용히 줄어든다. 에러가 나지 않아
     * 더 위험하다.
     */
    private static final Pattern OPERATORS = Pattern.compile("[+\\-><()~*\"@]");

    /**
     * 검색어 별칭. 오타와 약칭을 표준 표기로 바꾼다.
     *
     * 편집거리로는 약칭("포메" → "포메라니안", 거리 3)을 잡을 수 없고, 바이그램
     * 겹침으로는 짧은 말의 가운데 오타를 잡을 수 없다. 사전은 둘을 같은 방식으로
     * 덮는다 — 0건이 난 검색어를 보고 한 줄씩 늘리면 된다.
     */
    private static final Map<String, String> ALIASES = Map.ofEntries(
            Map.entry("몰티즈", "말티즈"),
            Map.entry("말티스", "말티즈"),
            Map.entry("말치즈", "말티즈"),
            Map.entry("포메", "포메라니안"),
            Map.entry("포메라니언", "포메라니안"),
            Map.entry("레트리버", "리트리버"),
            Map.entry("리트리바", "리트리버"),
            Map.entry("골댕이", "리트리버"),
            Map.entry("코숏", "코리안숏헤어"),
            Map.entry("숏헤어", "코리안숏헤어"),
            Map.entry("치와와견", "치와와"),
            Map.entry("슈나이저", "슈나우저")
    );

    /**
     * 같이 찾아야 하는 표기들.
     *
     * 별칭과 다르다. 별칭은 틀린 말을 맞는 말로 바꾸는 것이고, 이쪽은 **둘 다 맞는 말**이라
     * 한쪽으로 모을 수 없는 경우다. 신고 폼은 "진도견"으로 저장하는데 사람들은 "진돗개"라
     * 치고, 보호소 데이터는 "한국 고양이"인데 폼 선택지는 "코리안숏헤어"다. 한쪽만 찾으면
     * 나머지 글이 통째로 안 나온다.
     *
     * MySQL boolean mode의 그룹 문법으로 푼다 — +("진도견" "진돗개")는 둘 중 하나만
     * 있어도 되고, 다른 낱말과의 AND 조건은 그대로 유지된다.
     */
    private static final List<List<String>> SYNONYM_GROUPS = List.of(
            List.of("진도견", "진돗개"),
            List.of("시츄", "시추"),
            List.of("코리안숏헤어", "코리안 숏헤어", "한국 고양이"),
            List.of("웰시 코기", "웰시코기", "코기"),
            List.of("비숑 프리제", "비숑프리제", "비숑"),
            List.of("요크셔 테리어", "요크셔테리어", "요크셔"),
            List.of("믹스견", "믹스묘", "믹스")
    );

    /** 그룹의 모든 표기에서 그룹을 찾을 수 있게 펴 둔다 (방향을 손으로 적지 않는다) */
    private static final Map<String, List<String>> SYNONYMS = SYNONYM_GROUPS.stream()
            .flatMap(group -> group.stream().map(word -> Map.entry(word, group)))
            .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));

    /**
     * 교정 대상 어휘.
     *
     * 프론트의 utils/get-pet-breed.js 와 같은 값이어야 한다 — 한쪽만 고치면
     * 화면에서 고를 수 있는 품종을 서버가 모르게 된다.
     */
    private static final List<String> VOCABULARY = List.of(
            "믹스견", "말티즈", "푸들", "포메라니안", "시츄", "치와와", "요크셔 테리어",
            "닥스훈트", "진도견", "비숑 프리제", "스피츠", "시바", "웰시 코기", "리트리버",
            "보더 콜리", "비글", "슈나우저", "불독", "허스키", "사모예드", "셰퍼드",
            "한국 고양이", "믹스묘", "러시안 블루", "먼치킨", "페르시안", "샴", "벵갈",
            "스코티시폴드", "노르웨이 숲", "메인쿤", "아메리칸 쇼트헤어",
            "브리티시 쇼트헤어", "터키시 앙고라", "레그돌", "스핑크스"
    );

    /** 거리 1까지만 본다. 2로 넓히면 "시츄"와 "시바"가 같은 후보가 된다 */
    private static final int MAX_DISTANCE = 1;

    private SearchTerms() {
    }

    /**
     * 1차 질의: 낱말마다 구문 일치를 요구한다.
     *
     *   "몰티즈 중구"  → +"말티즈" +"중구"
     *   "진돗개"       → +("진도견" "진돗개")      ← 같이 찾을 표기가 있으면 묶는다
     */
    static String phrase(String input) {
        /* 두 단어짜리 표기를 먼저 통째로 본다.
           폼 선택지의 상당수가 "한국 고양이", "웰시 코기"처럼 공백을 품고 있는데,
           낱말로 쪼갠 뒤에는 사전·동의어 조회가 닿지 않는다 — "한국"과 "고양이"로
           나뉘면 그룹의 열쇠("한국 고양이")와 영영 만나지 못한다 */
        String whole = sanitized(input);
        if (SYNONYMS.containsKey(whole) || ALIASES.containsKey(whole)) {
            return group(correct(whole));
        }
        return corrected(input).map(SearchTerms::group).collect(Collectors.joining(" "));
    }

    private static String group(String term) {
        List<String> words = SYNONYMS.get(term);
        if (words == null) {
            return "+\"" + term + "\"";
        }
        return words.stream()
                .map(word -> "\"" + word + "\"")
                .collect(Collectors.joining(" ", "+(", ")"));
    }

    /**
     * 2차 질의: 낱말을 2글자씩 겹쳐 쪼개 OR로 넘긴다.
     * "몰티즈" → 몰티 티즈
     *
     * 조각 하나만 겹쳐도 결과에 들어오므로 노이즈가 섞인다. 1차가 0건일 때만 쓴다.
     * 교정을 거치지 않은 원문으로 만든다 — 교정이 실패한 말을 받아내는 그물이다.
     */
    static String bigrams(String input) {
        return terms(input).flatMap(SearchTerms::bigramsOf)
                .distinct()
                .collect(Collectors.joining(" "));
    }

    /** 교정까지 마친 낱말들 (화면에 "이렇게 찾았어요"를 띄울 때도 쓸 수 있다) */
    static Stream<String> corrected(String input) {
        return terms(input).map(SearchTerms::correct);
    }

    private static String sanitized(String input) {
        return OPERATORS.matcher(input).replaceAll(" ").trim().replaceAll("\\s+", " ");
    }

    private static Stream<String> terms(String input) {
        return Arrays.stream(sanitized(input).split(" ")).filter(t -> t.length() >= NGRAM_SIZE);
    }

    /** 별칭을 먼저 보고, 없으면 어휘 중 가장 가까운 것을 찾는다. 못 고치면 원래 말 그대로 */
    private static String correct(String term) {
        String alias = ALIASES.get(term);
        if (alias != null) {
            return alias;
        }
        return nearest(term).orElse(term);
    }

    private static Optional<String> nearest(String term) {
        return VOCABULARY.stream()
                .map(known -> Map.entry(known, distance(term, known, MAX_DISTANCE)))
                .filter(e -> e.getValue() >= 0)
                .min(Comparator.comparingInt(Map.Entry::getValue))
                .map(Map.Entry::getKey);
    }

    private static Stream<String> bigramsOf(String term) {
        return IntStream.rangeClosed(0, term.length() - NGRAM_SIZE)
                .mapToObj(i -> term.substring(i, i + NGRAM_SIZE));
    }

    /**
     * 편집거리. max를 넘으면 -1을 돌려주고 일찍 끝낸다.
     *
     * 자모까지 분해하지는 않는다. 품종명 오타로 재어 보니 음절 단위 거리와 결과가
     * 같았다 — 받침이 밀리는 특수한 오타에서만 이득이 있어 이 용도엔 과하다.
     */
    private static int distance(String a, String b, int max) {
        if (Math.abs(a.length() - b.length()) > max) {
            return -1;
        }
        int[] previous = IntStream.rangeClosed(0, b.length()).toArray();
        int[] current = new int[b.length() + 1];

        for (int i = 1; i <= a.length(); i++) {
            current[0] = i;
            int best = current[0];
            for (int j = 1; j <= b.length(); j++) {
                int substitution = previous[j - 1] + (a.charAt(i - 1) == b.charAt(j - 1) ? 0 : 1);
                current[j] = Math.min(Math.min(current[j - 1] + 1, previous[j] + 1), substitution);
                best = Math.min(best, current[j]);
            }
            if (best > max) {
                return -1;   // 이 행 전체가 이미 한계를 넘었다
            }
            int[] swap = previous;
            previous = current;
            current = swap;
        }
        return previous[b.length()] > max ? -1 : previous[b.length()];
    }
}
