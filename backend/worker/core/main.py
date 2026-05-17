import os
from fastapi import FastAPI
from fastapi.responses import StreamingResponse, FileResponse
from core.orchestrators.audio_pipeline_orchestrator import AudioPipelineOrchestrator
from services.ytdlp_service import YtdlpService
from services.ffmpeg_service import FfmpegService
import asyncio

app = FastAPI()
ytdlp_service = YtdlpService()
ffmpeg_service = FfmpegService()

# todo: add try-catches

@app.get("/test")
async def test():
    print("Test working!")


@app.get('/stream')
async def stream(url: str):
    print("hit stream worker")
    orchestrator = AudioPipelineOrchestrator(ytdlp_service, ffmpeg_service)
    job_id = await orchestrator.get_temp_stream_output_path(url)

    job = ffmpeg_service.processes.get(job_id)
    if job:
        await asyncio.to_thread(job["process"].wait)
        
        if job["process"].returncode != 0:
            return {"error": "ffmpeg failed"}

    return {"url": f"/audio/{job_id}"}



@app.get("/audio/{job_id}")
async def audio(job_id: str):
    print("hit audio worker")
    job = ffmpeg_service.processes.get(job_id)
    if not job:
        return {"error": "not found"}

    return FileResponse(
        job["output"],
        media_type="audio/ogg",
        headers={"Accept-Ranges": "bytes", "Content-Disposition": "inline"}
    )

@app.get("/download")
async def download(url: str):
    file_path = await asyncio.to_thread(ytdlp_service.download_audio, url)
    return FileResponse(
        path = file_path,
        media_type = "audio/mpeg",
        filename = 'audio.mp3' # todo: proper file name
    )