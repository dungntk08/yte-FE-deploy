package sk.ytr.modules.constant;

import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;

import java.util.Arrays;

@Getter
public enum GenderTypeEnum {

    MALE(1, "Con trai"),
    FEMALE(2, "Con gái");

    @JsonValue
    private final Integer code;
    private final String description;

    GenderTypeEnum(Integer code, String description) {
        this.code = code;
        this.description = description;
    }

    public static GenderTypeEnum fromCode(Integer code) {
        return Arrays.stream(values())
                .filter(t -> t.code.equals(code))
                .findFirst()
                .orElseThrow(() ->
                        new IllegalArgumentException("Gender code = " + code + " isn't defined!!!"));
    }

    public static boolean containsDescription(String description) {
        return Arrays.stream(values())
                .anyMatch(t -> t.description.equalsIgnoreCase(description));
    }
}

