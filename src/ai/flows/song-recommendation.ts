'use server';

/**
 * @fileOverview An AI agent that recommends songs to users based on their listening history and preferences.
 *
 * - recommendSongs - A function that handles the song recommendation process.
 * - RecommendSongsInput - The input type for the recommendSongs function.
 * - RecommendSongsOutput - The return type for the recommendSongs function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendSongsInputSchema = z.object({
  listeningHistory: z
    .string()
    .describe(
      'A comma separated list of the user listening history. List song names and artists.'
    ),
  preferences: z.string().describe('The user music preferences.'),
});
export type RecommendSongsInput = z.infer<typeof RecommendSongsInputSchema>;

const RecommendSongsOutputSchema = z.object({
  songs: z
    .string()
    .describe('A comma separated list of song recommendations.'),
});
export type RecommendSongsOutput = z.infer<typeof RecommendSongsOutputSchema>;

export async function recommendSongs(input: RecommendSongsInput): Promise<RecommendSongsOutput> {
  return recommendSongsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendSongsPrompt',
  input: {schema: RecommendSongsInputSchema},
  output: {schema: RecommendSongsOutputSchema},
  prompt: `You are a personal music assistant. Given the user's listening history and preferences, you will respond with a list of song recommendations.

User Listening History: {{{listeningHistory}}}

User Preferences: {{{preferences}}}

Recommendations:`,
});

const recommendSongsFlow = ai.defineFlow(
  {
    name: 'recommendSongsFlow',
    inputSchema: RecommendSongsInputSchema,
    outputSchema: RecommendSongsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
