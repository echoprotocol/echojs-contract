# EchoJS-Contract (echojs-contract)

JavaScript library for node.js and browsers for convenient work with Echo-contracts. Can be used to call contracts, sign and broadcast contracts' deployment and execution transactions.

## Setup

This library can be obtained through npm:
```sh
npm install echojs-contract
```

## Preparation

Launched echo node (https://github.com/echoprotocol/echo-core) with open port

## Examples

### Deploy contract
```ts
import { Echo, Contract, PrivateKey } from "echojs-contract";
const echo = new Echo();
await echo.connect('ws://127.0.0.1:6311');
const bytecode = '6080';
const privateKey = PrivateKey.fromWif('5K2YUVmWfxbmvsNxCsfvArXdGXm7d5DC9pn4yD75k2UaSYgkXTh');
const contractId = await Contract.deploy(bytecode, echo, privateKey);
// or pass abi in options to get contract instance instead of new contract id
const contract = await Contract.deploy(bytecode, echo, privateKey, { abi: require("abi.json") });
```

### Create contract instance by contract id
```ts
const contract = new Contract(abi, { echo, contractId: '1.14.123' });
```

### Call contract no changing state
```ts
const result = await contract.methods.mathodName(arg).call();
```

### Execute contract
```ts
const broadcastingResult = await contract.methods.mathodName(arg).broadcast({ privateKey });
const result = broadcastingResult.decodedResult;
// you can find more information about transaction in this fields:
const { transactionResult, contractResult, events } = broadcastingResult;
```

### Using encoders/decoders
```ts
import { encode, BigNumber } from "echojs-contract";

encode({ value: false, type: 'bool' });
encode({ value: [1, '2', new BigNumber(3)], type: 'uint8[]' });

decode({
	value: '00000000000000000000000000000000fffffffffffffffffffb9d2ac2e07341',
	type: 'int128',
});
// returns new BigNumber(-1234567899876543)
```

## Run Tests

Tests use a locally running Echo node. Therefore, before starting the tests, 
you need to start Echo with predefined configuration parameters.

After the node is started, you can run the tests:

```sh
npm run test
```

## Contributing

Read our [Contributing Guide](https://github.com/echoprotocol/echojs-contract/CONTRIBUTING.md) to learn about our development process, how to propose bugfixes and improvements.

## License

The MIT License

Copyright (c) Pixelplex, Inc. https://pixelplex.io

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
