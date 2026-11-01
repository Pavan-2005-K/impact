import api from "./api";

export async function getMyTasks(signal) {
    const response = await api.get("/tasks/my-tasks", { signal });
    return response.data;
}

export async function submitTaskEvidence(taskId, submissionNotes, afterImage) {
    const formData = new FormData();
    formData.append("submissionNotes", submissionNotes);
    formData.append("afterImage", afterImage);

    const response = await api.patch(
        `/tasks/${encodeURIComponent(taskId)}/submit`,
        formData
    );
    return response.data;
}
