import assert from 'node:assert/strict';
import { assignPlaythingsHotbarSkill, emptyPlaythingsProfile, inspectPlaythingsSchema, normalizePlaythingsProfile, readPlaythingsProfile, setPlaythingsFollow, upgradePlaythingsSchema, writePlaythingsProfile } from './playthings.profile.js';

let profile = emptyPlaythingsProfile();
profile = inspectPlaythingsSchema(profile, 'tiinex.task.v1');
profile = upgradePlaythingsSchema(profile, 'tiinex.task.v1');
profile = assignPlaythingsHotbarSkill(profile, 2, 'tiinex.task.v1');
profile = setPlaythingsFollow(profile, true);
assert.deepEqual(profile.inspectedSchemaIds, ['tiinex.task.v1']);
assert.deepEqual(profile.upgradedSchemaIds, ['tiinex.task.v1']);
assert.equal(profile.hotbar[2], 'tiinex.task.v1');
assert.equal(profile.followPlaything, true);

const storage = { value: '', getItem() { return this.value; }, setItem(_key, value) { this.value = value; } };
writePlaythingsProfile(profile, storage);
assert.deepEqual(readPlaythingsProfile(storage), profile, 'local presentation progress round-trips without Tiinex artifact state');
const normalized = normalizePlaythingsProfile({ inspectedSchemaIds: ['b', 'a', 'b'], upgradedSchemaIds: ['x', 'x'], hotbar: ['a'], followPlaything: 1 });
assert.deepEqual(normalized.inspectedSchemaIds, ['a', 'b']);
assert.deepEqual(normalized.upgradedSchemaIds, ['x']);
assert.equal(normalized.hotbar.length, 6);
assert.equal(normalized.followPlaything, true);
console.log('✓ Playthings local profile progression passed');
