# BlackBox CTF Field Manual

This manual is written for HACK KAP CTF 2026, Operation Heist, running June 13-14, 2026. The flag format is:

```text
K4P{...}
```

BlackBox is a local browser toolkit. Use it for fast decoding, analysis, note keeping, payload shaping, and triage. It does not replace specialist tools such as Burp Suite, Wireshark, Ghidra, pwntools, CyberChef, hashcat, or binwalk, but it is excellent as your central CTF workbench.

## 1. Start BlackBox

From the project folder:

```bash
node dev-server.js
```

Open:

```text
http://127.0.0.1:8000/
```

Use the local server instead of opening `index.html` directly. Some browser features and local wordlists work better through the server.

## 2. Competition Rules To Respect

Use BlackBox only on the CTF challenges and provided challenge infrastructure.

Do not attack the scoreboard, login system, organizer infrastructure, or unrelated public services.

Do not brute force the flag submission form.

Do not share flags or full solutions during the event.

Keep notes, evidence, payloads, and solved flags organized so your team can avoid duplicate work.

## 3. Navigation

Use the sidebar categories for broad movement:

- Power Tools
- Web
- Crypto
- Binary
- Reversing
- Forensics
- OSINT
- Misc

Use the top search bar when you already know the tool name. Examples:

```text
jwt
base64
png
hash
xor
qr
timestamp
```

Use the Back button or `Esc` to return from a tool panel to the category view.

## 4. The Default Workflow For Every Challenge

For each challenge, follow this loop:

1. Create an entry in CTF Notepad.
2. Record the challenge name, category, points, files, URL, and first observations.
3. Paste obvious strings into Flag Auto-Detector.
4. Paste suspicious encoded text into Auto Decoder.
5. Use a category-specific tool to investigate.
6. Run the likely output through Flag Auto-Detector again.
7. Save the final `K4P{...}` flag in Notepad.

Suggested note format:

```text
Challenge:
Category:
Status: todo / working / solved / stuck
Files:
URL:
Findings:
Payloads tried:
Credentials/tokens:
Flag:
Next step:
```

## 5. Power Tools

### Challenge Flow Advisor

Paste the challenge title, category, description, hints, file names, URLs, sample output, or suspicious strings. It will guess the likely challenge path and give you a BlackBox tool flow with direct Open buttons.

Use this first when you are unsure where to begin.

### Flag Auto-Detector

Use this constantly. Paste logs, page source, decoded text, terminal output, binary strings, JSON responses, and suspicious blobs.

It checks direct text and common decoded variants such as Base64, hex, ROT13, and URL decoding. The generic flag pattern catches prefixes like `K4P{...}`.

Best use:

- After every decode.
- After extracting strings from a binary.
- After reading metadata.
- After deobfuscating JavaScript.
- After solving a web response or API leak.

### Auto Decoder

Use this for first-pass decoding. It tries Base64, Base32, hex, binary, URL decode, HTML entities, ROT13, ROT47, Atbash, Morse, Unicode escapes, hex escapes, octal, double Base64, and Caesar shifts.

Best use:

- Challenge descriptions with weird text.
- Encoded cookies.
- Suspicious API values.
- QR output.
- Strings from images or binaries.
- Anything that looks like `a2V5`, `%7B`, `\x41`, `01001011`, or long mixed alphabet text.

### CTF Notepad

Use this as your team memory. It stores notes, flags, and credentials in the browser's local storage.

Recommended use:

- Keep one note block per challenge.
- Save all found usernames, passwords, tokens, salts, keys, IVs, endpoints, and file passwords.
- Mark dead ends so teammates do not repeat them.
- Save exact flags immediately.

### Tool Chainer

Use this when data has multiple layers.

Example chains:

```text
URL decode -> Base64 decode -> Flag scan
Hex decode -> ROT13 -> Flag scan
Base64 decode -> HTML decode -> Flag scan
```

If Auto Decoder gives a partial clue, rebuild the exact chain here and continue manually.

## 6. Web Challenges

Use these for challenges like The Front Door, Tokyo's Rage, SISTEMA Layer 2, API of Spain, and Zero Day.

### JWT Decoder

Paste a JWT to inspect the header, payload, signature, and expiry.

Look for:

- `alg`
- `role`
- `admin`
- `sub`
- `uid`
- `exp`
- `is_admin`
- `permissions`

If the payload contains encoded values, copy them into Auto Decoder.

### JWT Forger

Use only inside CTF targets where token tampering is expected.

Useful tests:

- Change `role` to `admin`.
- Change `is_admin` to `true`.
- Try weak HMAC secrets from challenge hints.
- Try the `none` algorithm panel if the challenge hints at broken JWT validation.

Then paste the generated token into your browser, Burp, or curl request.

### Cookie Parser

Paste full cookie strings. It identifies cookie names, values, and security flags.

Look for:

- Base64 cookie values.
- JWT-looking values with three dot-separated parts.
- Missing `HttpOnly`, `Secure`, or `SameSite`.
- Role, user, session, debug, or admin fields.

Send suspicious values to Auto Decoder or JWT Decoder.

### URL Parser

Breaks a URL into scheme, host, path, query parameters, and fragments.

Use it to inspect:

- Redirect parameters.
- File path parameters.
- API versions.
- Hidden IDs.
- Encoded values.

Good targets for testing in a CTF:

```text
next=
redirect=
url=
file=
path=
id=
debug=
admin=
token=
```

### Header Parser

Paste request or response headers. Use it to inspect security headers and unusual values.

Look for:

- Missing or weak CSP.
- Interesting cookies.
- Server/version leaks.
- Debug headers.
- Internal IPs.
- `X-Forwarded-*` behavior.

### HTML Encoder/Decoder

Use for XSS payload shaping, HTML entity decoding, and source inspection.

Common flow:

```text
Copy encoded page text -> HTML decode -> Flag Auto-Detector
Payload blocked -> HTML encode special chars -> retest
```

### Payload Library

Use as a quick payload source for CTF testing. It is useful for common SQLi, XSS, command injection, traversal, SSRF, and template injection probes.

Do not spray payloads blindly. Test one idea at a time and record results.

### cURL Builder

Use when you need reproducible HTTP requests.

Recommended flow:

1. Build method, URL, headers, cookies, and body.
2. Copy the generated curl command.
3. Run it in a terminal.
4. Save working requests in Notepad.

### CORS Bypass Generator

Use when the challenge suggests cross-origin trust issues.

Check whether the server reflects:

```text
Origin
Access-Control-Allow-Origin
Access-Control-Allow-Credentials
```

### SQLi WAF Tamper

Use when SQL injection works partially but filters block obvious payloads.

Paste the base payload and test generated variants:

```text
' OR '1'='1
UNION SELECT NULL,NULL
admin'--
```

Record which characters or keywords are blocked.

## 7. Cryptography And Encoding

Use these for Hostage Protocol, The Professor's Cipher, Rio's Encoder, and crypto side challenges.

### Hash Generator

Generate hashes for known plaintext guesses. Useful when checking whether a challenge stores `md5(password)`, `sha256(secret)`, or similar.

### Hash Cracker

Cracks common unsalted hex hashes with built-in wordlists and custom words.

Supported families include MD5, SHA1, RIPEMD160, SHA224, SHA256, SHA3-256, SHA384, SHA512, and SHA3-512.

Best approach:

1. Paste the hash.
2. Leave type on Auto Detect first.
3. Use All Wordlists.
4. Add challenge-specific custom words.

Good custom words for Operation Heist:

```text
professor
murillo
sistema
heist
mint
vault
tokyo
berlin
nairobi
rio
denver
bella
ciao
kap
hackkap
```

### Hash Identifier

Use before cracking when you do not know the format. It identifies likely hash types by length and pattern, plus encodings like Base64, Base32, binary, URL encoding, hex, and JWT.

### Encoder / Decoder

Use for direct conversions:

- Base64
- Base32
- Hex
- Binary
- URL
- HTML

If Auto Decoder is noisy, use these specific tools for precise work.

### Caesar / ROT

Use for ROT13, ROT47, Caesar shifts, and brute forcing simple rotations.

Try this when text is readable-looking but wrong, or when the challenge is beginner crypto.

### Vigenere Cipher

Use when the text is alphabetic and a keyword is hinted.

Try story words as keys:

```text
professor
sistema
heist
mint
bella
ciao
murillo
```

### XOR Tool

Use for single-byte XOR, repeating-key XOR, and hex/text XOR work.

CTF signs:

- High entropy text that becomes readable with a short key.
- Challenge hints about "key", "mask", "frequency", or "one byte".
- Hex strings with no obvious encoding.

### Atbash / Rail Fence

Use for classical substitution and transposition puzzles.

Atbash is quick to test. Rail Fence is likely when the text length is normal but character order looks scrambled.

### Frequency Analyzer

Use against substitution ciphers. It shows character frequency so you can compare with English.

High `E`, `T`, `A`, `O`, `I`, `N` patterns often reveal simple substitution.

### RSA Tool

Use for small RSA parameters and key inspection.

Look for:

- Small `n`
- Reused modulus
- Small public exponent
- Given `p` and `q`
- Given `phi`
- Given `d`

For serious RSA attacks, use external scripts too, but use BlackBox to sanity-check values.

### AES Tool

Use when the challenge gives ciphertext plus key/IV/mode hints.

Track:

- Mode: CBC, ECB, CTR, etc.
- Key format: text or hex.
- IV format.
- Padding.
- Ciphertext format: Base64 or hex.

### Base Converter

Use for decimal, hex, binary, octal, and other base conversions.

Great for:

- IP conversions.
- ASCII numbers.
- Crypto math.
- Reversing constants.

### HMAC Generator

Use for API signing challenges and token validation.

Try it when the request includes:

```text
signature=
sig=
hmac=
X-Signature
X-Hub-Signature
```

### ASCII Converter

Use when you see decimal, hex, or binary character codes.

Example:

```text
75 52 80 123
```

May become:

```text
K4P{
```

### Playfair / Affine / Bacon / Polybius / Number Theory

Use these for classical crypto side quests.

Quick triage:

- Playfair: digraphs, no letter `J`, keyword hinted.
- Affine: formula or `a*x+b mod 26`.
- Bacon: A/B patterns or binary-looking groups of five.
- Polybius: coordinate pairs like `11 23 44`.
- Number Theory: modular inverse, GCD, factorization, primes, Euler totient.

## 8. Forensics And Steganography

Use these for Bella Ciao, Camera Blind Spot, Nairobi's Ledger, Murillo's Trap, Denver's Mistake, and file-based side quests.

### Hex Dump

Upload a file to inspect raw bytes.

Look for:

- File headers.
- Embedded text.
- Trailing data.
- Repeated patterns.
- Suspicious offsets.

### Metadata Extractor

Use on images first. EXIF can contain authors, GPS, comments, software names, timestamps, or hidden challenge hints.

Send extracted text to Flag Auto-Detector and Auto Decoder.

### LSB Stego Detector

Use for image steganography. Try it when a PNG/BMP image looks normal but challenge text hints at hiding, pixels, color channels, or "least significant".

### Entropy Analyzer

Use to decide if data is likely encrypted, compressed, packed, or plain.

Rules of thumb:

- Low entropy: plain/repeated data.
- Medium entropy: structured binary.
- High entropy: compressed, encrypted, or random-looking data.

### PNG Chunk Analyzer

Use on PNG files to inspect chunks.

Look for:

- Weird custom chunks.
- Text chunks.
- Extra data after `IEND`.
- Suspicious chunk sizes.

### File Hasher

Generate MD5, SHA1, SHA256, and SHA512 of files.

Use for:

- Comparing files.
- Checking if a file changed.
- Verifying downloaded challenge files.
- Matching hash clues.

### Forensics Reference

Use as a command checklist for external tools. BlackBox gives guidance, then you can run tools like:

```bash
file sample
strings sample
exiftool image.png
binwalk image.png
foremost dump.bin
zsteg image.png
steghide info image.jpg
tshark -r traffic.pcap
```

## 9. Reversing

Use these for The Vault Door, SISTEMA Core, JavaScript puzzles, and binary files.

### Hex Viewer

View raw binary content. Use it when the file type is unknown or when you need offsets.

### Strings Extractor

Run this immediately on binaries, APK-like blobs, unknown files, and memory-ish dumps.

Search extracted strings for:

```text
K4P{
flag
password
secret
key
admin
token
http
```

### Magic Bytes ID

Use when a file extension is wrong. It identifies file types from header bytes.

Examples:

```text
89 50 4E 47 = PNG
50 4B 03 04 = ZIP/JAR/APK/DOCX
7F 45 4C 46 = ELF
25 50 44 46 = PDF
```

### Regex Tester

Use to build extraction patterns from large text, logs, HTML, JS, or strings.

Useful regex:

```text
K4P\{[^}]+\}
[A-Za-z0-9+/]{20,}={0,2}
[a-fA-F0-9]{32,}
https?://[^\s"'<>]+
```

### JS Deobfuscator

Use for web/reversing JavaScript challenges.

Good flow:

1. Paste obfuscated JS.
2. Beautify/deobfuscate.
3. Search for strings, endpoints, keys, and conditions.
4. Decode suspicious literals.
5. Save endpoints and secrets in Notepad.

### Disasm Reference

Use as a quick x86/x64 instruction reference while reading Ghidra, objdump, radare2, or gdb output.

## 10. Binary Exploitation

Use these for Berlin's Orders, The Final Vault, and pwn challenges.

### Pattern Generator

Generate cyclic patterns to find buffer overflow offsets.

Workflow:

1. Generate a pattern longer than the buffer.
2. Send it to the binary.
3. Read the crash value from RIP/EIP.
4. Use the pattern offset tool logic to find the exact overwrite offset.
5. Build your exploit with that offset.

### Shellcode Encoder

Use to format or encode shellcode bytes. Keep track of bad characters from the challenge.

### String / Hex

Convert payload pieces between text and hex.

Useful when building:

- Packed addresses.
- Byte strings.
- Shellcode.
- Protocol payloads.

### ELF Header Parser

Upload Linux binaries to inspect architecture, entry point, endianness, and ELF metadata.

Pair with external:

```bash
checksec --file ./binary
file ./binary
readelf -a ./binary
```

### ROP Reference

Use as a reminder for ROP concepts and common gadgets. For real gadget hunting, use external tools:

```bash
ROPgadget --binary ./binary
ropper --file ./binary
```

### Assembly Reference

Use while reading disassembly and debugging. It is a quick reference for common instructions and registers.

## 11. OSINT

Use these for The Blueprints, The Mole, The Janitor, Murillo's Files, The Confession, and public-info challenges.

### Google Dork Builder

Build precise Google queries.

Useful dork ideas:

```text
site:target.tld
site:target.tld filetype:pdf
site:target.tld intitle:index.of
site:target.tld inurl:admin
"exact phrase from challenge"
"username" "hackkap"
```

Respect CTF boundaries. If the OSINT challenge points to public profiles or documents, investigate those; do not attack third-party systems.

### Subnet Calculator

Use for CIDR puzzles, network ranges, and cloud/network challenges.

### IP Converter

Convert IPs between decimal, hex, integer, and dotted formats.

This helps with SSRF, firewall bypass, and encoded-IP puzzles.

Examples to recognize:

```text
127.0.0.1
2130706433
0x7f000001
0177.0.0.1
```

### Username Generator

Generate username variants from names.

Use for OSINT username matching, not password spraying.

### Shodan Query Builder

Build Shodan queries for challenge-approved targets or intentionally public challenge infrastructure.

Useful filters:

```text
hostname:
org:
port:
product:
country:
ssl.cert.subject.cn:
```

### Email Format Guesser

Generate likely email formats from names and domains for OSINT puzzles.

## 12. Miscellaneous

### Diff Checker

Compare two texts, responses, configs, decoded outputs, or source files.

Great for:

- Comparing guest vs admin responses.
- Comparing two API errors.
- Finding one changed character in a token.
- Spotting hidden text changes.

### Timestamp Converter

Convert Unix timestamps to readable dates and back.

Use for:

- JWT `iat`, `nbf`, `exp`.
- Log analysis.
- File metadata.
- Time-based challenge clues.

### QR Code Tool

Read QR codes from images and generate QR codes if needed.

After reading a QR value, send it to Auto Decoder and Flag Auto-Detector.

### Morse Code

Encode and decode Morse. Use for audio/text puzzles and beginner misc challenges.

### Password Generator

Generate strong passwords for local test accounts or challenge forms when you need controlled input.

Do not use it to brute force challenge infrastructure.

### Wordlist Generator

Create mutations from base words.

Good Operation Heist bases:

```text
professor
sistema
mint
vault
murillo
tokyo
berlin
rio
nairobi
bella
ciao
```

Use generated words in Hash Cracker or external tools only where the challenge clearly expects cracking.

### UUID Tool

Generate and inspect UUIDs.

Use for:

- API object IDs.
- Predictability checks.
- Version identification.
- Comparing IDs from multiple users.

## 13. Challenge-Type Playbooks

### Sanity Check

1. Read the whole page/source.
2. Paste text into Flag Auto-Detector.
3. Try Auto Decoder on suspicious text.
4. Inspect comments, hidden fields, and metadata.

### Linux / Basics

BlackBox helps with decoding, hashes, strings, timestamps, and notes. Use terminal commands for the actual Linux work.

Useful terminal commands:

```bash
file *
strings file
grep -R "K4P{" .
find . -type f
ls -la
```

### Web

1. Open browser devtools and Burp if available.
2. Save URLs, cookies, headers, and tokens in Notepad.
3. Use URL Parser, Cookie Parser, Header Parser, JWT Decoder.
4. Use Payload Library and SQLi WAF Tamper carefully.
5. Use cURL Builder to make repeatable requests.
6. Run every interesting response through Flag Auto-Detector.

### Crypto

1. Identify the format with Hash Identifier or Auto Decoder.
2. Try simple encodings first.
3. Try classical ciphers if alphabetic.
4. Use Frequency Analyzer for substitution.
5. Use XOR Tool for masked/hex/random-looking data.
6. Use RSA/AES tools only when parameters are present or strongly hinted.

### Forensics

1. Hash the file.
2. Check metadata.
3. Identify magic bytes.
4. Extract strings.
5. Inspect hex and entropy.
6. For PNGs, inspect chunks and LSB.
7. Use external tools for archives, carving, PCAPs, and advanced stego.

### Reversing

1. Identify file type with Magic Bytes ID or ELF Header Parser.
2. Run Strings Extractor.
3. Search for flag, key, password, success, fail, admin, and URLs.
4. Use Hex Viewer for offsets.
5. Use JS Deobfuscator for JavaScript.
6. Use Disasm Reference while analyzing in Ghidra/gdb.

### Pwn

1. Identify architecture and protections externally.
2. Use Pattern Generator to find overflow offset.
3. Use String / Hex for payload bytes.
4. Use ROP and Assembly references while building the exploit.
5. Keep offsets, addresses, and payload versions in Notepad.

### OSINT

1. Extract names, usernames, domains, emails, and exact phrases.
2. Use Google Dork Builder.
3. Use Username Generator and Email Format Guesser.
4. Use IP tools for infrastructure clues.
5. Record sources and exact findings.

### Steganography

1. Check metadata.
2. Inspect image dimensions and PNG chunks.
3. Try QR Code Tool if visible or partial QR exists.
4. Try LSB Stego Detector.
5. Use Hex Dump for appended data.
6. Use external tools for audio/video/specialized stego.

### Cloud / API

BlackBox is useful for tokens, URLs, headers, timestamps, HMACs, and JSON/API comparisons.

Workflow:

1. Save all endpoints.
2. Parse URLs and headers.
3. Decode tokens and cookies.
4. Compare normal and privileged responses with Diff Checker.
5. Use HMAC Generator if request signatures appear.

### AI / ML Security

BlackBox helps with note keeping, diffing responses, decoding leaked blobs, and flag scanning.

Workflow:

1. Save prompts and responses.
2. Diff successful vs failed prompts.
3. Decode any leaked encoded data.
4. Scan model output for flags and hidden strings.

## 14. 24-Hour Strategy

First 30 minutes:

- Open BlackBox and Notepad.
- Create a team tracking format.
- Solve sanity/beginner challenges first.
- Collect first blood opportunities only if they are genuinely quick.

Hours 1-6:

- Clear easy web, crypto, OSINT, misc, and stego.
- Avoid sinking too long into one hard challenge.
- Every 20-30 minutes, either find a new lead or rotate.

Hours 6-12:

- Move into medium challenges.
- Split by category strengths.
- Keep one person checking newly unlocked hints or side stories.

Hours 12-20:

- Attack hard challenges with accumulated clues.
- Use notes aggressively.
- Revisit partial solves with fresh eyes.

Final 4 hours:

- Finish challenges with known paths.
- Recheck every unsolved note for missed encoded strings.
- Run collected outputs through Flag Auto-Detector.
- Submit carefully. Typos waste time.

## 15. Team Roles

For a team of four:

- Web/API/Cloud: Burp, tokens, headers, endpoints, auth bypass.
- Crypto/Misc/AI: encodings, ciphers, hashes, prompt puzzles.
- Forensics/Stego/OSINT: files, images, metadata, public clues.
- Reversing/Pwn: binaries, offsets, decompilation, exploitation.

If solo:

- Spend 5 minutes triaging each challenge before deep work.
- Mark stuck items quickly.
- Use BlackBox search to move fast.

## 16. Fast Triage Keywords

When you see these clues, open these tools:

```text
base64, b64, encoded      -> Auto Decoder, Decoder
hash, digest, md5, sha    -> Hash Identifier, Hash Cracker
jwt, bearer, token        -> JWT Decoder, JWT Forger
cookie, session           -> Cookie Parser, Auto Decoder
url, redirect, path       -> URL Parser
headers, cors             -> Header Parser, CORS Bypass Generator
sql, database, login      -> Payload Library, SQLi WAF Tamper
image, exif, png          -> Metadata Extractor, PNG Chunk Analyzer, LSB Detector
qr                        -> QR Code Tool
morse                     -> Morse Code
timestamp, exp, iat       -> Timestamp Converter
binary, elf               -> ELF Header Parser, Strings Extractor
overflow, crash           -> Pattern Generator
xor                       -> XOR Tool
rsa                       -> RSA Tool, Number Theory
aes, iv, cbc              -> AES Tool
username, email           -> Username Generator, Email Format Guesser
subnet, cidr, ip          -> Subnet Calculator, IP Converter
```

## 17. Final Flag Handling

Before submitting:

1. Confirm the flag starts with `K4P{`.
2. Confirm braces are balanced.
3. Do not add spaces or quotes.
4. Submit once.
5. Save the accepted flag in CTF Notepad.

If a flag-like string fails, try:

- Decoding one more layer.
- Checking case sensitivity.
- Removing copied whitespace.
- Looking for the final flag nearby rather than submitting a decoy.

## 18. What BlackBox Is Best At

BlackBox is your fast local triage desk:

- Decode first.
- Detect flags.
- Parse web artifacts.
- Track notes.
- Generate payload variants.
- Inspect files quickly.
- Convert formats.
- Keep your workflow moving.

Use specialist tools when a challenge needs deep exploitation, packet analysis, decompilation, password cracking at scale, or cloud CLI access.
