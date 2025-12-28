import yt_dlp
import os

class MusicDownloader:
    def __init__(self, output_path="downloads"):
        self.output_path = output_path
        if not os.path.exists(output_path):
            os.makedirs(output_path)
    
    def download_single(self, url):
        """Tek video indir"""
        ydl_opts = {
            'format': 'bestaudio/best',
            'outtmpl': f'{self.output_path}/%(title)s.%(ext)s',
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '192',
            }],
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])
    
    def download_playlist(self, url):
        """Playlist indir"""
        ydl_opts = {
            'format': 'bestaudio/best',
            'outtmpl': f'{self.output_path}/%(playlist_title)s/%(title)s.%(ext)s',
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '192',
            }],
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])
    
    def search_and_download(self, query):
        """Arama yapıp ilk sonucu indir"""
        ydl_opts = {
            'format': 'bestaudio/best',
            'outtmpl': f'{self.output_path}/%(title)s.%(ext)s',
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '192',
            }],
        }
        
        search_url = f"ytsearch1:{query}"
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([search_url])

# Kullanım
if __name__ == "__main__":
    downloader = MusicDownloader()
    
    print("1. URL ile indir")
    print("2. Şarkı adı ile ara ve indir")
    choice = input("Seçim (1/2): ")
    
    if choice == "1":
        url = input("YouTube URL: ")
        downloader.download_single(url)
    elif choice == "2":
        query = input("Şarkı adı: ")
        downloader.search_and_download(query)
    
    print("✅ Tamamlandı!")