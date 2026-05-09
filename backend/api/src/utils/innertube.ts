import { Innertube, Platform, Types } from 'youtubei.js';

Platform.shim.eval = async (data: Types.BuildScriptResult, env: Record<string, Types.VMPrimative>) => {
  const properties = [];

  if (env.n) {
    properties.push(`n: exportedVars.nFunction("${env.n}")`)
  }

  if (env.sig) {
    properties.push(`sig: exportedVars.sigFunction("${env.sig}")`)
  }

  const code = `${data.output}\nreturn { ${properties.join(', ')} }`;

  return new Function(code)();
}

let _yt: Innertube | null = null;

export async function getInnertube(config: any) {
  if (!_yt) {
    _yt = await Innertube.create(config);
  }
  return _yt;
}