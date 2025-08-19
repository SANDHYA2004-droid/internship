from gtts import gTTS
import playsound
import whisper

# 1. Convert text to speech
text = "Hi there, how are you today?"
tts = gTTS(text=text, lang="en")
tts.save("tts_audio.mp3")
playsound.playsound("tts_audio.mp3")

# 2. Load Whisper model
model = whisper.load_model("small")

# 3. Transcribe the generated speech
result = model.transcribe("tts_audio.mp3")

print("\n=== Transcription ===\n")
print(result["text"])
