// Three's first material use reads shader logs/uniforms synchronously. Start
// compilation first, then use its nonblocking readiness check on the existing
// Canvas frame loop. Unlike compileAsync, this owns no uncancellable timers.
export function createProfileRenderGate(renderer, scene) {
  let materials = null;
  let ready = false;
  let disposed = false;
  return {
    render(camera) {
      if (disposed) return false;
      if (!ready) {
        if (!materials) materials = renderer.compile(scene, camera);
        // This is the same program readiness check used by the installed Three
        // compileAsync. Without the parallel extension Three reports ready and
        // retains its normal synchronous rendering fallback.
        for (const material of materials) {
          if (!renderer.properties.get(material).currentProgram.isReady()) {
            renderer.clear();
            return false;
          }
        }
        materials = null;
        ready = true;
      }
      renderer.render(scene, camera);
      return true;
    },
    dispose() {
      disposed = true;
      materials = null;
    },
  };
}
