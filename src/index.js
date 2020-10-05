const debug = require('debug')('ns-audio:image');
const request = require('request');
const path = require('path');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const commandExists = require('command-exists').sync;
const gnuplot = commandExists('gnuplot') ? 'gnuplot' : 'gnuplot-nox';
const spawn = require('child_process').spawn;
const tmp = require('temp');

ffmpeg.setFfmpegPath(require('ffmpeg-static'));
ffmpeg.setFfprobePath(require('ffprobe-static').path);

function _getLocalFile (input) {
  return new Promise((resolve, reject) => {
    if (!/^https?:/.test(input)) {
      resolve(input);
      return;
    }

    // Download file...
    const temporaryDir = tmp.mkdirSync('ns-audio'); // New temp dir each time incase of name conflicts
    const filename = path.resolve(temporaryDir, path.basename(input));
    const file = fs.createWriteStream(filename);
    file.on('finish', () => resolve(filename));
    file.on('error', reject);
    request.get(input).pipe(file);
  });
}

function _getDuration (filename) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filename, (err, metadata) => {
      if (err) return reject(err);
      const duration = metadata.streams && metadata.streams.length && Number.parseFloat(metadata.streams[0].duration);
      if (Number.isNaN(duration)) {
        reject(new Error('failed to parse audio track'));
        return;
      }

      resolve(duration);
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

module.exports = async function (input, output, done) {
  const ffmpegOutput = tmp.path();
  let width;
  try {
    const filename = await _getLocalFile(input);
    const duration = await _getDuration(filename);
    width = Math.round(duration * 100);

    const command = ffmpeg()
      .input(filename)
      .withAudioCodec('pcm_s16le')
      .withAudioChannels(1)
      .withAudioFrequency(2000)
      .withOutputOptions(['-map', '0:a'])
      .withOutputFormat('data')
      .output(ffmpegOutput)
      .on('start', cmd => debug('ffmpeg command: %s', cmd))
      .on('error', err => done(err))
      .on('end', ffmpegDone);

    command.run();
  } catch (error) {
    return done(error);
  }

  function ffmpegDone () {
    const inFile = fs.createReadStream(ffmpegOutput);
    const plotProc = spawn(gnuplot, plotArgs(output, width), { stdio: ['pipe', process.stdout, process.stdout] });
    inFile.pipe(plotProc.stdin);

    plotProc.on('exit', (code, signal) => {
      if (code !== undefined && code !== 0) {
        return done(new Error('image exited with code: ' + code));
      }

      done();
    });
  }
};
