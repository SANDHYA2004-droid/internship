import whisper

# Load once (will be reused from cache after first time)
model = whisper.load_model("small")

# Transcribe your file
result = model.transcribe("ttsMP3.com_VoiceText_2025-8-19_19-46-39.mp3")

print(result["text"])
