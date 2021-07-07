/* eslint-env mocha */
const expect = require('chai').expect;
const image = require('..');
const fs = require('fs');
const path = require('path');
const tempy = require('tempy');

let temporaryDir;

describe('image', () => {
  // Create tmp directory
  before(() => {
    temporaryDir = tempy.directory();
  });

  it('should create a waveform image', async function () {
    this.timeout(10000);
    const input = path.join(__dirname, 'fixtures/311.opus');
    const output = path.join(temporaryDir, 'out-311.png');

    await image(input, output);
    // Make sure the output file exists
    expect(fs.existsSync(output)).to.equal(true);

    // And that it has a size
    const stats = fs.statSync(output);
    expect(stats.size).to.be.above(2000);
  });

  it('should error cleanly for bad input', async () => {
    const input = path.join(__dirname, 'fixtures/zero-length.opus');
    const output = path.join(temporaryDir, 'out-zero-length.png');

    await expect(image(input, output)).to.be.rejectedWith(Error, 'Invalid data found');
  });

  it('should error cleanly for bad input', async () => {
    // Bad.opus is a blank audio file that has been truncated (ie. only partially there).
    const input = path.join(__dirname, 'fixtures/bad.opus');
    const output = path.join(temporaryDir, 'out-bad.png');

    await expect(image(input, output)).to.be.rejectedWith(Error, 'failed to parse');
  });
});
