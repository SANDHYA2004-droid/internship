import tkinter as tk
from gtts import gTTS
import playsound
import os

def speak():
    text = entry.get()
    if text.strip() == "":
        return
    tts = gTTS(text=text, lang="en")
    tts.save("tts_output.mp3")
    playsound.playsound("tts_output.mp3")
    os.remove("tts_output.mp3")  # cleanup after playing

# Create main window
root = tk.Tk()
root.title("Text to Speech (TTS)")
root.geometry("400x200")

# Input label
label = tk.Label(root, text="Enter text:")
label.pack(pady=10)

# Text entry box
entry = tk.Entry(root, width=40)
entry.pack(pady=5)

# Speak button
button = tk.Button(root, text="Convert to Speech", command=speak)
button.pack(pady=20)

# Run app
root.mainloop()
