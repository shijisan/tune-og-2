import { useRef } from "react";
import WebView from "react-native-webview";

import { setWebView, onMessage } from "@/services/youtube.bridge";

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
      source={{
        html: `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
</head>
<body>

<script>

window.addEventListener("message", async (event) => {

    const msg = JSON.parse(event.data);

    switch (msg.type) {

        case "DECIPHER":

          // TODO: make function that recieves video_id then resolve it to be a player instance then decipher which returns the stream url which we can pass to expo-audio

        case "PING":

            window.ReactNativeWebView.postMessage(
                JSON.stringify({
                    id: msg.id,
                    payload: "pong"
                })
            );

            break;

        default:

            window.ReactNativeWebView.postMessage(
                JSON.stringify({
                    id: msg.id,
                    error: "Unknown command"
                })
            );

    }

});

</script>

</body>
</html>
`
      }}
      onMessage={onMessage}
    />
  );
}