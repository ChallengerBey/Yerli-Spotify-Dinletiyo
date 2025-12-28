from flask import Flask, render_template, request, jsonify, send_file
import yt_dlp
import os
import threading

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/download', methods=['POST'])
def download_music():
    url = request.json.get('url')
    
    if not url:
        return jsonify({'error': 'URL gerekli'}), 400
    
    try:
        # Arka planda indir
        thread = threading.Thread(target=download_worker, args=(url,))
        thread.start()
        
        return jsonify({'success': 'İndirme başladı!'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def download_worker(url):
    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': 'downloads/%(title)s.%(ext)s',
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',
        }],
    }
    
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([url])

if __name__ == '__main__':
    os.makedirs('downloads', exist_ok=True)
    app.run(debug=True)