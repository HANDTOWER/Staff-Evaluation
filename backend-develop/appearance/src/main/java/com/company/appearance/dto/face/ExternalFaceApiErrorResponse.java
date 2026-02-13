package com.company.appearance.dto.face;

import java.util.List;

/**
 * Error response DTO from external Face API (422 Validation Error).
 */
public class ExternalFaceApiErrorResponse {
    private List<ValidationDetail> detail;

    public ExternalFaceApiErrorResponse() {
    }

    public List<ValidationDetail> getDetail() {
        return detail;
    }

    public void setDetail(List<ValidationDetail> detail) {
        this.detail = detail;
    }

    public static class ValidationDetail {
        private List<Object> loc;
        private String msg;
        private String type;

        public ValidationDetail() {
        }

        public List<Object> getLoc() {
            return loc;
        }

        public void setLoc(List<Object> loc) {
            this.loc = loc;
        }

        public String getMsg() {
            return msg;
        }

        public void setMsg(String msg) {
            this.msg = msg;
        }

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }
    }
}
