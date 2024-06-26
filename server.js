require("dotenv").config();
const PORT = 8000;
const express = require("express");
const cors = require("cors");
const app = express();
const multer = require("multer");
const fs = require("fs");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// GoogleGenerativeAI required config
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

// Model initialization
const modelId = "gemini-pro-vision";
const model = genAI.getGenerativeModel({ model: modelId });

app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage }).single("file");

let filePath = "";

// Endpoint to handle file uploads
app.post("/upload", (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "File upload failed", details: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    filePath = req.file.path;
    res
      .status(200)
      .json({ message: "File uploaded successfully", filePath: filePath });
  });
});

// Endpoint to handle Google Generative AI (Gemini) requests
app.post("/gemini", async (req, res) => {
  try {
    const prompt = req.body.message;
    if (!prompt) {
      return res.status(400).json({ error: "No prompt provided" });
    }
    if (!filePath) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    console.log("Prompt:", prompt);
    const imageAsBase64 = fs.readFileSync(filePath, "base64");

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: imageAsBase64,
        },
      },
    ]);

    const responseText = result.response.text();
    console.log("Response:", responseText);
    res.json({ response: responseText });
  } catch (e) {
    console.error("Error:", e);
    res
      .status(500)
      .json({ message: "Internal server error", details: e.message });
  }
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
