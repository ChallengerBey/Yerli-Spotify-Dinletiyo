
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { recommendSongs } from "@/ai/flows/song-recommendation";
import { searchTracks } from "@/app/home/search/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Wand2, Music, Loader2 } from "lucide-react";
import { SongCard } from "./song-card";
import { Song } from "@/lib/data";

const formSchema = z.object({
  listeningHistory: z.string().min(10, { message: "Lütfen en az 10 karakter girin." }),
  preferences: z.string().min(10, { message: "Lütfen en az 10 karakter girin." }),
});

export function RecommendationForm() {
  const [recommendations, setRecommendations] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      listeningHistory: "",
      preferences: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);
    setRecommendations([]);
    try {
      const result = await recommendSongs(values);
      const songTitles = result.songs.split(',').map(s => s.trim()).filter(s => s);

      // Fetch song details with images for each recommendation
      const songPromises = songTitles.map(async (title) => {
        const searchResults = await searchTracks(title);
        // Return the first result with a valid image, or a placeholder
        return searchResults.length > 0 ? searchResults[0] : {
          id: title,
          title: title.split(' - ')[0] || title,
          artist: title.split(' - ')[1] || 'Bilinmiyor',
          album: 'Önerilenler',
          duration: '0:00',
          imageUrl: "https://placehold.co/300x300.png",
          audioUrl: 'https://storage.googleapis.com/stolo-public-assets/gemini-studio/royalty-free-music/scott-buckley-jul.mp3',
          aiHint: "album cover"
        };
      });

      const fullRecommendations = await Promise.all(songPromises);
      setRecommendations(fullRecommendations);

    } catch (e) {
      setError("Öneri alınırken bir hata oluştu. Lütfen tekrar deneyin.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section>
        <Card className="bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-primary/30">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Wand2 className="w-8 h-8 text-primary" />
                <div>
                  <CardTitle>Sihirli Öneriler</CardTitle>
                  <CardDescription>Müzik zevkini anlat, sana özel listeler hazırlayalım.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="listeningHistory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Genellikle ne dinlersin?</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Örn: Tarkan - Kuzu Kuzu, Sezen Aksu - Hadi Bakalım..." {...field} rows={4} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="preferences"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ne tür müzikler keşfetmek istersin?</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Örn: Enerjik ve dans edilesi Türkçe pop, 90'lar rock..." {...field} rows={4} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Oluşturuluyor...
                  </>
                ) : (
                  <>
                    <Music className="mr-2 h-4 w-4" />
                    Bana Şarkı Öner
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
      
      {error && <p className="text-destructive mt-4">{error}</p>}
      
      {recommendations.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">İşte Sana Özel Öneriler:</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {recommendations.map((song, index) => (
              <SongCard
                key={`${song.id}-${index}`}
                item={song}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
