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
    orchestrator = AudioPipelineOrchestrator(ytdlp_service, ffmpeg_service)
    
    temp_normalized_output_path = orchestrator.get_temp_stream_output_path(url)

    # iterate over chunks of the url connection
    # def iter_audio():
    #     print("iterating temp file chunks")
    #     with open(temp_normalized_output_path, "rb") as f:
    #         while chunk := f.read(1024 * 32):
    #             yield chunk

    # print("returning audio bytes")
    # return StreamingResponse(
    #     iter_audio(),
    #     media_type="audio/mpeg"
    # )

    return FileResponse(
        temp_normalized_output_path, 
        media_type="audio/mp4", 
        headers={
            "Accept-Ranges": "bytes",
            "Content-Disposition": "inline",
        }
    );

@app.get("/download")
async def download(url: str):
    file_path = await asyncio.to_thread(ytdlp_service.download_audio, url)
    return FileResponse(
        path = file_path,
        media_type = "audio/mpeg",
        filename = 'audio.mp3' # todo: proper file name
    )