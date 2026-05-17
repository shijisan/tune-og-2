import asyncio
from services.ytdlp_service import YtdlpService
from services.ffmpeg_service import FfmpegService

class AudioPipelineOrchestrator:
    
    def __init__(self, ytdl: YtdlpService, ffmpeg: FfmpegService):
        self.ytdlp = ytdl
        self.ffmpeg = ffmpeg

    async def get_temp_stream_output_path(self, url: str):
        # Run blocking yt-dlp extraction in a thread so event loop stays free
        stream_url = await asyncio.to_thread(self.ytdlp.extract_stream_url, url)

        if not stream_url:
            raise ValueError("Failed to extract stream URL")
        
        job_id, output_path = self.ffmpeg.normalize_audio(stream_url)

        return job_id