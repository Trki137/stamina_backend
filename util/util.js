const sharp = require("sharp");

module.exports = convertImage = async (data) => {
  for (let i = 0; i < data.length; i++) {
    if (data[i].image && !data[i].image.startsWith("http")) {
      const imagePath = "./images/" + data[i].image;
      console.log(imagePath)
      const imageBuffer = await sharp(imagePath)
        .resize(100)
        .jpeg({ quality: 100 })
        .toBuffer();
      data[i].image = imageBuffer.toString("base64");
    }
  }
}