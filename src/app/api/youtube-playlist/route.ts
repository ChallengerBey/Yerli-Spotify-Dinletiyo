import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const playlistId = searchParams.get('playlistId');

  if (!playlistId) {
    return NextResponse.json({ error: 'Playlist ID required' }, { status: 400 });
  }

  try {
    console.log(`🎵 YouTube playlist çekiliyor: ${playlistId}`);
    
    const videos = [];
    let continuationToken = null;
    let pageCount = 0;
    const maxPages = 10; // Maksimum 10 sayfa (genelde sayfa başı 20-30 video)
    
    do {
      const requestBody: any = {
        context: {
          client: {
            clientName: 'WEB',
            clientVersion: '2.20240101.00.00'
          }
        },
        browseId: `VL${playlistId}`
      };

      // Continuation token varsa ekle
      if (continuationToken) {
        requestBody.continuation = continuationToken;
      }

      const response = await fetch(
        `https://www.youtube.com/youtubei/v1/browse?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        }
      );

      if (!response.ok) {
        throw new Error('YouTube playlist API failed');
      }

      const data = await response.json();
      
      // İlk sayfa için farklı path
      let contents;
      if (pageCount === 0) {
        contents = data?.contents?.twoColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents?.[0]?.playlistVideoListRenderer?.contents || [];
      } else {
        // Continuation sayfaları için farklı path
        contents = data?.onResponseReceivedActions?.[0]?.appendContinuationItemsAction?.continuationItems || [];
      }
      
      console.log(`📺 Sayfa ${pageCount + 1}: ${contents.length} video bulundu`);
      
      for (const item of contents) {
        if (item.playlistVideoRenderer) {
          const video = item.playlistVideoRenderer;
          const title = video.title?.runs?.[0]?.text || 'Unknown Title';
          const channelTitle = video.shortBylineText?.runs?.[0]?.text || 'Unknown Channel';
          const duration = video.lengthText?.simpleText || '0:00';
          const videoId = video.videoId;
          
          if (videoId && title !== 'Unknown Title') {
            console.log(`✅ Playlist şarkısı: ${title} - ${channelTitle} (${duration})`);
            
            videos.push({
              id: videoId,
              title: title,
              thumbnail: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
              duration: duration,
              channelTitle: channelTitle
            });
          }
          
          // Maksimum 200 şarkı al
          if (videos.length >= 200) {
            break;
          }
        } else if (item.continuationItemRenderer) {
          // Continuation token'ı al
          continuationToken = item.continuationItemRenderer.continuationEndpoint?.continuationCommand?.token;
        }
      }
      
      // Continuation token'ı da kontrol et (farklı yerde olabilir)
      if (!continuationToken && data?.contents?.twoColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents?.[0]?.playlistVideoListRenderer?.continuations) {
        continuationToken = data.contents.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents[0].itemSectionRenderer.contents[0].playlistVideoListRenderer.continuations[0]?.nextContinuationData?.continuation;
      }
      
      pageCount++;
      
      // 200 şarkıya ulaştıysak dur
      if (videos.length >= 200) {
        break;
      }
      
    } while (continuationToken && pageCount < maxPages);

    console.log(`🎵 Toplam ${videos.length} şarkı playlist'ten çekildi (${pageCount} sayfa)`);
    
    return NextResponse.json({ videos });
  } catch (error) {
    console.error('YouTube playlist error:', error);
    
    // Fallback - boş array döndür
    return NextResponse.json({ videos: [] });
  }
}