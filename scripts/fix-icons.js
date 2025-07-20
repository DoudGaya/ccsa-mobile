const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function fixIcons() {
  const assetsDir = path.join(__dirname, '..', 'assets');
  
  // Define icon requirements
  const icons = [
    {
      input: path.join(assetsDir, 'icon.png'),
      output: path.join(assetsDir, 'icon.png'),
      size: 1024,
      description: 'App Icon'
    },
    {
      input: path.join(assetsDir, 'adaptive-icon.png'),
      output: path.join(assetsDir, 'adaptive-icon.png'),
      size: 1024,
      description: 'Adaptive Icon'
    }
  ];

  console.log('🔧 Fixing icon dimensions...\n');

  for (const icon of icons) {
    try {
      // Check if input file exists
      if (!fs.existsSync(icon.input)) {
        console.log(`❌ ${icon.description}: Input file not found at ${icon.input}`);
        continue;
      }

      // Get original dimensions
      const metadata = await sharp(icon.input).metadata();
      console.log(`📏 ${icon.description}: Original dimensions ${metadata.width}x${metadata.height}`);

      // Create backup
      const backupPath = icon.input.replace('.png', '.backup.png');
      if (!fs.existsSync(backupPath)) {
        fs.copyFileSync(icon.input, backupPath);
        console.log(`💾 ${icon.description}: Backup created at ${backupPath}`);
      }

      // Resize to square with white background and center the image
      const tempOutput = icon.output.replace('.png', '.temp.png');
      await sharp(icon.input)
        .resize(icon.size, icon.size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 } // Transparent background
        })
        .png()
        .toFile(tempOutput);

      // Replace original with resized version
      fs.renameSync(tempOutput, icon.output);

      console.log(`✅ ${icon.description}: Resized to ${icon.size}x${icon.size} and saved to ${icon.output}`);

    } catch (error) {
      console.error(`❌ ${icon.description}: Error processing - ${error.message}`);
    }
  }

  console.log('\n🎉 Icon fixing complete!');
  console.log('Run "npm run doctor" to verify the fixes.');
}

fixIcons().catch(console.error);
