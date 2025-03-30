import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toWords } from "number-to-words"; // Import number-to-words library

const API_BASE_URL = "http://localhost:5000";
const ELEVENLABS_API_KEY =
  "sk_ac572e2e4516ff2e476855d7cda48fcc403d48768f0dde00"; // Replace with your ElevenLabs key
const ELEVENLABS_VOICE_ID = "EXAVITQu4vr4xnSDxMaL"; // Replace with the desired voice ID

const App = () => {
  const [commentary, setCommentary] = useState("");
  const [liveFeed, setLiveFeed] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechRef = useRef(null);

  const removeEmojis = (text) => {
    return text.replace(
      /[\p{Emoji_Presentation}\p{Emoji}\p{Extended_Pictographic}]/gu,
      ""
    );
  };

  useEffect(() => {
    const fetchLiveFeed = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/live_feed`);
        setLiveFeed(response.data);
      } catch (error) {
        console.error("Error fetching live feed:", error);
      }
    };
    fetchLiveFeed();
  }, []);

  // Convert numbers to words for TTS but keep digits in the UI commentary
  const replaceNumbersWithWords = (text) => {
    return text.replace(/\b\d+\b/g, (match) => {
      return `${match} (${toWords(match)})`;
    });
  };

  // ElevenLabs Text-to-Speech (TTS) function
  const speakWithElevenLabs = async (text) => {
    try {
      setIsSpeaking(true);
      const cleanedText = removeEmojis(text);

      const response = await axios.post(
        `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
        {
          text: cleanedText,
          model_id: "eleven_monolingual_v1",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.8,
            style: 0.6,
            use_speaker_boost: true,
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
            "xi-api-key": ELEVENLABS_API_KEY,
          },
          responseType: "arraybuffer",
        }
      );

      const audioBlob = new Blob([response.data], { type: "audio/mpeg" });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      audio.onended = () => setIsSpeaking(false);
      audio.play();
    } catch (error) {
      console.error("Error with ElevenLabs TTS:", error);
      setIsSpeaking(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "auto",
        padding: "30px",
        fontFamily: "Arial",
      }}
    >
      <h1>Quidditch ML Commentary with ElevenLabs TTS</h1>

      {commentary && (
        <div
          style={{
            padding: "20px",
            background: "#f0f0f0",
            marginBottom: "30px",
          }}
        >
          <h3>Generated Commentary:</h3>
          <p>{commentary}</p>

          <button
            onClick={() =>
              speakWithElevenLabs(replaceNumbersWithWords(commentary))
            }
            style={{
              padding: "10px",
              background: isSpeaking ? "orange" : "blue",
              color: "white",
              border: "none",
            }}
          >
            {isSpeaking ? "Playing..." : "Play Commentary"}
          </button>
        </div>
      )}

      <h2>Live Commentary Feed</h2>
      <div
        style={{
          maxHeight: "400px",
          overflowY: "auto",
          border: "1px solid #ddd",
          padding: "20px",
        }}
      >
        {liveFeed.map((entry, index) => (
          <p key={index}>
            <b>{entry.timestamp}:</b> {entry.commentary}
          </p>
        ))}
      </div>
    </div>
  );
};

export default App;
