import { beginNavigationMotion, subscribeNavigationMotion, getNavigationMotionSnapshot } from './navigationMotion';

let releases, subscriptions;
beforeEach(() => { releases = []; subscriptions = []; });
afterEach(() => { releases.forEach(release => release()); subscriptions.forEach(unsubscribe => unsubscribe()); });
const begin = () => { const release = beginNavigationMotion(); releases.push(release); return release; };
const subscribe = listener => { const unsubscribe = subscribeNavigationMotion(listener); subscriptions.push(unsubscribe); return unsubscribe; };

test('reports actual motion only until its idempotent token is released', () => {
 expect(getNavigationMotionSnapshot()).toBe(false);
 const release = begin();
 expect(getNavigationMotionSnapshot()).toBe(true);
 release();
 expect(getNavigationMotionSnapshot()).toBe(false);
 release();
 expect(getNavigationMotionSnapshot()).toBe(false);
});

test('overlapping gestures notify only boolean changes and never create a short false idle', () => {
 const changes = [];
 subscribe(() => changes.push(getNavigationMotionSnapshot()));
 const old = begin();
 const current = begin();
 old();
 expect(getNavigationMotionSnapshot()).toBe(true);
 expect(changes).toEqual([true]);
 current();
 expect(changes).toEqual([true, false]);
});

test('an obsolete release cannot end a later gesture', () => {
 const old = begin();
 old();
 const current = begin();
 old();
 expect(getNavigationMotionSnapshot()).toBe(true);
 current();
 expect(getNavigationMotionSnapshot()).toBe(false);
});

test('unsubscribed observers receive no later motion updates', () => {
 const changes = [];
 const unsubscribe = subscribe(() => changes.push(getNavigationMotionSnapshot()));
 const release = begin();
 unsubscribe();
 release();
 expect(changes).toEqual([true]);
 expect(getNavigationMotionSnapshot()).toBe(false);
});

test('one failing observer cannot strand motion or stop the remaining observers', () => {
 const changes = [];
 subscribe(() => { throw new Error('observer failed'); });
 subscribe(() => changes.push(getNavigationMotionSnapshot()));
 let release;
 expect(() => { release = begin(); }).not.toThrow();
 expect(getNavigationMotionSnapshot()).toBe(true);
 expect(() => release()).not.toThrow();
 expect(changes).toEqual([true, false]);
});
