import { StrictMode, createElement } from "react";
import { createRoot } from "react-dom/client";
import { AuthLayout } from "../components/auth/AuthLayout";
import { ProfileForm } from "../components/auth/ProfileForm";
import type { ProfileFormData } from "../types/auth";

// Mock funkcja - w przyszłości będzie zastąpiona prawdziwym wywołaniem API
const handleProfileUpdate = async (data: ProfileFormData): Promise<void> => {
  console.log("Profile update attempt:", {
    currentPasswordProvided: !!data.currentPassword,
    newPasswordProvided: !!data.newPassword,
  });

  // Symulacja opóźnienia API
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Symulacja błędu dla demonstracji
  if (data.currentPassword === "wrongpassword") {
    throw new Error("Current password is incorrect");
  }

  // Symulacja sukcesu
  console.log("Profile updated successfully");
};

// Inicjalizacja React aplikacji
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("profile-page");

  if (container) {
    const root = createRoot(container);

    const authLayoutElement = createElement(AuthLayout, {
      title: "Edit Profile",
      description: "Update your account settings and password.",
      children: createElement(ProfileForm, {
        onSubmit: handleProfileUpdate,
      }),
    });

    root.render(createElement(StrictMode, null, authLayoutElement));
  }
});
