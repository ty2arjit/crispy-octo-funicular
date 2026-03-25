const axios = require("axios");

const HF_API_BASE = "https://api-inference.huggingface.co/models";
const DEFAULT_TTS_MODEL = process.env.HUGGINGFACE_TTS_MODEL || "espnet/kan-bayashi_ljspeech_vits";

async function callHuggingFace(model, payload, timeout = 25000) {
  const token = process.env.HUGGINGFACE_API_KEY;
  if (!token) {
    return null;
  }

  try {
    const response = await axios.post(`${HF_API_BASE}/${model}`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      responseType: "arraybuffer",
      timeout
    });

    return response.data;
  } catch (error) {
    return null;
  }
}

async function synthesizeSpeech(text) {
  if (!text || !text.trim()) {
    return null;
  }

  const buffer = await callHuggingFace(DEFAULT_TTS_MODEL, {
    inputs: text.trim().slice(0, 1200)
  });

  if (!buffer) {
    return null;
  }

  const base64 = Buffer.from(buffer).toString("base64");
  return `data:audio/wav;base64,${base64}`;
}

module.exports = {
  synthesizeSpeech
};
