/* encoding.js - encoders/decoders (base64, hex, etc.) */
function base64Encode(s) { return btoa(s); }
function base64Decode(s) { return atob(s); }
