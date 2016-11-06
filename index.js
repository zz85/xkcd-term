const xkcd = require('xkcd');
const http = require('http');
const PNG = require('pngjs').PNG;
const drawille = require('drawille');

// TODO
// add arrow keys to zoom into image?
// download real images?
// better resizing

// Get the current xkcd
xkcd(function (data) {
  console.log(data);

  const { title, alt, img } = data;
  console.log(title);

  http.get(img, (res) => {
    if (res.statusCode !== 200) {
      console.error('Oops error fetching image');
      res.resume();
      return;
    }

    res.pipe(new PNG({
      filterType: 4
    }))
    .on('parsed', function() {
      console.log('PNG parsed!', this.width, this.height);
     
      SCALE = 0.3334;
      const targetRows = Math.ceil(this.width / 2 * SCALE);
      const targetCols = Math.ceil(this.height / 4 * SCALE);

      const tw = targetRows * 2;
      const th = targetCols * 4;

      const canvas = new drawille(tw, th);
      data = this.data

      for (let y = 0; y < th; y++) {
        for (let x = 0; x < tw; x++) {
          sx = x / tw * this.width | 0;
          sy = y / th * this.height | 0;

          p = (sy * this.width + sx) * 4;
          r = data[p + 0] / 255;
          g = data[p + 1] / 255;
          b = data[p + 2] / 255;
          a = data[p + 3] / 255;

          intensity = (0.2126 * r + 0.7152 * g + 0.0722 * b) * a;
          if (intensity < 0.8) canvas.set(x, y);
        }
      }
      console.log('\n' + canvas.frame())

      console.log('\n' + alt);

    })
  }).on('error', (e) => {
   console.log(`Got error: ${e.message}`);
  });

});

