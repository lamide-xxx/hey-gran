import { getInitialHistory } from "./mockHistoryStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

let cachedHistory = getInitialHistory();

/**
 * Fetches call history from the backend.
 * - On success: replaces cached data with API data (top 5, newest first).
 * - On failure: returns the existing cached data (initially the 5 mock entries).
 */
export const fetchCallHistory = async () => {
    try {
        const res = await fetch(`${API_URL}/call-history`, {
            method: "GET",
            headers: { Accept: "application/json" },
        });

        if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
                const normalised = data.map((item, index) => ({
                    ...cachedHistory[index % cachedHistory.length],
                    ...item,
                    flagged: !!item.flagged,
                    moodEmoji: item.moodEmoji || (item.flagged ? "😐" : "😊"),
                }));
                cachedHistory = normalised;
            }
        }
    } catch (err) {
        console.error("API failed or unavailable, using fallback mock data.", err);
    }

    const sorted = [...cachedHistory].sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );
    return sorted.slice(0, 5);
};

// ---------------------------------------------------------------------------
// Profile helpers
// ---------------------------------------------------------------------------

/**
 * Fetch all profiles from the backend.
 * Returns an array of profile objects, or null on failure.
 */
export const fetchAllProfiles = async () => {
    try {
        const res = await fetch(`${API_URL}/profiles`, {
            headers: { Accept: "application/json" },
        });
        if (res.ok) return await res.json();
    } catch (err) {
        console.error("Failed to fetch profiles:", err);
    }
    return null;
};

/**
 * Fetch a single profile by id.
 * Returns the profile object, or null on failure.
 */
export const fetchProfile = async (profileId) => {
    try {
        const res = await fetch(`${API_URL}/profiles/${profileId}`, {
            headers: { Accept: "application/json" },
        });
        if (res.ok) return await res.json();
    } catch (err) {
        console.error(`Failed to fetch profile '${profileId}':`, err);
    }
    return null;
};

/**
 * Update the phone number for a profile.
 * Returns the updated profile, or null on failure.
 */
export const updateProfilePhone = async (profileId, phone) => {
    try {
        const res = await fetch(`${API_URL}/profiles/${profileId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone }),
        });
        if (res.ok) return await res.json();
        const errBody = await res.json().catch(() => ({}));
        console.error("Failed to update phone:", errBody.detail || res.status);
    } catch (err) {
        console.error("Failed to update phone:", err);
    }
    return null;
};
