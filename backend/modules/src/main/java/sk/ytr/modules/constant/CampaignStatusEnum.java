package sk.ytr.modules.constant;

import com.fasterxml.jackson.annotation.JsonValue;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.Arrays;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public enum CampaignStatusEnum {
    DRAFT(1, "Nháp"),
    IN_PROGRESS(2, "Đang tiến hành"),
    CLOSED(3, "Đã đóng"),
    ;

    @JsonValue
    private Integer code;
    private String description;

    public static CampaignStatusEnum fromCode(Integer code) {
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
