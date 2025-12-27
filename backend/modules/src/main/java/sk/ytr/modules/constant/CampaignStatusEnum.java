package sk.ytr.modules.constant;

import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;

import java.util.Arrays;

@Getter
public enum CampaignStatusEnum {

    DRAFT(1, "Nháp"),
    IN_PROGRESS(2, "Đang tiến hành"),
    CLOSED(3, "Đã đóng");

    @JsonValue
    private final Integer code;
    private final String description;

    CampaignStatusEnum(Integer code, String description) {
        this.code = code;
        this.description = description;
    }

    public static CampaignStatusEnum fromCode(Integer code) {
        return Arrays.stream(values())
                .filter(t -> t.code.equals(code))
                .findFirst()
                .orElseThrow(() ->
                        new IllegalArgumentException("code = " + code + " isn't defined!!!"));
    }

    public static boolean containsDescription(String description) {
        return Arrays.stream(values())
                .anyMatch(t -> t.description.equalsIgnoreCase(description));
    }
}
