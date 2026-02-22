"""
=============================================================
GEMINI 2.5 FLASH TTS - BACKUP IMPLEMENTATION
=============================================================
This was the original TTS implementation using Google's Gemini 2.5 Flash
multimodal model to generate speech audio inline.

REPLACED BY: Kokoro-82M via HuggingFace Inference API (faster, higher quality)

HOW IT WORKED:
- The Lambda received a voice request (source: 'voice')
- After generating the text answer via Gemini, it called Gemini 2.5 Flash again
  with response_modalities=["AUDIO"] to generate speech
- Audio bytes were base64-encoded and returned as {"text": ..., "audio": ...}
- The frontend voicecall.js playAudio() decoded and played the base64 WAV

DEPENDENCIES:
- google-genai SDK (already in requirements.txt)
- Gemini API key (GEMINI_API_KEY env var)
- types.SpeechConfig, types.VoiceConfig, types.PrebuiltVoiceConfig

VOICE OPTIONS (Gemini built-in voices):
- 'Puck'   - Default used, neutral male
- 'Aoede'  - Female voice
- 'Charon' - Male voice
- 'Fenrir' - Male voice (deeper)
- 'Kore'   - Female voice
Full list: https://ai.google.dev/gemini-api/docs/speech-generation
=============================================================

ORIGINAL CODE SNIPPET (drop-in replacement for the TTS block in chatbot_handler.py):
--------------------------------------------------------------

# If voice mode is active, generate audio for the response
if is_voice and text_response and not text_response.startswith("[ERR"):
    try:
        # Generate audio using Gemini 2.5 Flash TTS
        audio_response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=text_response,
            config=types.GenerateContentConfig(
                response_modalities=["AUDIO"],
                speech_config=types.SpeechConfig(
                    voice_config=types.VoiceConfig(
                        prebuilt_voice_config=types.PrebuiltVoiceConfig(
                            voice_name='Puck',
                        )
                    )
                ),
            )
        )

        # Extract audio data
        if audio_response.candidates and audio_response.candidates[0].content.parts:
            for part in audio_response.candidates[0].content.parts:
                if part.inline_data and part.inline_data.data:
                    import base64
                    # The data is already bytes, base64 encode for JSON transport
                    audio_b64 = base64.b64encode(part.inline_data.data).decode('utf-8')
                    return {"text": text_response, "audio": audio_b64}
    except Exception as e:
        print(f"TTS Generation Error: {str(e)}")
        # Fallback to just text if TTS fails
        pass

--------------------------------------------------------------

WHY IT WAS SLOW:
- Two sequential Gemini API calls per voice message (chat answer + TTS)
- Gemini 2.5 Flash TTS adds 2-5 seconds of latency on top of the answer latency
- Audio quality while decent, sounds slightly robotic/synthesized

NOTES FOR RE-ENABLING:
1. Swap the Kokoro block in chatbot_handler.py with the snippet above
2. No additional env vars needed (reuses GEMINI_API_KEY)
3. No extra dependencies needed (reuses google-genai SDK)
4. The frontend playAudio() function is compatible with both implementations
   (both return base64-encoded WAV/PCM audio)
"""
