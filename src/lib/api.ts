import axios, { type AxiosError } from "axios";
import Swal from "sweetalert2";

function getErrorMessage(error: AxiosError<{ message?: string; error?: string }>): string {
  const data = error.response?.data;
  if (data?.message && typeof data.message === "string") return data.message;
  if (data?.error && typeof data.error === "string") return data.error;
  const status = error.response?.status;
  if (error.response == null) {
    return "Network error. Please check your connection and try again.";
  }
  switch (status) {
    case 400:
      return "Invalid request. Please check your input and try again.";
    case 401:
      return "Please sign in to continue.";
    case 403:
      return "You don't have permission to perform this action.";
    case 404:
      return "The requested resource was not found.";
    case 422:
      return "The information you entered could not be processed. Please check and try again.";
    case 429:
      return "Too many requests. Please wait a moment and try again.";
    default:
      if (status && status >= 500) {
        return "Something went wrong on our end. Please try again later.";
      }
      return "Something went wrong. Please try again.";
  }
}

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; error?: string }>) => {
    const message = getErrorMessage(error);
    if (typeof window !== "undefined") {
      void Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: message,
        showConfirmButton: false,
        timer: 5000,
        timerProgressBar: true,
      });
    }
    return Promise.reject(error);
  }
);
