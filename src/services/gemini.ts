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

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to generate simulation");
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error("Error calling simulation API:", error);
    throw error;
  }
}
