const sharp = require("sharp");

module.exports = convertImage = async (data) => {
  for (let i = 0; i < data.length; i++) {
    if (data[i].image) {
      const imagePath = "./images/" + data[i].image;
      const imageBuffer = await sharp(imagePath)
        .resize(100)
        .jpeg({ quality: 100 })
        .toBuffer();
      data[i].image = imageBuffer.toString("base64");
    }
  }
}