/* Paint static scenery with cover cropping, preserving the illustration's aspect ratio. */
function drawSceneCover(context, image, x, y, width, height) {
  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;
  const scale = Math.max(width / sourceWidth, height / sourceHeight);
  const cropWidth = width / scale;
  const cropHeight = height / scale;
  context.drawImage(image, (sourceWidth - cropWidth) / 2, (sourceHeight - cropHeight) / 2,
    cropWidth, cropHeight, x, y, width, height);
}
