export async function getInnertube(config = {}) {
  console.log("before import");

  const mod = await import("youtubei.js/react-native");

  console.log("after import");

  const { default: Innertube, Platform } = mod;

  Platform.shim.eval = async ({ output }) => {
    console.log("inside shim");
    return new Function(output)();
  };

  return Innertube.create({
    generate_session_locally: true,
    ...config,
  });
}