const expect = require('expect.js');
const image = require('..');
const fs = require('fs');
const path = require('path');
const http = require('http');
const temp = require('temp'); // .track();
let temporaryDir;

describe('image', function () {
  this.timeout(2000);

  // Create tmp directory
  before(done => {
    temp.mkdir('image', (err, dir) => {
      temporaryDir = dir;
      done(err);
    });
  });

  it('should create a waveform image', async () => {
    const input = path.join(__dirname, 'fixtures/311.opus');
    const output = path.join(temporaryDir, 'out-311.png');

    await image(input, output);
    // Make sure the output file exists
    expect(fs.existsSync(output)).to.be(true);

    // And that it has a size
    const stats = fs.statSync(output);
    expect(stats.size).to.be.above(2000);
  });

  it('should error cleanly for bad input', async () => {
    const input = path.join(__dirname, 'fixtures/zero-length.opus');
    const output = path.join(temporaryDir, 'out-zero-length.png');

    let error;
    try {
      await image(input, output);
    } catch (error_) {
      error = error_;
    }

    expect(error).to.be.ok();
    expect(error).to.be.an(Error);
  });

  it('should error cleanly for bad input', async () => {
    // Bad.opus is a blank audio file that has been truncated (ie. only partially there).
    const input = path.join(__dirname, 'fixtures/bad.opus');
    const output = path.join(temporaryDir, 'out-bad.png');

    let error;
    try {
      await image(input, output);
    } catch (error_) {
      error = error_;
    }

    expect(error).to.be.ok();
    expect(error).to.be.an(Error);
  });

  it('should create a waveform image from a remote file', async () => {
    const server = http.createServer((request, response) => {
      if (/\.opus$/.test(request.url)) {
        const input = fs.createReadStream(path.join(__dirname, 'fixtures', request.url));
        input.pipe(response);
      } else {
        response.end();
      }
    }).listen(0);

    const input = 'http://localhost:' + server.address().port + '/311.opus';
    const output = path.join(temporaryDir, 'out.png');

    await image(input, output);
    // Make sure the output file exists
    expect(fs.existsSync(output)).to.be(true);

    // And that it has a size
    const stats = fs.statSync(output);
    expect(stats.size).to.be.above(2000);
  });
});
