import { createProfileRenderGate } from './profileScenePreparation';

function gpuBoundary() {
  const scene = {}, camera = {}, first = {}, second = {};
  let firstReady = false, secondReady = false;
  const programs = new Map([
    [first, { currentProgram: { isReady: () => firstReady } }],
    [second, { currentProgram: { isReady: () => secondReady } }],
  ]);
  const renderer = {
    compile: jest.fn(() => new Set([first, second])),
    properties: { get: material => programs.get(material) },
    clear: jest.fn(), render: jest.fn(),
  };
  return { scene, camera, renderer, readyFirst: () => { firstReady = true; }, readySecond: () => { secondReady = true; } };
}

test('populated drawing waits for every pending shader without blocking or starting timers', () => {
  jest.useFakeTimers();
  const gpu = gpuBoundary();
  const gate = createProfileRenderGate(gpu.renderer, gpu.scene);
  expect(gate.render(gpu.camera)).toBe(false);
  gpu.readyFirst();
  expect(gate.render(gpu.camera)).toBe(false);
  expect(gpu.renderer.render).not.toHaveBeenCalled();
  expect(gpu.renderer.clear).toHaveBeenCalledTimes(2);
  expect(jest.getTimerCount()).toBe(0);
  gpu.readySecond();
  expect(gate.render(gpu.camera)).toBe(true);
  expect(gpu.renderer.render).toHaveBeenCalledWith(gpu.scene, gpu.camera);
  expect(gate.render(gpu.camera)).toBe(true);
  expect(gpu.renderer.compile).toHaveBeenCalledTimes(1);
  jest.useRealTimers();
});

test('a removed scene never polls disposed programs or renders from a stale frame', () => {
  const gpu = gpuBoundary();
  const gate = createProfileRenderGate(gpu.renderer, gpu.scene);
  gate.render(gpu.camera);
  gate.dispose();
  gpu.renderer.properties.get = () => { throw new Error('GPU resources already released'); };
  expect(gate.render(gpu.camera)).toBe(false);
  expect(gpu.renderer.render).not.toHaveBeenCalled();
  const next = gpuBoundary();
  next.readyFirst(); next.readySecond();
  expect(createProfileRenderGate(next.renderer, next.scene).render(next.camera)).toBe(true);
});
