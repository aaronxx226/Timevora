export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  emotionalTags: string[];
}

export interface UserData {
  age: string;
  profession: string;
  story: string;
  context: string;
  scenario: string;
  timelineEvents?: TimelineEvent[];
}

export async function generateSimulation(userData: UserData) {
  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userData }),
    });

    const contentType = response.headers.get("content-type");
    if (!response.ok) {
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate simulation");
      } else {
        const textError = await response.text();
        console.error("Server returned non-JSON error:", textError);
        // If it's a Vercel 500, it usually starts with "A server error occurred"
        if (textError.toLowerCase().includes("server error")) {
          throw new Error("The server encountered an error. This usually happens if the AI takes too long or the API key is missing. Please check your Vercel logs.");
        }
        throw new Error(`Server Error: ${textError.substring(0, 100)}...`);
      }
    }

    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      return data.text;
    } else {
      throw new Error("Server returned an invalid response format.");
    }
  } catch (error: any) {
    console.error("Error calling simulation API:", error);
    throw error;
  }
}
