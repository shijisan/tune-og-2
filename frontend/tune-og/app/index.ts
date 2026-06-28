import 'react-native-url-polyfill/auto'; // Ensure global URL polyfills are active
import { Event, EventTarget, CustomEvent } from "event-target-shim";
import { TextEncoder, TextDecoder } from 'text-encoding';
import { Buffer } from 'buffer';
import 'react-native-get-random-values';

global.Event ??= Event;
global.EventTarget ??= EventTarget;
global.CustomEvent ??= CustomEvent;
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
global.Buffer = Buffer;
global.process = require('process');