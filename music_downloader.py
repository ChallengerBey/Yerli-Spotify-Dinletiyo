import yt_dlp
import os

def download_music(url, output_path="downloads"):
    """YouTube'dan müzik indir"""
    
    # Klasör yoksa oluştur
    if not os.path.exists(output_path):
        os.makedirs(output_path)
    
    # yt-dlp ayarları
    ydl_opts = {
        'format': 'bestaudio/best',
        'extractaudio': True,
        'audioformat': 'mp3',
        'outtmpl': f'{output_path}/%(title)s.%(ext)s',
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',
        }],
    }
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])
        print("✅ İndirme tamamlandı!")
    except Exception as e:
        print(f"❌ Hata: {e}")

# Kullanım
if __name__ == "__main__":
    video_url = input("YouTube URL'sini girin: ")
    download_music(video_url)