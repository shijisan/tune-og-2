import { processMessage } from "./processor";

// Android fires on document, iOS fires on window
const target = (document as any) || window;

target.addEventListener("message", async (event: any) => {
  const { id, type, payload } = JSON.parse(event.data);

  try {
    const result = await processMessage(type, payload);

    window.ReactNativeWebView.postMessage(
      JSON.stringify({ id, payload: result })
    );
  } catch (err) {
    window.ReactNativeWebView.postMessage(
      JSON.stringify({
        id,
        error: err instanceof Error ? err.message : String(err),
      })
    );
  }
});