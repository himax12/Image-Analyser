import { useState } from "react";

const App = () => {
  const [image, setImage] = useState(null);
  const [value, setValue] = useState("");
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");
  const surpriseOptions = [
    "What does image contain",
    "Is image blue",
    "Does image have puppies",
  ];

  const surprise = () => {
    const randomValue =
      surpriseOptions[Math.floor(Math.random() * surpriseOptions.length)];
    setValue(randomValue);
  };

  const clear = () => {
    setImage(null);
    setValue("");
    setError("");
    setResponse("");
  };

  console.log(value);

  const analyzeImage = async () => {
    setResponse("");
    setError("");
    if (!image) {
      setError("ERR! No image has been set");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("file", image);
      formData.append("message", value);

      const options = {
        method: "POST",
        body: formData,
      };
      const res = await fetch("http://localhost:8000/gemini", options);
      const data = await res.json();
      setResponse(data.response);
    } catch (err) {
      console.log(err);
      setError("Something didn't work! Try again");
    }
  };

  const uploadImage = async (e) => {
    const formData = new FormData();
    formData.append("file", e.target.files[0]);

    setImage(e.target.files[0]);
    e.target.value = null;

    try {
      const options = {
        method: "POST",
        body: formData,
      };
      const res = await fetch("http://localhost:8000/upload", options);
      const data = await res.json();
      console.log(data);
    } catch (err) {
      console.log(err);
      setError("Something didn't work! Try again");
    }
  };

  return (
    <div className="App">
      <section className="search-section">
        <div className="img-container">
          {image && <img src={URL.createObjectURL(image)} alt="Uploaded" />}
        </div>
        <p className="extra-info">
          <span>
            <label htmlFor="file">Upload an image </label>
            <input
              onChange={uploadImage}
              id="file"
              accept="image/*"
              type="file"
              hidden
            />
          </span>
          to ask questions about
        </p>
        <p>
          What do you want to know about the image?
          <button className="surprise" onClick={surprise} disabled={response}>
            Surprise me
          </button>
        </p>
        <div className="input-container">
          <input
            value={value}
            placeholder="What's the image"
            onChange={(e) => setValue(e.target.value)}
          />
          {!response && !error && (
            <button onClick={analyzeImage}>Ask me</button>
          )}
          {(response || error) && <button onClick={clear}>Clear</button>}
        </div>
        {error && <p className="error">{error}</p>}
        {response && <p className="response">{response}</p>}
      </section>
    </div>
  );
};

export default App;
