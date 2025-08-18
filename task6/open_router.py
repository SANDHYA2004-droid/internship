import tkinter as tk
from tkinter import scrolledtext, messagebox
from openai import OpenAI

# ⚠️ API Key directly in the script
api_key = "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"

if not api_key:
    messagebox.showerror("Error", "API key is missing!")
    exit(1)

# OpenRouter client
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=api_key,
    default_headers={
        "HTTP-Referer": "http://localhost",
        "X-Title": "Tkinter LLM Client"
    }
)

# Function to get response
def get_response():
    user_input = input_box.get("1.0", tk.END).strip()
    if not user_input:
        messagebox.showwarning("Warning", "Please enter a prompt")
        return

    try:
        response = client.chat.completions.create(
            model="openai/gpt-4o",  # ✅ upgraded to GPT-4o (latest version)
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": user_input}
            ]
        )
        output_text = response.choices[0].message.content
        output_box.config(state=tk.NORMAL)
        output_box.delete("1.0", tk.END)
        output_box.insert(tk.END, output_text)
        output_box.config(state=tk.DISABLED)
    except Exception as e:
        messagebox.showerror("Error", str(e))

# Tkinter window
root = tk.Tk()
root.title("OpenRouter AI Chat (GPT-4o)")

# Input box
tk.Label(root, text="Enter Prompt:").pack(anchor="w", padx=5, pady=5)
input_box = scrolledtext.ScrolledText(root, wrap=tk.WORD, width=60, height=5)
input_box.pack(padx=5, pady=5)

# Send button
tk.Button(root, text="Send", command=get_response).pack(pady=5)

# Output box
tk.Label(root, text="Response:").pack(anchor="w", padx=5, pady=5)
output_box = scrolledtext.ScrolledText(root, wrap=tk.WORD, width=60, height=10, state=tk.DISABLED)
output_box.pack(padx=5, pady=5)

root.mainloop()
