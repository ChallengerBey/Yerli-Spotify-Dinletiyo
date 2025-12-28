import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { playlistTitle, playlistDescription, currentMonth } = await request.json();

    const prompt = `
Playlist: "${playlistTitle}"
Açıklama: "${playlistDescription}"
Tarih: ${currentMonth}

Bu playlist'e uygun ${currentMonth} ayında popüler olan 50 tane Türkçe şarkı öner. 
Sadece şarkı adı ve sanatçı adını ver.
Format: "Sanatçı - Şarkı Adı"

Örnekler:
- Tarkan - Kuzu Kuzu
- Sezen Aksu - Hadi Bakalım
- Duman - Senden Daha Güzel
- Ezhel - Geceler
- Mabel Matiz - Antidepresan

Güncel, popüler ve ${currentMonth} ayına uygun şarkıları tercih et. 
Sadece liste ver, açıklama yapma.
`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GOOGLE_GENAI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    const suggestions = text
      .split('\n')
      .filter((line: string) => line.trim() && line.includes('-'))
      .map((line: string) => line.replace(/^[-*]\s*/, '').trim())
      .slice(0, 50);

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('AI önerileri hatası:', error);
    return NextResponse.json({ error: 'AI önerileri alınamadı' }, { status: 500 });
  }
}