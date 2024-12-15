"use client";

// pages/index.js
import React, { useState } from "react";

function Home() {
  const [image, setImage] = useState(null);
  const [results, setResults] = useState(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const rgbToHsv = (r, g, b) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
    let h = 0;

    if (delta !== 0) {
      if (max === r) {
        h = ((g - b) / delta + (g < b ? 6 : 0)) % 6;
      } else if (max === g) {
        h = (b - r) / delta + 2;
      } else {
        h = (r - g) / delta + 4;
      }
    }
    h = Math.round(h * 60);

    const s = max === 0 ? 0 : delta / max;
    const v = max;

    return [h, s * 100, v * 100];
  };

  const processImage = () => {
    if (!image) return;

    // Create a canvas to process the image
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      context.drawImage(img, 0, 0);

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;

      let greenPixels = 0;
      let redPixels = 0;
      let bluePixels = 0;
      let totalPixels = pixels.length / 4;

      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];

        const [h, s, v] = rgbToHsv(r, g, b);

        // Define green as Hue between 60-120, with sufficient saturation and brightness
        if (h >= 40 && h <= 120 && s > 40 && v > 30) {
          greenPixels++;
        }

        // Define red as Hue between 0-20 or 340-360, with sufficient saturation and brightness
        if ((h >= 0 && h <= 30) || (h >= 300 && h <= 360) && s > 40 && v > 30) {
          redPixels++;
        }

        // Define blue as Hue between 180-240, with sufficient saturation and brightness
        if (h >= 130 && h <= 290 && s > 20 && v > 10) {
          bluePixels++;
        }
      }

      const greenPercentage = ((greenPixels / totalPixels) * 100).toFixed(2);
      const redPercentage = ((redPixels / totalPixels) * 100).toFixed(2);
      const bluePercentage = ((bluePixels / totalPixels) * 100).toFixed(2);
      setResults({ greenPercentage, redPercentage, bluePercentage });
    };

    img.src = image;
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Analiza Obrazu</h1>
      <input type="file" accept="image/*" onChange={handleImageUpload} />

      {image && (
        <div>
          <img src={image} alt="Uploaded" style={{ maxWidth: "100%", marginTop: "20px" }} />
          <button onClick={processImage} style={{ display: "block", margin: "20px 0" }}>
            Analizuj Obraz
          </button>
        </div>
      )}

      {results && (
        <div>
          <h2>Wyniki Analizy</h2>
          <p>Tereny zielone: {results.greenPercentage}%</p>
          <p>Tereny czerwone: {results.redPercentage}%</p>
          <p>Tereny niebieskie: {results.bluePercentage}%</p>
        </div>
      )}
    </div>
  );
}

export default Home;
