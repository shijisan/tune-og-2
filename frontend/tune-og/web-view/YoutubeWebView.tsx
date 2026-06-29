import { useRef } from "react";
import WebView from "react-native-webview";
import { setWebView, onMessage } from "@/services/youtube.bridge";
import html from "../web-view/html"; // ← string, not asset

export default function YoutubeWebView() {
  const ref = useRef<React.ComponentRef<typeof WebView>>(null);

  return (
    <WebView
      ref={(instance) => {
        ref.current = instance;
        setWebView(instance);
      }}
      containerStyle={{
        position: "absolute",
        opacity: 0,
        width: 1,
        height: 1,
      }}
      source={{ html, baseUrl: "https://www.youtube.com" }} // ← gives WebView a real origin
      onMessage={onMessage}
      originWhitelist={["*"]}
      javaScriptEnabled
      mixedContentMode="always"
    />
  );
}