# waveform-image

> Generate a waveform image.

## Purpose
Generate a PNG file that represents a given waveform graphically.

## Usage
```js
const waveformImage = require('waveform-image');

(async () => {
	try {
    await waveformImage('/path/to/file.wav', '/path/to/output/image.png');
    // '/path/to/output/image.png' should now exist
	} catch (error) {
    // something went wrong
    console.error(error);
	}
})();
```

`ffmpeg-static` and `ffprobe-static` are optional dependencies.  If they are not installed, `ffprobe` and `ffmpeg` are
assumed to exist in the path.


## API

### waveformImage(input, output)

Returns a `Promise` that is fulfilled when `output` has been created.

## Installation

This module is installed via npm:


``` bash
$ npm install waveform-image

```

## Contributing

### Prerequisites

```
$ pip install pre-commit
```

### Installation

```
$ pre-commit install --install-hooks
```

## License

The BSD License

Copyright (c) 2020, Tim Allen

All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice, this
  list of conditions and the following disclaimer in the documentation and/or
  other materials provided with the distribution.

* Neither the name of the copyright holder nor the names of its
  contributors may be used to endorse or promote products derived from
  this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

