import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function translateText(
  text: string,
  targetLanguage: string = "hi"
): string {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_TRANSLATE_API_KEY;

    const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;

    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: text,
        target: targetLanguage,
        format: "text",
      }),
    }).then((response) => {
      if (!response.ok) {
        throw new Error(`Translation API error: ${response.status}`);
      }
      response.json().then((result) => {
        console.log(result.data.translations[0]);
        return result.data.translations[0].translatedText;
      });
    });
  } catch (error) {
    console.error("Translation error:", error);
    return text;
  }
}
