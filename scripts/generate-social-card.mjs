import sharp from 'sharp';
await sharp('src/assets/og-default.svg').png().toFile('public/og-default.png');
