import subprocess
import tempfile


class FfmpegService:
    
    def __init__(self) -> None:
        self.default_bitrate = '128k'
        self.default_format = 'm4a'

    def _get_temp_path(self):
        tmp = tempfile.NamedTemporaryFile(suffix = '.m4a', delete = False)
        return tmp.name

    def normalize_audio(self, input_path: str):
        print("normalizing audio")
        output_path = self._get_temp_path();
        subprocess.run([
            'ffmpeg',
            '-y',
            '-i', input_path,
            '-c:a', 'aac',
            '-b:a', '128k',
            output_path
        ], check = True)

        return output_path