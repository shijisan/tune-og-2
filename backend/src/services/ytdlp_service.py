from re import M
import yt_dlp
import os
from dotenv import load_dotenv
from pathlib import Path

# todo: test more to be able to handle other error cases
class YtdlpService:

    def __init__(self):
        BASE_DIR = Path(__file__).resolve().parents[3]

        dotenv_path = BASE_DIR / "backend/src/core/.env"
        load_dotenv(dotenv_path=dotenv_path)

        download_dir = BASE_DIR / os.getenv("DOWNLOAD_DIR", "DownloadsAlt")
        download_dir.mkdir(parents=True, exist_ok=True)

        self.ytdlp_defaults = {

        'format': 'bestaudio/best',
        
        'http_headers': {
            'User-Agent': 'Mozilla/5.0',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': 'https://music.youtube.com/',
        },

        'extractor_args': {
            'youtube': {
                'player_client': ['android_vr', 'web_safari'], # works with streaming including yt music links
            }
        },

        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',
        }],

        'noplaylist': True,

        'cachedir': None,

        'quite': True,

        'no_warnings': True,

        'outtmpl': str(download_dir / "cla%(id)s.%(ext)s"),

        'extractor_retries': 3,

        'retries': 3,
        }

        self._ytdl_client = yt_dlp.YoutubeDL(self.ytdlp_defaults)

    def download_audio(self, url: str):
        info = self._ytdl_client.extract_info(url, download=True)

        if not info:
            raise ValueError("Failed to extract stream URL")
        
        return info["requested_downloads"][0]["filepath"]


    def _extract_info(self, url: str):
            print("extracting metadata")
            info = self._ytdl_client.extract_info(url, download = False)
            return info


    def extract_stream_url(self, url: str) -> str | None:
        print("extracting stream url")
        info = self._extract_info(url)

        if not info:
            return None

        stream_url = info.get("url")

        if not stream_url:
            return None

        return stream_url

