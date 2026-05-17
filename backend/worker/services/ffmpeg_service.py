import subprocess
import tempfile
import uuid


class FfmpegService:
    
    def __init__(self) -> None:
        self.default_bitrate = '128k'
        self.default_format = 'mpeg'
        self.processes = {}

    def _get_temp_path(self):
        tmp = tempfile.NamedTemporaryFile(suffix = '.mp3', delete = False)
        tmp.close()
        return tmp.name

    def normalize_audio(self, input_path: str):
        print("normalizing audio")
        output_path = self._get_temp_path().replace('.mp3', '.opus')
        job_id = str(uuid.uuid4())
        
        process = subprocess.Popen([
            'ffmpeg',
            '-y',
            '-i', input_path,
            '-c:a', 'copy',  # no transcoding, just remux
            output_path
        ],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )

        self.processes[job_id] = {
            "process": process,
            "output": output_path
        }

        return job_id, output_path

    # todo: make func to poll job status
