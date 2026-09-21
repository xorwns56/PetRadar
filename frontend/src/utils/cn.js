/**
 * 조건부 클래스명을 공백 하나로 이어 붙인다.
 * false·null·undefined는 버리므로 삼항 연산자 없이 `조건 && "클래스"`로 쓸 수 있다.
 */
export const cn = (...classes) => classes.filter(Boolean).join(" ");
