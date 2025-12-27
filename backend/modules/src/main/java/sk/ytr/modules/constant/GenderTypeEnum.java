package sk.ytr.modules.constant;

import com.fasterxml.jackson.annotation.JsonValue;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.Arrays;
@Getter
@NoArgsConstructor
@AllArgsConstructor
public enum GenderTypeEnum {
    MALE(1, "Con trai"),
    FEMALE(2, "Con gái"),
    ;

    @JsonValue
    private Integer code;
    private String description;

    public static GenderTypeEnum fromCode(Integer code) {
        return Arrays.asList(values()).stream()
                .filter(t -> t.getCode() == (code))
                .findFirst()
                .orElseThrow(
                        () -> new IllegalArgumentException("code = " + code + " isn't defined!!!"));
    }

    public static boolean contains(String code) {
        return Arrays.stream(values())
                .anyMatch(t ->t.getDescription().equalsIgnoreCase(code));
    }
}
