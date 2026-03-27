import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { playlistUrl } = await request.json();
        console.log('🎵 Playlist URL alındı:', playlistUrl);

        if (!playlistUrl) {
            return NextResponse.json({ error: 'Playlist URL gerekli' }, { status: 400 });
        }

        // URL'den veya string'den Playlist ID'yi çıkarma
        let playlistId = '';

        // RegEx ile ID yakalama (URL veya direkt ID)
        // Desteklenen formatlar:
        // - list=PL...
        // - list=RD... (Radio/Mix)
        // - playlist/PL...
        // - PL... (direkt ID)
        const listRegex = /[?&]list=([^#\&\?]+)/;
        const match = playlistUrl.match(listRegex);

        if (match && match[1]) {
            playlistId = match[1];
        } else if (playlistUrl.startsWith('PL') || playlistUrl.startsWith('UU') || playlistUrl.startsWith('FL') || playlistUrl.startsWith('VL') || playlistUrl.startsWith('RD') || playlistUrl.startsWith('OL')) {
            playlistId = playlistUrl;
        } else {
            // Fallback: URL değilse direkt ID kabul et
            playlistId = playlistUrl;
        }

        if (!playlistId) {
            console.log('❌ Geçersiz playlist ID');
            return NextResponse.json({ error: 'Geçersiz Playlist ID' }, { status: 400 });
        }

        console.log('✅ Playlist ID:', playlistId);

        // VL prefix'i varsa temizle (YouTube API VL istemiyor genellikle browseId için)
        let browseId = playlistId;
        if (playlistId.startsWith('VL')) {
            browseId = playlistId;
        } else {
            browseId = `VL${playlistId}`;
        }

        console.log('🔍 Browse ID:', browseId);

        // YouTube Internal API (InnerTube) İsteği
        // Not: music.youtube.com linkleri gelse bile, playlist ID aynıdır ve standart YouTube API üzerinden çekilebilir.
        // Bu yüzden clientName: 'WEB' kullanmaya devam ediyoruz, çünkü parse etmesi daha kolay standart veri döner.
        const response = await fetch(
            `https://www.youtube.com/youtubei/v1/browse?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                },
                body: JSON.stringify({
                    context: {
                        client: {
                            clientName: 'WEB',
                            clientVersion: '2.20240101.00.00'
                        }
                    },
                    browseId: browseId // Browse endpoint'i bazen VL prefixini sever
                })
            }
        );

        if (!response.ok) {
            throw new Error(`YouTube API Hatası: ${response.status}`);
        }

        const data = await response.json();
        console.log('📦 YouTube API Response keys:', Object.keys(data));
        
        // Alerts varsa logla (hata mesajları)
        if (data.alerts) {
            console.log('⚠️ YouTube Alerts:', JSON.stringify(data.alerts, null, 2));
            
            // Hata mesajını kullanıcıya döndür
            const errorMessage = data.alerts[0]?.alertRenderer?.text?.runs?.[0]?.text || 'YouTube API hatası';
            
            if (errorMessage.includes('unviewable') || errorMessage.includes('unavailable')) {
                return NextResponse.json({ 
                    error: 'Bu playlist tipi desteklenmiyor. Lütfen normal bir YouTube playlist linki kullanın (PL ile başlayan). Radio/Mix playlist\'leri şu an desteklenmiyor.',
                    details: errorMessage
                }, { status: 400 });
            }
        }
        
        // Response'u daha detaylı logla
        if (data.contents) {
            console.log('✅ contents var');
        } else {
            console.log('❌ contents YOK!');
        }
        if (data.header) {
            console.log('✅ header var');
        } else {
            console.log('❌ header YOK!');
        }
        if (data.sidebar) {
            console.log('✅ sidebar var');
        } else {
            console.log('❌ sidebar YOK!');
        }

        // Recursively search for playlistVideoRenderer
        // Bu fonksiyon, JSON ağacının neresinde olursa olsun şarkı verilerini bulup çıkarır.
        const findVideos = (obj: any, list: any[] = []) => {
            if (!obj) return list;

            if (Array.isArray(obj)) {
                obj.forEach(item => findVideos(item, list));
                return list;
            }

            if (typeof obj === 'object') {
                // Standart Video
                if (obj.playlistVideoRenderer) {
                    const v = obj.playlistVideoRenderer;
                    if (v.videoId) {
                        console.log('🎵 Şarkı bulundu (playlistVideoRenderer):', v.title?.runs?.[0]?.text || v.title?.simpleText);
                        list.push({
                            id: v.videoId,
                            title: v.title?.runs?.[0]?.text || v.title?.simpleText || 'Bilinmeyen Şarkı',
                            artist: v.shortBylineText?.runs?.[0]?.text || 'Bilinmeyen Sanatçı',
                            album: 'YouTube Playlist',
                            duration: v.lengthText?.simpleText || (v.lengthSeconds ? formatDuration(v.lengthSeconds) : ''),
                            imageUrl: `https://i.ytimg.com/vi/${v.videoId}/maxresdefault.jpg`,
                            audioUrl: v.videoId, // Sadece video ID
                            aiHint: 'youtube'
                        });
                    }
                }
                // Video Renderer (Radio/Mix için)
                else if (obj.videoRenderer) {
                    const v = obj.videoRenderer;
                    if (v.videoId) {
                        console.log('🎵 Şarkı bulundu (videoRenderer):', v.title?.runs?.[0]?.text || v.title?.simpleText);
                        list.push({
                            id: v.videoId,
                            title: v.title?.runs?.[0]?.text || v.title?.simpleText || 'Bilinmeyen Şarkı',
                            artist: v.shortBylineText?.runs?.[0]?.text || v.longBylineText?.runs?.[0]?.text || 'Bilinmeyen Sanatçı',
                            album: 'YouTube Mix',
                            duration: v.lengthText?.simpleText || (v.lengthSeconds ? formatDuration(v.lengthSeconds) : ''),
                            imageUrl: `https://i.ytimg.com/vi/${v.videoId}/maxresdefault.jpg`,
                            audioUrl: v.videoId,
                            aiHint: 'youtube'
                        });
                    }
                }
                // Compact Video Renderer
                else if (obj.compactVideoRenderer) {
                    const v = obj.compactVideoRenderer;
                    if (v.videoId) {
                        console.log('🎵 Şarkı bulundu (compactVideoRenderer):', v.title?.simpleText);
                        list.push({
                            id: v.videoId,
                            title: v.title?.simpleText || 'Bilinmeyen Şarkı',
                            artist: v.shortBylineText?.runs?.[0]?.text || v.longBylineText?.runs?.[0]?.text || 'Bilinmeyen Sanatçı',
                            album: 'YouTube Mix',
                            duration: v.lengthText?.simpleText || '',
                            imageUrl: `https://i.ytimg.com/vi/${v.videoId}/maxresdefault.jpg`,
                            audioUrl: v.videoId,
                            aiHint: 'youtube'
                        });
                    }
                }
                // YouTube Music Track (Eğer WEB_REMIX gelirse veya yapı farklıysa)
                else if (obj.musicResponsiveListItemRenderer) {
                    const v = obj.musicResponsiveListItemRenderer;
                    const videoId = v.playlistItemData?.videoId;
                    if (videoId) {
                        console.log('🎵 Şarkı bulundu (musicResponsiveListItemRenderer)');
                        list.push({
                            id: videoId,
                            title: v.flexColumns?.[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[0]?.text || 'Bilinmeyen Şarkı',
                            artist: v.flexColumns?.[1]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[0]?.text || 'Bilinmeyen Sanatçı',
                            album: 'YouTube Music',
                            duration: '',
                            imageUrl: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
                            audioUrl: videoId,
                            aiHint: 'youtube'
                        });
                    }
                }

                // Alt objeleri tara
                Object.values(obj).forEach(val => findVideos(val, list));
            }

            return list;
        };

        const songs = findVideos(data);
        console.log('🎵 Bulunan şarkı sayısı:', songs.length);

        // Başlık bulma (Recursive veya belirli path)
        const title = data?.header?.playlistHeaderRenderer?.title?.simpleText ||
            data?.metadata?.playlistMetadataRenderer?.title ||
            'İçe Aktarılan Playlist';

        console.log('📝 Playlist başlığı:', title);

        return NextResponse.json({
            title: title,
            songs: songs,
            songCount: songs.length
        });

    } catch (error: any) {
        console.error('Playlist fetch hatası:', error);
        return NextResponse.json({ error: 'Playlist yüklenirken hata: ' + error.message }, { status: 500 });
    }
}

// Saniye cinsinden süreyi formatla (örn: 185 -> "3:05")
function formatDuration(seconds: string | number) {
    if (!seconds) return '';
    const sec = Number(seconds);
    const minutes = Math.floor(sec / 60);
    const remainingSeconds = sec % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}
