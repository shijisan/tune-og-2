let _yt: any = null;

export async function getInnertube(config: any = {}) {
  if (!_yt) {

    const { Innertube, Platform, UniversalCache } = await import("youtubei.js/agnostic");

    // 1. Force the React Native cache bypass if not explicitly provided
    const secureConfig = {
      ...config,
      cache: undefined,
    };

    // 2. Safely patch the eval environment for React Native / Hermes
    Platform.shim.eval = async (data: any, env: any) => {
      const properties: string[] = [];

      if (env.n) {
        properties.push(`n: nFunction("${env.n}")`);       // local scope
      }
      if (env.sig) {
        properties.push(`sig: sigFunction("${env.sig}")`); // local scope
      }

      const code = `${data.output}\nreturn { ${properties.join(', ')} };`;

      try {
        return new Function(code)();  // no args needed — data.output defines everything
      } catch (e) {
        console.warn('[shim.eval] new Function failed:', e);
        return {};
      }
    };

    // 3. Initialize the singleton with the secure configuration
    _yt = await Innertube.create(secureConfig);
  }

  return _yt;
}