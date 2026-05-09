from services.ytdlp_service import YtdlpService
from services.ffmpeg_service import FfmpegService

class AudioPipelineOrchestrator:
    
    def __init__(self, ytdl: YtdlpService, ffmpeg: FfmpegService):
        self.ytdlp = ytdl
        self.ffmpeg = ffmpeg

    def get_temp_stream_output_path(self, url:str):
        stream_url = self.ytdlp.extract_stream_url(url)

        if not stream_url:
            raise ValueError("Failed to extract stream URL")
        
        temp_normalized_output_path = self.ffmpeg.normalize_audio(stream_url)

        return temp_normalized_output_path
        