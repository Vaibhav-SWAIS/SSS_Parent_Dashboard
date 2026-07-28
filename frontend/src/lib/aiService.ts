import axios from "axios";

const AI_BASE_URL = "http://18.61.240.248:7007/api/parent";

export const aiApi = axios.create({
  baseURL: AI_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ----------------------------
// Translation
// ----------------------------

const LANGUAGE_MAP: Record<string, string> = {
  en: "English",
  te: "Telugu",
  hi: "Hindi",
  ta: "Tamil",
  kn: "Kannada",
  ml: "Malayalam",
  or: "Odia",
  bn: "Bengali",
  mr: "Marathi",
  gu: "Gujarati",
  pa: "Punjabi",
};

export const translateText = async (
  text: string,
  targetLanguage: string
) => {
  // Do not call the API for empty text
  if (!text?.trim()) {
    return {
      translated_text: "",
    };
  }

  // Convert language code to language name if required
  const normalizedLanguage =
    LANGUAGE_MAP[targetLanguage.toLowerCase()] ??
    targetLanguage;

  // English does not need translation
  if (
    normalizedLanguage.toLowerCase() === "english" ||
    targetLanguage.toLowerCase() === "en"
  ) {
    return {
      translated_text: text,
    };
  }

  try {
    console.log("Translation request:", {
      text,
      target_language: normalizedLanguage,
    });

    const response = await aiApi.post("/translate", {
      text: text.trim(),
      target_language: normalizedLanguage,
    });

    console.log("Translation response:", response.data);

    return response.data;
  } catch (error: any) {
    console.error(
      "Translation API failed:",
      error?.response?.data ?? error?.message
    );

    // Keep the original text instead of breaking the dashboard
    return {
      translated_text: text,
      error: true,
    };
  }
};

// ----------------------------
// Assessment Summary
// ----------------------------
export const fetchAssessmentSummary = async (payload: {
  student_name: string;
  subject: string;
  test_name: string;
  marks_obtained: number;
  total_marks: number;
  teacher_remarks?: string;
  language?: string;
}) => {
  const response = await aiApi.post(
    "/assessment-summary",
    payload
  );

  return response.data;
};

// ----------------------------
// Text To Voice
// ----------------------------
export const textToVoice = async (
  text: string,
  language: string
) => {
  const response = await aiApi.post(
    "/text-to-voice",
    {
      text,
      language,
    }
  );

  console.log("TTS API RESPONSE:", response.data);

  const base64 = response.data.audio_base64;

  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);

  const blob = new Blob(
    [byteArray],
    { type: "audio/mpeg" }
  );

  console.log("FINAL AUDIO BLOB:", blob);

  return blob;
};

// ----------------------------
// Compatibility function
// ----------------------------
export const speakWithAI = async ({
  text,
  targetLang,
}: {
  text: string;
  targetLang: string;
}) => {
  try {
    const audio = await textToVoice(
      text,
      targetLang
    );

    console.log("Generated audio blob:", audio);
    console.log("Blob type:", audio.type);
    console.log("Blob size:", audio.size);

    return {
      success: true,
      data: audio,
    };
  } catch (err) {
    console.error(err);

    return {
      success: false,
      data: null,
    };
  }
};
// ----------------------------
// Voice To Text
// ----------------------------
export const voiceToText = async (
  file: File,
  language: string
) => {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("language", language);

  const response = await axios.post(
    `${AI_BASE_URL}/voice-to-text`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

// ----------------------------
// Due Date Alert
// ----------------------------
export interface DueDateAlertRequest {
  student_name: string;
  assignment_title: string;
  subject: string;
  due_date: string;
  description: string;
}

export const fetchDueDateAlert = async (
  payload: DueDateAlertRequest
) => {
  const response = await aiApi.post(
    "/due-date-alert",
    payload
  );

  return response.data;
};
// ----------------------------
// Audio Translator
// ----------------------------
export const audioTranslator = async (
  file: File,
  sourceLanguage: string,
  targetLanguage: string
) => {
  const formData = new FormData();

  formData.append("file", file);
  formData.append(
    "source_language",
    sourceLanguage
  );
  formData.append(
    "target_language",
    targetLanguage
  );

  const response = await axios.post(
    `${AI_BASE_URL}/audio-translator`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

// ----------------------------
// Build User Info
// ----------------------------
export const buildUserInfo = (parentId: number) => ({
  parentId,
});

// ----------------------------
// AI Analytics
// ----------------------------
export const fetchAIAnalytics = async (payload: {
  scope: string;
  subject?: string;
  userInfo: {
    parentId: number;
  };
}) => {
  try {
    const response = await aiApi.post(
      "/analytics",
      payload
    );

    return {
      success: true,
      data:
        response.data.analysis ??
        response.data.result ??
        response.data,
    };
  } catch (error: any) {
    console.error("AI Analytics Error:", error);

    return {
      success: false,
      error:
        error?.response?.data?.error ??
        error?.message ??
        "unknown",
      data: null,
    };
  }
};