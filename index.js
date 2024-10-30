import { createCanvas, loadImage } from "canvas";
import fetch from "node-fetch";
import { unShuffle, getGroup, createRange } from "./helper/index.js";
// import fs from "fs";

async function imgReverser(imageUrl, tileSize = 200, shuffleType = "stay") {
   const canvas = createCanvas(200, 200);
   const context = canvas.getContext("2d");
   let retryCount = 0;

   try {
      const response = await fetch(imageUrl);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const image = await loadImage(buffer);

      if (!image) throw new Error("something went wrong");

      const totalTiles = Math.ceil(image.width / tileSize) * Math.ceil(image.height / tileSize);

      canvas.width = image.width;
      canvas.height = image.height;
      const tilesPerRow = Math.ceil(image.width / tileSize);
      const tilePositions = [];

      for (let tileIndex = 0; tileIndex < totalTiles; tileIndex++) {
         const row = Math.floor(tileIndex / tilesPerRow);
         const tilePosition = {
            x: (tileIndex - row * tilesPerRow) * tileSize,
            y: row * tileSize,
         };

         tilePosition.width =
            tileSize -
            (tilePosition.x + tileSize <= image.width
               ? 0
               : tilePosition.x + tileSize - image.width);
         tilePosition.height =
            tileSize -
            (tilePosition.y + tileSize <= image.height
               ? 0
               : tilePosition.y + tileSize - image.height);

         if (!tilePositions[`${tilePosition.width}-${tilePosition.height}`]) {
            tilePositions[`${tilePosition.width}-${tilePosition.height}`] = [];
         }
         tilePositions[`${tilePosition.width}-${tilePosition.height}`].push(tilePosition);
      }

      for (const key in tilePositions) {
         let shuffledIndices = unShuffle(createRange(0, tilePositions[key].length), shuffleType);
         const groupInfo = getGroup(tilePositions[key]);

         for (let index = 0; index < tilePositions[key].length; index++) {
            const tile = tilePositions[key][index];
            const shuffledIndex = shuffledIndices[index];
            const col = Math.floor(shuffledIndex / groupInfo.cols);
            const localX = (shuffledIndex - col * groupInfo.cols) * tile.width;
            const localY = col * tile.height;

            context.drawImage(
               image,
               groupInfo.x + localX,
               groupInfo.y + localY,
               tile.width,
               tile.height,
               tile.x,
               tile.y,
               tile.width,
               tile.height
            );
         }
      }

      return canvas;
   } catch (error) {
      if (retryCount < 5) {
         retryCount++;
         return await imgReverser(imageUrl, tileSize, shuffleType); // Retry on error
      } else {
         console.error("Failed to process image after 5 retries", error);
         return null;
      }
   }
}

// const resolveImage = async () => {
//    const canvas = await imgReverser(url);

//    // Check if canvas exists and is valid
//    if (canvas) {
//       const buffer = canvas.toBuffer("image/png"); // Convert canvas to PNG format
//       if (buffer) {
//          fs.writeFileSync("./output.png", buffer); // Save the image as a PNG
//          console.log("Image saved as output.png");
//       } else {
//          console.error("Failed to create buffer from canvas");
//       }
//    } else {
//       console.error("Canvas is null, image processing failed.");
//    }
// };

// resolveImage();

export default imgReverser;
