export async function getInnertube(config = {}) {
  const mod = await import("youtubei.js/react-native");
  const { default: Innertube, Platform } = mod;

Platform.shim.eval = async (data, eval_args) => {
  const globalStart = data.output.indexOf('const __jsExtractorGlobal');
  const codeEnd = data.output.lastIndexOf('})({})') + 2;
  let iifeCode = data.output.slice(globalStart, codeEnd) + '(g)';
  
  // Force empty stand-ins for window/self like Node.js
  iifeCode = iifeCode.replace(/const window = typeof __jsExtractorGlobal\.window !== 'undefined' \? __jsExtractorGlobal\.window : Object\.create\(null\);/, 'const window = Object.create(null);');
  iifeCode = iifeCode.replace(/const self = typeof __jsExtractorGlobal\.self !== 'undefined' \? __jsExtractorGlobal\.self : window;/, 'const self = window;');

  // Attach closure-scoped helpers to g so manual class methods can access them
  const originalLength = iifeCode.length;
  iifeCode = iifeCode.replace(/var z = /, 'g.z = z = ');
  iifeCode = iifeCode.replace(/  pM = /, '  g.pM = pM = '); // More specific: requires leading spaces
  iifeCode = iifeCode.replace(/  \$E = /, '  g.$E = $E = '); // More specific: requires leading spaces
  iifeCode = iifeCode.replace(/g\.fe = /, 'g.fe = g.fe = '); // Already on g, but ensure it's there
  console.log("Code length after helper attachments:", iifeCode.length, "(original:", originalLength, ")");

  console.log("Extraction length:", iifeCode.length);
  console.log("Last 100 chars:", iifeCode.slice(-100));
  console.log("eval_args:", eval_args);

  const factory = new Function('g', `
    ${iifeCode}
    return { exportedVars, g };
  `);

  let result;
  try {
    result = factory({});
  } catch (error) {
    console.log("IIFE execution error:", error);
    throw error;
  }

  const { exportedVars, g } = result;

  console.log("exportedVars type:", typeof exportedVars);
  console.log("nsigFunction type:", typeof exportedVars?.nsigFunction);
  console.log("g.Je type:", typeof g?.Je);
  console.log("g.SM type:", typeof g?.SM);
  console.log("g.z type:", typeof g?.z);
  console.log("g.pM type:", typeof g?.pM);
  console.log("g.$E type:", typeof g?.$E);
  console.log("g.fe type:", typeof g?.fe);
  console.log("Keys on g:", Object.keys(g || {}).length);

  // Manually define classes if they're undefined (React Native ES6 class issue)
  if (typeof g?.Je === 'undefined') {
    console.log("Manually defining g.Je");
    const z = g.z;
    if (!z) {
      console.log("ERROR: z array is not available, cannot define g.Je");
      throw new Error("z array not available for g.Je definition");
    }
    g.Je = function(M: any, D: any = false) {
      this[z[3]] = M;
      this[z[57]] = D;
      this[z[15]] = this[z[16]] = this[z[27]] = z[6];
      this[z[25]] = {};
      this[z[13]] = z[6];
    };
    g.Je.prototype.set = function(M: any, D: any) {
      this[z[25]][M] !== D && (this[z[25]][M] = D, this[z[13]] = z[6]);
    };
    g.Je.prototype.get = function(M: any) {
      // Simplified: just access params directly without calling pM
      const z = g.z;
      return this[z[25]][M] || null;
    };
    g.Je.prototype.FV = function() {
      this[z[13]] || (this[z[13]] = g.$E(12, 4619, this));
      return this[z[13]];
    };
    g.Je.prototype.clone = function() {
      const M = new g.Je(this[z[3]], this[z[57]]);
      M[z[27]] = this[z[27]];
      M[z[16]] = this[z[16]];
      M[z[15]] = this[z[15]];
      M[z[25]] = g.fe(this[z[25]]);
      M[z[13]] = this[z[13]];
      return M;
    };
    console.log("g.Je defined successfully, type:", typeof g.Je);
  }

  if (typeof g?.SM === 'undefined') {
    console.log("Manually defining g.SM");
    try {
      g.SM = function(M: any, ...D: any[]) {
        Error.call(this, M);
        this.args = [...D];
        this.name = "g.SM";
        Object.setPrototypeOf(this, g.SM.prototype);
      };
      g.SM.prototype = Object.create(Error.prototype);
      g.SM.prototype.constructor = g.SM;
      console.log("g.SM defined successfully, type:", typeof g.SM);
    } catch (e) {
      console.log("Error defining g.SM:", e);
    }
  }

  // Use the original exportedVars - no re-execution needed
  console.log("Calling nsigFunction with manually defined classes");
  
  // Based on debug code, nsigFunction expects (URL, sp, sig) not (sig, sp, n)
  // Construct a mock URL with the n parameter like the debug code does
  let mockURL = "https://ytjs.googlevideo.com/videoplayback?expire=1234567890";
  if (eval_args.n) {
    mockURL += `&n=${encodeURIComponent(eval_args.n)}`;
  }
  
  console.log("Calling nsigFunction with URL:", mockURL, "sp:", eval_args.sp, "sig:", eval_args.sig);
  const nsigResult = exportedVars.nsigFunction(mockURL, eval_args.sp, eval_args.sig);
  console.log("nsigFunction raw result:", nsigResult);
  console.log("nsigResult type:", typeof nsigResult);
  
  // The result is a g.Je object - need to extract the signature
  let deciphered;
  if (typeof nsigResult === 'object' && nsigResult !== null) {
    console.log("Extracting signature from g.Je object");
    
    // Based on debug code, call all methods before extraction (except blacklisted ones)
    const methodBlacklist = ['constructor', 'clone', 'set', 'get'];
    const proto = Object.getPrototypeOf(nsigResult);
    const properties = Object.getOwnPropertyNames(proto);
    
    for (const prop of properties) {
      if (methodBlacklist.includes(prop))
        continue;
      if (typeof nsigResult[prop] === 'function') {
        try {
          console.log("Calling preprocessing method:", prop);
          nsigResult[prop]();
        } catch (e: any) {
          console.log("Error calling method", prop, ":", e);
        }
      }
    }
    
    // Based on the debug code, signature should be extracted via .get(sp) method
    if (typeof nsigResult.get === 'function' && eval_args.sp && typeof eval_args.sp === 'string') {
      console.log("Extracting via .get(sp) method");
      const rawSig = nsigResult.get(eval_args.sp);
      deciphered = rawSig ? decodeURIComponent(rawSig) : rawSig;
      console.log("Decoded signature:", deciphered);
    } else if (eval_args.sp && typeof eval_args.sp === 'string') {
      // Fallback: try to get from params
      const z = g.z;
      if (z && nsigResult[z[25]]) {
        const params = nsigResult[z[25]];
        const rawSig = params[eval_args.sp];
        deciphered = rawSig ? decodeURIComponent(rawSig) : rawSig;
      }
    } else if (eval_args.n) {
      // For n-signature, try .get('n')
      if (typeof nsigResult.get === 'function') {
        const rawN = nsigResult.get('n');
        deciphered = rawN ? decodeURIComponent(rawN) : rawN;
      }
    }
  } else {
    deciphered = nsigResult;
  }
  
  console.log("Deciphered result:", deciphered);
  console.log("Deciphered type:", typeof deciphered);
  
  // youtubei.js expects an object with sig/n properties, not a raw string
  const evalResult: any = {};
  if (typeof eval_args.sig === 'string') {
    evalResult.sig = deciphered;
  }
  if (typeof eval_args.n === 'string') {
    evalResult.n = deciphered;
  }
  console.log("Returning result object:", evalResult);
  
  // If this is being called from streamingObj.decipher(), it expects a URL string
  // Check if the call is for URL construction (has url property in eval_args)
  if (eval_args.url && typeof eval_args.url === 'string' && typeof deciphered === 'string') {
    // Apply the signature to the URL
    const url = new URL(eval_args.url);
    if (eval_args.sp && typeof eval_args.sp === 'string') {
      url.searchParams.set(eval_args.sp, deciphered);
    } else {
      url.searchParams.set('signature', deciphered);
    }
    console.log("Returning constructed URL:", url.toString());
    return url.toString();
  }
  
  return evalResult;
};

  return Innertube.create({
    generate_session_locally: true,
    ...config,
  });
}
