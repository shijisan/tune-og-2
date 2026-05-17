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

    # todo: track user/session for job cancel/cleanup
    def cancel_job(self, job_id: str):
        job = self.processes.get(job_id)
        if not job:
            return
        
        process = job["process"]
        if process.poll() is None: 
            process.kill()
        
        # clean up temp file
        import os
        try:
            os.unlink(job["output"])
        except FileNotFoundError:
            pass
        
        del self.processes[job_id]

    # todo: make func to poll job status
