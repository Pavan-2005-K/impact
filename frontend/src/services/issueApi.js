import api from "./api";

export async function getMyIssueReports(signal) {
    const response = await api.get("/issues/my-reports", { signal });
    return response.data;
}

export async function createIssueReport(report) {
    const formData = new FormData();
    Object.entries(report).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            formData.append(key, value);
        }
    });

    const response = await api.post("/issues", formData);
    return response.data;
}
