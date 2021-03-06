const commandExists = require('command-exists').sync;
const debug = require('debug')('ns-audio:image');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const fsPromises = require('fs').promises;
const get = require('lodash.get');
const gnuplot = commandExists('gnuplot') ? 'gnuplot' : 'gnuplot-nox';
const isFiniteNumber = require('lodash.isfinite');
const pEvent = require('p-event');
const spawn = require('child_process').spawn;
const tempy = require('tempy');

// Handle ffmpeg-static and ffprobe static optional deps.
let ffmpegPath;
let ffprobePath;
try {
  ffmpegPath = require('ffmpeg-static');
} catch {
  ffmpegPath = 'ffmpeg';
}

try {
  ffprobePath = require('ffprobe-static').path;
} catch {
  ffprobePath = 'ffprobe';
}

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

function getDuration (filename) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filename, (err, metadata) => {
      if (err) return reject(err);
      const duration = get(metadata, 'streams[0].duration');
      if (!isFiniteNumber(duration)) {
        reject(new Error('failed to parse audio track'));
        return;
      }

      resolve(Number.parseFloat(duration));
    });
  });
}

function plotArgs (output, width) {
  return [
    '-p', '-e', [
      'set terminal png transparent truecolor size ' + width + ',100',
      'set output "' + output + '"',
      'unset key',
      'unset tics',
      'unset border',
      'set lmargin 0',
      'set rmargin 0',
      'set tmargin 0',
      'set bmargin 0',
      "plot '<cat' binary filetype=bin format='%int16' endian=little array=1:0 lc '#000000' with lines"
    ].join(';') + ';'
  ];
}

async function generatePCM (input, ffmpegOutput) {
  return new Promise((resolve, reject) => {
    const command = ffmpeg()
      .input(input)
      .withAudioCodec('pcm_s16le')
      .withAudioChannels(1)
      .withAudioFrequency(2000)
      .withOutputOptions(['-map', '0:a'])
      .withOutputFormat('data')
      .output(ffmpegOutput)
      .on('start', cmd => debug('ffmpeg command: %s', cmd))
      .on('error', reject)
      .on('end', resolve);

    command.run();
  });
}

/**
 * @param {string} inputFile
 * @param {string} output path to output file
 */
async function waveFormImage (input, output) {
  const ffmpegOutput = tempy.file();
  const duration = await getDuration(input);
  const width = Math.round(duration * 100);

  await generatePCM(input, ffmpegOutput);

  const inFile = fs.createReadStream(ffmpegOutput);
  const plotProc = spawn(gnuplot, plotArgs(output, width), { stdio: ['pipe', process.stdout, process.stdout] });
  inFile.pipe(plotProc.stdin);

  const code = await pEvent(plotProc, 'exit');
  try {
    // Clean up temporary file.
    await fsPromises.unlink(ffmpegOutput);
  } catch (error) {
    console.error(error);
  }

  if (code !== undefined && code !== 0) {
    throw new Error('gnuplot exited with code: ' + code);
  }
}

module.exports = waveFormImage;
