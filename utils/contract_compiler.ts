/**
 * @author - rG
 * @resources -
 *  https://github.com/ethereum/solc-js/blob/master/README.md
 *
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import solc from 'solc';

// returns OpenZeppelin's contracts from node_modules as required to compile the custom contract
function findImports(path: string): { contents: string } {
    const imported_contract_path = resolve('./utils/imports', path);
    // console.log(imported_contract_path);
    const imported_contract = readFileSync(imported_contract_path, { encoding: 'utf-8' });
    return {
        contents: imported_contract,
    };
}

// compile the custom contract using solc latest version
export default function compile(contract_code: string, contract_name: string, cb: any): void {
    // complier input
    const input = {
        language: 'Solidity',
        sources: {
            [`${contract_name}.sol`]: {
                content: contract_code,
            },
        },
        settings: {
            outputSelection: {
                '*': {
                    // to output only abi and bytecode for compiled contract
                    '*': ['abi', 'evm.bytecode'],
                },
            },
        },
    };
    // to use specific version on solc (here using 'latest')
    solc.loadRemoteVersion('latest', (err: any, solcSnapshot: any) => {
        if (err) {
            console.log('ERROR');
            console.log(err);
        } else {
            // compiles and parse the output into json format
            const output = JSON.parse(
                solcSnapshot.compile(JSON.stringify(input), {
                    import: findImports,
                }),
            );
            // console.log(output);
            const abi_ = output.contracts[`${contract_name}.sol`][contract_name].abi;
            const bytecode_ = output.contracts[`${contract_name}.sol`][contract_name].evm.bytecode;
            cb({ abi: abi_, bytecode: bytecode_, contract: contract_code });
        }
    });
}
