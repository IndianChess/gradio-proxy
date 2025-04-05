// server.mjs
import express from "express";
import cors from "cors";
import { Client } from "@gradio/client";

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS so your mobile app can access the proxy server
app.use(cors());
// Parse JSON bodies
app.use(express.json());

// Replace with your Gradio space identifier
const GRADIO_SPACE = "Nymbo/Qwen2.5-Coder-32B-Instruct-Serverless";

// Helper function to connect to Gradio
async function getGradioClient() {
  try {
    const clientInstance = await Client.connect(GRADIO_SPACE);
    return clientInstance;
  } catch (error) {
    console.error("Error connecting to Gradio:", error);
    throw error;
  }
}

/**
 * POST /predict
 *
 * Expects a JSON body:
 * {
 *   "endpoint": "/chat",
 *   "payload": {
 *      message: "user prompt",
 *      system_message: "You are a helpful AI assistant.",
 *      max_tokens: 512,
 *      temperature: 0.7,
 *      top_p: 0.95
 *   }
 * }
 */
app.post("/predict", async (req, res) => {
  try {
    const { endpoint, payload } = req.body;
    if (!endpoint || !payload) {
      return res.status(400).json({
        error: "Both 'endpoint' and 'payload' are required."
      });
    }

    const gradioApp = await getGradioClient();
    const result = await gradioApp.predict(endpoint, payload);
    res.json({ data: result.data });
  } catch (error) {
    console.error("Prediction error:", error);
    res.status(500).json({
      error: error.message || "Prediction failed on the proxy."
    });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server listening on port ${PORT}`);
});
