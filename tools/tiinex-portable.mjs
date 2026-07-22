#!/usr/bin/env node
import { runPortableCli } from '../src/tooling/portable/adapters/cli/cli.run.js';

const exitCode = await runPortableCli(process.argv.slice(2), console);
process.exitCode = exitCode;
