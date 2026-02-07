import { addEntry, updateEntry } from '../data/store.js';
import { SYSTEM_ENTRY_TYPES } from '../data/models.js';

/**
 * Generate dummy entries for testing
 */
export async function generateDummyData() {
    const types = SYSTEM_ENTRY_TYPES.map(t => t.id);
    const now = new Date();

    const sampleTexts = [
        "Reflecting on the day's events.",
        "Had a breakthrough with the project! 🚀",
        "Why do we sleep? #question",
        "Feeling grateful for good health.",
        "Anxiety about the upcoming presentation. #fear",
        "Idea: An app that tracks mood via music choices.",
        "Walking in the rain was refreshing.",
        " learned something new about CSS Grid today.",
        "Coffee with an old friend.",
        "Just a quiet moment to breathe."
    ];

    console.log('Generating 20 dummy entries...');

    for (let i = 0; i < 20; i++) {
        // Random day within last 7 days
        const daysAgo = Math.floor(Math.random() * 7);
        const date = new Date(now);
        date.setDate(date.getDate() - daysAgo);

        // Random time
        date.setHours(
            Math.floor(Math.random() * 24),
            Math.floor(Math.random() * 60)
        );

        const typeId = types[Math.floor(Math.random() * types.length)];
        const text = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];

        const entry = await addEntry({
            content: `${text} (Day -${daysAgo})`,
            typeId
        });

        // Update timestamp to be in the past
        await updateEntry(entry.id, { createdAt: date.toISOString() });
    }

    console.log('Dummy data generation complete.');
}
