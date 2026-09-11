import test from 'node:test';import assert from 'node:assert/strict';
import config from '../tiinex.config.js';
import {createTiinexApplicationRuntime} from '@tiinex/app';
import {createAppVerseModel} from '@tiinex/verse-playthings/app';
test('Site config registers the real lazy Playthings package, not source internals',()=>{const runtime=createTiinexApplicationRuntime(config);assert.equal(runtime.verses.has('playthings'),true);const model=createAppVerseModel({applicationData:runtime.getSnapshot(),getPlaythingsStoryRecords:runtime.getPlaythingsStoryRecords});assert.equal(model.story.records.length,0);});
