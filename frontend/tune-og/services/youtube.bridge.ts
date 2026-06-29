import type WebView from "react-native-webview";

let webview: React.ComponentRef<typeof WebView> | null = null;

type PendingRequest = {
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
};

export type BridgeResponse = {
  id: string;
  type: string;
  payload: any;
}

const pending = new Map<string, PendingRequest>();

let nextId = 0;

export function setWebView(ref: React.ComponentRef<typeof WebView> | null) {
  webview = ref;
}

export function onMessage(event: any) {
  const message = JSON.parse(event.nativeEvent.data);

  const request = pending.get(message.id);

  if (!request) {
    console.warn("Unknown request id:", message.id);
    return;
  }

  pending.delete(message.id);

  if (message.error) {
    request.reject(message.error);
    return;
  }

  request.resolve(message.payload);
}

export function send<T = any>(type: string, payload: any): Promise<T> {
  const currentWebView = webview;

  if (!currentWebView) {
    return Promise.reject(new Error("WebView not ready"));
  }

  return new Promise<T>((resolve, reject) => {
    const id = String(++nextId);

    pending.set(id, { resolve, reject });

    currentWebView.postMessage(
      JSON.stringify({ id, type, payload })
    );
  });
}