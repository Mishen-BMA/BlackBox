// =========================
// CHALLENGE FLOW ADVISOR
// =========================

const CHALLENGE_FLOW_RULES = [
    {
        category: 'Web / API',
        keywords: ['web', 'login', 'admin', 'portal', 'api', 'endpoint', 'http', 'cookie', 'session', 'jwt', 'bearer', 'header', 'cors', 'sqli', 'sql', 'xss', 'csrf', 'redirect', 'url', 'parameter', 'graphql', 'rest', 'ssti', 'lfi', 'ssrf'],
        tools: [
            ['urlParser', 'URL Parser', 'Break URLs into paths, parameters and fragments.'],
            ['cookieParser', 'Cookie Parser', 'Inspect session cookies, encoded values and flags.'],
            ['headerParser', 'Header Parser', 'Review request/response headers and security hints.'],
            ['jwtDecoder', 'JWT Decoder', 'Decode bearer tokens or JWT-looking cookies.'],
            ['payloadLibrary', 'Payload Library', 'Pick focused payloads for the suspected bug class.'],
            ['sqliTamper', 'SQLi WAF Tamper', 'Generate SQLi variants when filters block obvious payloads.'],
            ['curlBuilder', 'cURL Builder', 'Build repeatable requests once an endpoint looks promising.'],
        ],
        steps: [
            'Save the URL, request method, cookies, headers and visible roles in CTF Notepad.',
            'Parse URLs and cookies before payload testing; encoded values often hold clues.',
            'Decode JWTs and inspect role, admin, exp, uid and permissions fields.',
            'Compare guest and privileged responses with Diff Checker when possible.',
            'Test one payload family at a time, then scan interesting responses for flags.',
        ],
        external: 'Use browser devtools or Burp Suite for interception, replay and response comparison.',
    },
    {
        category: 'Crypto / Encoding',
        keywords: ['crypto', 'cipher', 'decode', 'encode', 'base64', 'base32', 'hex', 'binary', 'rot', 'caesar', 'vigenere', 'xor', 'hash', 'md5', 'sha', 'rsa', 'aes', 'hmac', 'key', 'iv', 'modulus', 'prime', 'encrypted', 'decrypt', 'frequency', 'atbash', 'polybius', 'bacon', 'affine', 'playfair'],
        tools: [
            ['autoDecoder', 'Auto Decoder', 'Try common encodings and simple ciphers first.'],
            ['hashIdentifier', 'Hash Identifier', 'Classify hash-like or encoded strings.'],
            ['decoder', 'Decoder', 'Run precise Base64, Base32, hex, binary, URL or HTML decoding.'],
            ['caesarCipher', 'Caesar / ROT', 'Brute force rotation ciphers quickly.'],
            ['xorTool', 'XOR Tool', 'Test single-byte or repeating-key XOR clues.'],
            ['frequencyAnalyzer', 'Frequency Analyzer', 'Check substitution-cipher letter patterns.'],
            ['rsaTool', 'RSA Tool', 'Inspect small RSA values and known key parameters.'],
            ['aesTool', 'AES Tool', 'Decrypt when key, IV, mode and ciphertext are supplied.'],
        ],
        steps: [
            'Paste suspicious text into Auto Decoder before choosing a specialist cipher.',
            'Identify hash-like values by length and format before cracking.',
            'Try challenge/story words as keys when a keyword cipher is hinted.',
            'For RSA or AES, write down every parameter exactly before decrypting.',
            'Run each decoded layer through Flag Auto-Detector before continuing.',
        ],
        external: 'Use CyberChef, SageMath, RsaCtfTool or hashcat when the math or cracking gets heavy.',
    },
    {
        category: 'Forensics / Stego',
        keywords: ['forensics', 'stego', 'steganography', 'image', 'png', 'jpg', 'jpeg', 'exif', 'metadata', 'lsb', 'chunk', 'file', 'hidden', 'deleted', 'recover', 'dump', 'pcap', 'traffic', 'wireshark', 'audio', 'wav', 'video', 'zip', 'archive', 'memory', 'camera', 'snapshot'],
        tools: [
            ['metadataExtractor', 'Metadata Extractor', 'Check EXIF, comments, timestamps and GPS hints.'],
            ['magicBytes', 'Magic Bytes ID', 'Confirm the real file type before trusting extensions.'],
            ['stringsExtractor', 'Strings Extractor', 'Extract readable clues, passwords, URLs and flags.'],
            ['hexDump', 'Hex Dump', 'Inspect headers, trailers and embedded data.'],
            ['pngAnalyzer', 'PNG Chunk Analyzer', 'Find text chunks, custom chunks and data after IEND.'],
            ['lsbDetector', 'LSB Stego Detector', 'Test image least-significant-bit hiding.'],
            ['entropyAnalyzer', 'Entropy Analyzer', 'Spot compressed, encrypted or packed regions.'],
        ],
        steps: [
            'Hash the file and note its original name, size and source.',
            'Check metadata, magic bytes and strings before deeper analysis.',
            'For PNG files, inspect chunks and look for extra data after IEND.',
            'For image hiding hints, try LSB extraction and scan the result.',
            'If another file or encoded blob appears, restart the same flow on it.',
        ],
        external: 'Use exiftool, binwalk, zsteg, steghide, foremost, volatility, Wireshark or tshark for deeper cases.',
    },
    {
        category: 'Reverse Engineering',
        keywords: ['reverse', 'reversing', 'binary', 'disassemble', 'decompile', 'crackme', 'license', 'serial', 'password check', 'vault', 'locking', 'elf', 'exe', 'apk', 'obfuscated', 'javascript', 'assembly', 'strings'],
        tools: [
            ['magicBytes', 'Magic Bytes ID', 'Identify the file type from its header.'],
            ['stringsExtractor', 'Strings Extractor', 'Find visible checks, messages, URLs and keys.'],
            ['elfParser', 'ELF Header Parser', 'Inspect architecture and ELF metadata.'],
            ['hexViewer', 'Hex Viewer', 'Look at offsets and raw bytes.'],
            ['deobfuscator', 'JS Deobfuscator', 'Clean up JavaScript challenge logic.'],
            ['disasmRef', 'Disasm Reference', 'Read common x86/x64 instructions while reversing.'],
            ['regexTester', 'Regex Tester', 'Extract flags, hashes and URLs from strings or source.'],
        ],
        steps: [
            'Identify the file type and architecture first.',
            'Extract strings and search for success, fail, password, key, admin and K4P.',
            'For JavaScript, deobfuscate and search for endpoints, comparisons and encoded literals.',
            'For compiled binaries, move to Ghidra or gdb after BlackBox gives the first map.',
            'Scan extracted strings and decoded constants for flags.',
        ],
        external: 'Use Ghidra, Cutter, radare2, gdb, ltrace, strace, jadx or apktool for full reversing.',
    },
    {
        category: 'Pwn / Binary Exploitation',
        keywords: ['pwn', 'overflow', 'buffer', 'segfault', 'crash', 'rop', 'shellcode', 'ret2win', 'ret2libc', 'heap', 'format string', 'canary', 'nx', 'pie', 'got', 'plt', 'libc', 'exploit'],
        tools: [
            ['elfParser', 'ELF Header Parser', 'Inspect binary architecture and entry metadata.'],
            ['patternGen', 'Pattern Generator', 'Find exact EIP/RIP overwrite offsets.'],
            ['stringHexConverter', 'String / Hex', 'Convert payload pieces and byte strings.'],
            ['shellcodeEncoder', 'Shellcode Encoder', 'Format shellcode and watch bad characters.'],
            ['ropReference', 'ROP Reference', 'Review common ROP techniques and gadget ideas.'],
            ['asmConverter', 'Assembly Reference', 'Check registers and instruction behavior.'],
        ],
        steps: [
            'Run basic binary checks externally, then record architecture and protections.',
            'Generate a cyclic pattern and crash the binary to find the overwrite offset.',
            'Convert addresses and payload fragments carefully before building the exploit.',
            'Try the simplest path first: ret2win, then ret2libc or ROP if needed.',
            'Keep every offset, leak and payload version documented.',
        ],
        external: 'Use pwntools, gdb/pwndbg, checksec, ROPgadget, ropper and one_gadget for real exploitation.',
    },
    {
        category: 'OSINT',
        keywords: ['osint', 'username', 'profile', 'social', 'email', 'domain', 'company', 'person', 'dossier', 'informant', 'leak', 'geolocation', 'map', 'photo', 'twitter', 'github', 'linkedin', 'instagram', 'google', 'dork'],
        tools: [
            ['dorkBuilder', 'Google Dork Builder', 'Build precise searches for exact clues and domains.'],
            ['usernameGen', 'Username Generator', 'Generate likely username variants.'],
            ['emailGuesser', 'Email Format Guesser', 'Build possible emails from names and domains.'],
            ['ipConverter', 'IP Converter', 'Convert unusual IP formats in clues.'],
            ['subnetCalc', 'Subnet Calculator', 'Understand CIDR ranges and network clues.'],
            ['shodanBuilder', 'Shodan Query Builder', 'Build scoped infrastructure queries when allowed.'],
        ],
        steps: [
            'Extract exact names, handles, domains, emails, dates, images and unusual phrases.',
            'Search exact phrases first, then broaden with dorks.',
            'Generate username and email variants from discovered names.',
            'Record source links and evidence, not just guesses.',
            'Decode odd strings or hidden metadata found during recon.',
        ],
        external: 'Use search engines, public profiles, maps and archive sites only within the challenge scope.',
    },
    {
        category: 'Network / PCAP',
        keywords: ['network', 'pcap', 'packet', 'capture', 'traffic', 'wireshark', 'tcp', 'udp', 'dns', 'stream', 'radio', 'transmission', 'frequency', 'intercept', 'communication'],
        tools: [
            ['stringsExtractor', 'Strings Extractor', 'Pull readable traffic artifacts from exports.'],
            ['hexDump', 'Hex Dump', 'Inspect raw packet payload exports.'],
            ['autoDecoder', 'Auto Decoder', 'Decode suspicious payload strings.'],
            ['fileHasher', 'File Hasher', 'Track exported files and reconstructed artifacts.'],
            ['morseTool', 'Morse Code', 'Decode radio-style dot/dash clues.'],
        ],
        steps: [
            'Open the capture externally and identify protocols, conversations and exported objects.',
            'Export suspicious payloads or files, then inspect them in BlackBox.',
            'Decode credentials, tokens, DNS labels or payload blobs with Auto Decoder.',
            'Hash reconstructed files and scan strings for flags.',
        ],
        external: 'Use Wireshark, tshark and NetworkMiner for filtering, stream following and object export.',
    },
    {
        category: 'Cloud / Web3 / Blockchain',
        keywords: ['cloud', 'aws', 's3', 'bucket', 'iam', 'gcp', 'azure', 'serverless', 'snapshot', 'blockchain', 'web3', 'contract', 'token', 'ledger', 'transaction', 'wallet', 'ethereum', 'solidity'],
        tools: [
            ['urlParser', 'URL Parser', 'Parse bucket URLs, API endpoints and object paths.'],
            ['headerParser', 'Header Parser', 'Inspect cloud/API response headers and auth hints.'],
            ['diffChecker', 'Diff Checker', 'Compare normal and privileged API responses.'],
            ['timestampConverter', 'Timestamp Converter', 'Decode block, token and log timestamps.'],
            ['hmacGenerator', 'HMAC Generator', 'Test request-signing clues if secrets are provided.'],
            ['autoDecoder', 'Auto Decoder', 'Decode object keys, tokens and leaked config values.'],
        ],
        steps: [
            'Record endpoints, account IDs, bucket names, regions, object paths and token values.',
            'Parse URLs and headers for region, service and permission clues.',
            'Compare API responses across roles or parameters.',
            'Decode timestamps, signatures or encoded config values.',
            'Use official CLIs only on challenge-provided resources.',
        ],
        external: 'Use aws/gcloud/az CLIs, block explorers, cast, foundry or hardhat when required.',
    },
    {
        category: 'AI / ML Security',
        keywords: ['ai', 'ml', 'model', 'prompt', 'jailbreak', 'injection', 'classifier', 'adversarial', 'guardrail', 'llm', 'system prompt', 'training', 'prediction'],
        tools: [
            ['ctfNotepad', 'CTF Notepad', 'Track prompts, responses and policy changes.'],
            ['diffChecker', 'Diff Checker', 'Compare successful and failed prompt outputs.'],
            ['autoDecoder', 'Auto Decoder', 'Decode leaked blobs or encoded model output.'],
            ['flagDetector', 'Flag Auto-Detector', 'Scan long responses and decoded variants.'],
            ['regexTester', 'Regex Tester', 'Extract structured leaks from model output.'],
        ],
        steps: [
            'Save each prompt and response before changing strategy.',
            'Compare responses to identify which words or structures change behavior.',
            'Look for hidden instructions, encoded strings and partial flags.',
            'Scan every long output for flags and encoded variants.',
        ],
        external: 'Use only the challenge model or sandbox. Do not target unrelated AI services.',
    },
    {
        category: 'Misc / Programming',
        keywords: ['misc', 'programming', 'script', 'automation', 'logic', 'puzzle', 'qr', 'morse', 'timestamp', 'uuid', 'diff', 'wordlist', 'password', 'generate', 'parse', 'format'],
        tools: [
            ['autoDecoder', 'Auto Decoder', 'Quickly test common encodings in puzzle text.'],
            ['qrTool', 'QR Code Tool', 'Read or generate QR codes.'],
            ['morseTool', 'Morse Code', 'Decode dot/dash clues.'],
            ['timestampConverter', 'Timestamp Converter', 'Convert Unix dates and time clues.'],
            ['uuidTool', 'UUID Tool', 'Inspect UUID version and structure.'],
            ['wordlistGen', 'Wordlist Generator', 'Generate challenge-themed candidate words.'],
            ['diffChecker', 'Diff Checker', 'Compare outputs, files or puzzle states.'],
        ],
        steps: [
            'Identify the exact input and expected output shape.',
            'Try simple decoders and format converters first.',
            'Use Diff Checker when two versions of text or output are provided.',
            'Generate small wordlists only when the challenge clearly hints at guessing or cracking.',
            'Automate repetitive logic externally once the pattern is clear.',
        ],
        external: 'Use a short Python or Node script for repeated transformations or large input processing.',
    },
];

const CHALLENGE_SIGNAL_PATTERNS = [
    ['URL present', /https?:\/\/[^\s"'<>]+/i],
    ['JWT-like token', /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]*/],
    ['Hex blob', /\b(?:0x)?[a-f0-9]{32,}\b/i],
    ['Base64-like blob', /\b[A-Za-z0-9+/]{24,}={0,2}\b/],
    ['Binary bytes', /\b[01]{8}(?:\s+[01]{8}){2,}\b/],
    ['Flag-like text', /\b[A-Z0-9_]{2,16}\{[^}]+\}/],
    ['File extension clue', /\.(png|jpg|jpeg|gif|wav|mp3|mp4|pcap|zip|tar|gz|elf|exe|apk|pdf)\b/i],
    ['Hash length clue', /\b[a-f0-9]{32}\b|\b[a-f0-9]{40}\b|\b[a-f0-9]{64}\b/i],
];

function buildChallengeAdvisor(panel){
    panel.innerHTML = `
    ${toolHeader('', 'Challenge Flow Advisor', 'Paste a challenge description and get a recommended BlackBox tool workflow')}
    <div class="tool-wrap">
        <div class="tool-title">Challenge Flow Advisor</div>
        <div class="info-box">Offline rule-based triage. It suggests BlackBox tools and outside tools from the wording of the challenge.</div>
        <label>Challenge Description</label>
        <textarea id="challengeAdvisorInput" style="min-height:170px;" placeholder="Paste the challenge title, category, description, hints, file names, URLs, sample output or suspicious strings..."></textarea>
        <div class="button-group">
            <button class="btn btn-run" onclick="runChallengeAdvisor()">Build Tool Flow</button>
            <button class="btn btn-outline" onclick="clearChallengeAdvisor()">Clear</button>
        </div>
        ${createOutput('challengeAdvisorOutput', 'Recommended Flow')}
    </div>`;
    autoSaveInput('challengeAdvisorInput', 'challengeAdvisor');
}

function challengeKeywordMatches(text, keyword){
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if(/\s/.test(keyword)) return text.includes(keyword);
    return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, 'i').test(text);
}

function scoreChallengeRule(text, rule){
    let score = 0;
    const hits = [];
    for(const keyword of rule.keywords){
        if(challengeKeywordMatches(text, keyword)){
            score += keyword.length > 5 ? 2 : 1;
            hits.push(keyword);
        }
    }
    return { rule, score, hits };
}

function uniqueAdvisorTools(tools){
    const seen = new Set();
    return tools
        .map(tool => Array.isArray(tool) ? { id: tool[0], name: tool[1], reason: tool[2] } : tool)
        .filter(tool => {
            if(seen.has(tool.id)) return false;
            seen.add(tool.id);
            return true;
        });
}

function getChallengeSignals(text){
    return CHALLENGE_SIGNAL_PATTERNS
        .filter(([, regex]) => regex.test(text))
        .map(([label]) => label);
}

function getAdvisorToolButton(tool){
    return TOOL_NAMES[tool.id]
        ? `<button class="output-action-btn" onclick="showTool('${tool.id}')">Open</button>`
        : '';
}

function runChallengeAdvisor(){
    const input = document.getElementById('challengeAdvisorInput').value.trim();
    if(!input){ showToast('Paste a challenge description first', 'error'); return; }

    const scored = CHALLENGE_FLOW_RULES
        .map(rule => scoreChallengeRule(input.toLowerCase(), rule))
        .sort((a, b) => b.score - a.score);
    const matches = scored.filter(item => item.score > 0).slice(0, 3);
    const primary = matches[0] || {
        rule: {
            category: 'General CTF Triage',
            tools: [
                ['ctfNotepad', 'CTF Notepad', 'Record facts, files, URLs and guesses.'],
                ['flagDetector', 'Flag Auto-Detector', 'Scan direct text and common decoded variants.'],
                ['autoDecoder', 'Auto Decoder', 'Try common encodings and simple ciphers.'],
                ['stringsExtractor', 'Strings Extractor', 'Extract text from provided files.'],
                ['diffChecker', 'Diff Checker', 'Compare similar outputs or responses.'],
            ],
            steps: [
                'Save the challenge title, category, files and exact prompt in CTF Notepad.',
                'Scan the prompt and any provided output for flags.',
                'Try Auto Decoder on every suspicious blob.',
                'If files are provided, identify type, extract strings and inspect metadata.',
                'Move into a specialist category once a stronger clue appears.',
            ],
            external: 'Use the challenge category, file type and first extracted clue to choose deeper tools.',
        },
        score: 0,
        hits: [],
    };

    const suggestedTools = uniqueAdvisorTools([
        ['ctfNotepad', 'CTF Notepad', 'Save the description, assumptions, commands, credentials and final flag.'],
        ['flagDetector', 'Flag Auto-Detector', 'Check the prompt and every decoded result for K4P{...}.'],
        ...primary.rule.tools,
        ['autoDecoder', 'Auto Decoder', 'Use as a quick sanity pass on suspicious text.'],
    ]).slice(0, 10);
    const signals = getChallengeSignals(input);
    const confidence = primary.score >= 6 ? 'High' : primary.score >= 3 ? 'Medium' : primary.score > 0 ? 'Low' : 'General';
    const secondary = matches.slice(1);

    const html = `
    <div style="display:grid; gap:14px;">
        <div style="padding:14px; background:var(--panel-light); border-radius:var(--radius-sm); border-left:3px solid var(--primary);">
            <div style="color:var(--muted); font-size:11px; text-transform:uppercase; margin-bottom:6px;">Likely Path</div>
            <div style="font-size:18px; font-weight:800; color:var(--text);">${escapeHtml(primary.rule.category)}</div>
            <div style="color:var(--muted); font-size:13px; margin-top:6px;">Confidence: ${confidence}${primary.hits.length ? ` - matched: ${escapeHtml(primary.hits.slice(0, 8).join(', '))}` : ''}</div>
        </div>

        ${signals.length ? `
        <div style="padding:12px; background:var(--panel-light); border-radius:var(--radius-sm);">
            <div style="color:var(--primary); font-size:12px; font-weight:700; margin-bottom:8px;">Detected Signals</div>
            <div style="display:flex; gap:8px; flex-wrap:wrap;">
                ${signals.map(signal => `<span style="padding:5px 8px; border:1px solid var(--border); border-radius:999px; color:var(--muted-light); font-size:12px;">${escapeHtml(signal)}</span>`).join('')}
            </div>
        </div>` : ''}

        ${secondary.length ? `
        <div style="padding:12px; background:var(--panel-light); border-radius:var(--radius-sm);">
            <div style="color:var(--primary); font-size:12px; font-weight:700; margin-bottom:8px;">Also Consider</div>
            ${secondary.map(item => `
                <div style="font-size:13px; color:var(--muted-light); margin-bottom:5px;">
                    <strong style="color:var(--text);">${escapeHtml(item.rule.category)}</strong> - matched ${item.score} signal${item.score === 1 ? '' : 's'}
                </div>`).join('')}
        </div>` : ''}

        <div>
            <div style="color:var(--primary); font-size:12px; font-weight:700; margin-bottom:8px;">Recommended BlackBox Tools</div>
            ${suggestedTools.map((tool, index) => `
            <div style="padding:12px; background:var(--panel-light); border-radius:var(--radius-sm); margin-bottom:8px;">
                <div style="display:flex; justify-content:space-between; gap:12px; align-items:flex-start;">
                    <div style="min-width:0;">
                        <div style="font-weight:800; color:var(--text);">${index + 1}. ${escapeHtml(tool.name)}</div>
                        <div style="color:var(--muted); font-size:13px; margin-top:4px;">${escapeHtml(tool.reason)}</div>
                    </div>
                    ${getAdvisorToolButton(tool)}
                </div>
            </div>`).join('')}
        </div>

        <div>
            <div style="color:var(--primary); font-size:12px; font-weight:700; margin-bottom:8px;">Suggested Flow</div>
            ${primary.rule.steps.map((step, index) => `
            <div style="display:flex; gap:10px; padding:10px 0; border-bottom:1px solid var(--border);">
                <div style="color:var(--primary); font-family:var(--font-mono); min-width:24px;">${index + 1}</div>
                <div style="color:var(--text); font-size:13px;">${escapeHtml(step)}</div>
            </div>`).join('')}
        </div>

        <div style="padding:12px; background:rgba(210,153,34,0.1); border:1px solid rgba(210,153,34,0.35); border-radius:var(--radius-sm); color:var(--muted-light); font-size:13px;">
            <strong style="color:var(--warning);">Outside BlackBox:</strong> ${escapeHtml(primary.rule.external)}
        </div>
    </div>`;

    setOutput('challengeAdvisorOutput', html, true);
    showToast('Tool flow generated');
}

function clearChallengeAdvisor(){
    document.getElementById('challengeAdvisorInput').value = '';
    const out = document.getElementById('challengeAdvisorOutput');
    if(out) out.innerHTML = TOOL_PLACEHOLDER;
}

// =========================
// FLAG AUTO-DETECTOR
// =========================

const FLAG_PATTERNS = [
    { name: 'flag{...}', regex: /flag\{[^}]+\}/gi },
    { name: 'CTF{...}', regex: /ctf\{[^}]+\}/gi },
    { name: 'HTB{...}', regex: /HTB\{[^}]+\}/gi },
    { name: 'picoCTF{...}', regex: /picoCTF\{[^}]+\}/gi },
    { name: 'DUCTF{...}', regex: /DUCTF\{[^}]+\}/gi },
    { name: 'THM{...}', regex: /THM\{[^}]+\}/gi },
    { name: 'Generic prefix{...}', regex: /[A-Z0-9_]{2,16}\{[a-zA-Z0-9_\-!@#$%^&*.:|]+\}/g },
];

function buildFlagDetector(panel){
    panel.innerHTML = `
    ${toolHeader('', 'Flag Auto-Detector', 'Scan text and decoded variants for hidden flags')}
    <div class="tool-wrap">
        <div class="tool-title">Flag Auto-Detector</div>
        <div class="info-box">Scans direct text plus Base64, hex, ROT13 and URL-decoded variants.</div>
        <label>Input</label>
        <textarea id="flagDetInput" style="min-height:160px;" placeholder="Paste output, encoded text, logs, dumps or challenge data..."></textarea>
        <div class="button-group">
            <button class="btn btn-run" onclick="runFlagDetector()">Scan for Flags</button>
            <button class="btn btn-outline" onclick="clearFlagDet()">Clear</button>
        </div>
        ${createOutput('flagDetOutput', 'Scan Results')}
    </div>`;
    autoSaveInput('flagDetInput', 'flagDetector');
}

function scanForFlags(text){
    const found = [];
    for(const pattern of FLAG_PATTERNS){
        const matches = [...String(text || '').matchAll(new RegExp(pattern.regex.source, pattern.regex.flags))];
        matches.forEach(match => found.push({ pattern: pattern.name, value: match[0] }));
    }
    return found;
}

function addFlagFindings(target, source, text){
    scanForFlags(text).forEach(flag => target.push({ source, ...flag }));
}

function runFlagDetector(){
    const text = document.getElementById('flagDetInput').value;
    if(!text){ showToast('Paste some text first', 'error'); return; }

    const findings = [];
    addFlagFindings(findings, 'Direct', text);

    try{
        const chunks = text.match(/[A-Za-z0-9+/]{12,}={0,2}/g) || [];
        chunks.forEach(chunk => {
            try{ addFlagFindings(findings, `Base64: ${chunk.slice(0, 24)}...`, atob(chunk)); } catch(e){}
        });
    } catch(e){}

    try{
        const compactHex = text.replace(/\s+/g, '');
        const chunks = compactHex.match(/[0-9a-fA-F]{12,}/g) || [];
        chunks.forEach(hex => {
            if(hex.length % 2 !== 0) return;
            try{
                const decoded = hex.match(/.{2}/g).map(byte => String.fromCharCode(parseInt(byte, 16))).join('');
                addFlagFindings(findings, 'Hex decoded', decoded);
            } catch(e){}
        });
    } catch(e){}

    try{
        const rot13 = text.split('').map(char => {
            if(char >= 'A' && char <= 'Z') return String.fromCharCode((char.charCodeAt(0) - 65 + 13) % 26 + 65);
            if(char >= 'a' && char <= 'z') return String.fromCharCode((char.charCodeAt(0) - 97 + 13) % 26 + 97);
            return char;
        }).join('');
        addFlagFindings(findings, 'ROT13 decoded', rot13);
    } catch(e){}

    try{
        if(text.includes('%')) addFlagFindings(findings, 'URL decoded', decodeURIComponent(text));
    } catch(e){}

    const unique = [];
    const seen = new Set();
    for(const finding of findings){
        if(seen.has(finding.value)) continue;
        seen.add(finding.value);
        unique.push(finding);
    }

    if(!unique.length){
        setOutput('flagDetOutput', `
        <div style="color:var(--muted); text-align:center; padding:20px;">
            <div>No flags detected in direct text or decoded variants.</div>
            <div style="font-size:12px; margin-top:8px;">Try the Auto Decoder or a specific decoder if you suspect another layer.</div>
        </div>`, true);
        return;
    }

    const html = `
    <div style="color:var(--success); font-weight:700; margin-bottom:16px;">${unique.length} flag${unique.length > 1 ? 's' : ''} found</div>
    ${unique.map(finding => `
    <div style="padding:14px; background:var(--panel-light); border-radius:var(--radius-sm);
                margin-bottom:10px; border-left:3px solid var(--success);">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px;">
            <div style="flex:1;">
                <div style="color:var(--muted); font-size:11px; margin-bottom:6px; text-transform:uppercase;">
                    ${escapeHtml(finding.source)} - ${escapeHtml(finding.pattern)}
                </div>
                <div style="font-family:var(--font-mono); color:var(--success); font-size:14px;
                            font-weight:700; word-break:break-all;">${escapeHtml(finding.value)}</div>
            </div>
            <button class="output-action-btn" onclick="copyText('${finding.value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}', this)">Copy</button>
        </div>
    </div>`).join('')}`;
    setOutput('flagDetOutput', html, true);
    showToast(`Found ${unique.length} flag${unique.length > 1 ? 's' : ''}`);
}

function clearFlagDet(){
    document.getElementById('flagDetInput').value = '';
    const out = document.getElementById('flagDetOutput');
    if(out) out.innerHTML = TOOL_PLACEHOLDER;
}

// =========================
// AUTO DECODER
// =========================

function buildAutoDecoder(panel){
    panel.innerHTML = `
    ${toolHeader('', 'Auto Decoder', 'Try common encodings and simple ciphers automatically')}
    <div class="tool-wrap">
        <div class="tool-title">Auto Decoder</div>
        <div class="info-box">Runs common decoders and highlights readable or CTF-looking results.</div>
        <label>Input</label>
        <textarea id="autoDecInput" style="min-height:120px;" placeholder="Paste Base64, hex, binary, Morse, ROT13, URL encoding or layered challenge data..."></textarea>
        <div class="button-group">
            <button class="btn btn-run" onclick="runAutoDecoder()">Auto Decode Everything</button>
            <button class="btn btn-outline" onclick="clearAutoDec()">Clear</button>
        </div>
        ${createOutput('autoDecOutput', 'All Possible Decodings')}
    </div>`;
    autoSaveInput('autoDecInput', 'autoDecoder');
}

function autoPrintableRatio(value){
    if(!value) return 0;
    const chars = Array.from(String(value));
    const printable = chars.filter(char => {
        const code = char.charCodeAt(0);
        return code === 9 || code === 10 || code === 13 || (code >= 32 && code <= 126);
    }).length;
    return printable / chars.length;
}

function autoInteresting(value){
    return /flag|ctf|key|pass|secret|admin|root|token/i.test(value) || autoPrintableRatio(value) >= 0.9;
}

function runAutoDecoder(){
    const input = document.getElementById('autoDecInput').value.trim();
    if(!input){ showToast('Paste something to decode', 'error'); return; }

    const results = [];
    const tryAdd = (method, decoder) => {
        try{
            const result = decoder();
            if(!result || result === input || autoPrintableRatio(result) < 0.65) return;
            if(results.some(item => item.result === result && item.method === method)) return;
            results.push({ method, result, interesting: autoInteresting(result) });
        } catch(e){}
    };

    tryAdd('Base64', () => atob(input.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(input.length / 4) * 4, '=')));
    tryAdd('Base32', () => decodeBase32(input));
    tryAdd('Hex', () => input.replace(/\s|0x|\\x/gi, '').match(/.{2}/g).map(byte => String.fromCharCode(parseInt(byte, 16))).join(''));
    tryAdd('Binary', () => input.replace(/\s/g, '').match(/.{8}/g).map(byte => String.fromCharCode(parseInt(byte, 2))).join(''));
    tryAdd('URL Decode', () => decodeURIComponent(input));
    tryAdd('HTML Entities', () => {
        const div = document.createElement('div');
        div.innerHTML = input;
        return div.textContent;
    });
    tryAdd('ROT13', () => caesarShift(input, 13));
    tryAdd('ROT47', () => input.split('').map(char => {
        const code = char.charCodeAt(0);
        return code >= 33 && code <= 126 ? String.fromCharCode(((code - 33 + 47) % 94) + 33) : char;
    }).join(''));
    tryAdd('Atbash', () => input.split('').map(char => {
        if(char >= 'A' && char <= 'Z') return String.fromCharCode(90 - (char.charCodeAt(0) - 65));
        if(char >= 'a' && char <= 'z') return String.fromCharCode(122 - (char.charCodeAt(0) - 97));
        return char;
    }).join(''));
    tryAdd('Morse Code', () => morseToText(input));
    tryAdd('Unicode Escape', () => input.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16))));
    tryAdd('Hex Escape', () => input.replace(/\\x([0-9a-fA-F]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16))));
    tryAdd('Octal', () => input.trim().split(/\s+/).map(part => String.fromCharCode(parseInt(part, 8))).join(''));
    tryAdd('Double Base64', () => atob(atob(input)));

    for(let shift = 1; shift <= 25; shift++){
        tryAdd(`Caesar shift ${shift}`, () => caesarShift(input, shift));
    }

    if(!results.length){
        setOutput('autoDecOutput', `
        <div style="color:var(--muted); text-align:center; padding:20px;">
            <div>Could not automatically decode this input.</div>
            <div style="font-size:12px; margin-top:8px;">Try a specific decoder or add a manual step in Tool Chainer.</div>
        </div>`, true);
        return;
    }

    results.sort((a, b) => Number(b.interesting) - Number(a.interesting));
    const html = `
    <div style="color:var(--muted); font-size:13px; margin-bottom:16px;">
        Found ${results.length} possible decoding${results.length > 1 ? 's' : ''}. Highlighted results contain interesting patterns.
    </div>
    ${results.map(item => `
    <div style="padding:12px; background:var(--panel-light); border-radius:var(--radius-sm);
                margin-bottom:8px; border-left:3px solid ${item.interesting ? 'var(--success)' : 'var(--border)'};">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px;">
            <div style="flex:1;">
                <div style="color:${item.interesting ? 'var(--success)' : 'var(--primary)'};
                            font-size:11px; margin-bottom:5px; font-weight:700;">${escapeHtml(item.method)}</div>
                <div style="font-family:var(--font-mono); font-size:13px; word-break:break-all; color:var(--text);">
                    ${escapeHtml(item.result.slice(0, 500))}${item.result.length > 500 ? '...' : ''}
                </div>
            </div>
            <button class="output-action-btn" onclick="copyText('${item.result.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n')}', this)">Copy</button>
        </div>
    </div>`).join('')}`;
    setOutput('autoDecOutput', html, true);
}

function clearAutoDec(){
    document.getElementById('autoDecInput').value = '';
    const out = document.getElementById('autoDecOutput');
    if(out) out.innerHTML = TOOL_PLACEHOLDER;
}

// =========================
// CTF NOTEPAD
// =========================

function buildCtfNotepad(panel){
    panel.innerHTML = `
    ${toolHeader('', 'CTF Notepad', 'Save flags, notes and credentials in local storage')}
    <div class="tool-wrap">
        <div class="tool-title">CTF Notepad</div>
        <div class="info-box">Notes are saved in this browser only.</div>
        <div class="tabs">
            <button class="tab-btn active" onclick="switchTab(this,'notepadNotes')">Notes</button>
            <button class="tab-btn" onclick="switchTab(this,'notepadFlags')">Flags</button>
            <button class="tab-btn" onclick="switchTab(this,'notepadCreds')">Credentials</button>
        </div>
        <div class="tab-content active" id="notepadNotes">
            <label>Competition Notes</label>
            <textarea id="notepadText" style="min-height:200px;" placeholder="Write notes here..." oninput="saveNotepad()"></textarea>
            <div class="button-group">
                <button class="btn btn-outline" onclick="clearNotepadNotes()">Clear Notes</button>
                <button class="btn btn-outline" onclick="exportNotepad()">Export All</button>
            </div>
        </div>
        <div class="tab-content" id="notepadFlags">
            <div style="display:grid; grid-template-columns:1fr 1fr auto; gap:10px; margin-bottom:12px;">
                <input type="text" id="flagInput" placeholder="flag{...}" style="margin:0;">
                <input type="text" id="flagChallenge" placeholder="Challenge name" style="margin:0;">
                <button class="btn btn-run" onclick="addFlag()" style="flex-shrink:0;">Add Flag</button>
            </div>
            <div id="flagList"></div>
        </div>
        <div class="tab-content" id="notepadCreds">
            <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; margin-bottom:12px;">
                <input type="text" id="credService" placeholder="Service / URL" style="margin:0;">
                <input type="text" id="credUser" placeholder="Username" style="margin:0;">
                <input type="text" id="credPass" placeholder="Password" style="margin:0;">
            </div>
            <button class="btn btn-run" onclick="addCred()" style="margin-bottom:12px;">Add Credential</button>
            <div id="credList"></div>
        </div>
    </div>`;
    loadNotepad();
    renderFlags();
    renderCreds();
}

function getJsonStore(key){
    try{ return JSON.parse(localStorage.getItem(key) || '[]'); } catch(e){ return []; }
}

function setJsonStore(key, value){
    localStorage.setItem(key, JSON.stringify(value));
}

function saveNotepad(){
    localStorage.setItem('bb_notepad_notes', document.getElementById('notepadText').value);
}

function loadNotepad(){
    const el = document.getElementById('notepadText');
    if(el) el.value = localStorage.getItem('bb_notepad_notes') || '';
}

function clearNotepadNotes(){
    document.getElementById('notepadText').value = '';
    localStorage.removeItem('bb_notepad_notes');
    showToast('Notes cleared');
}

function addFlag(){
    const flag = document.getElementById('flagInput').value.trim();
    const challenge = document.getElementById('flagChallenge').value.trim();
    if(!flag){ showToast('Enter a flag', 'error'); return; }
    const flags = getJsonStore('bb_flags');
    flags.push({ flag, challenge, time: new Date().toLocaleString() });
    setJsonStore('bb_flags', flags);
    document.getElementById('flagInput').value = '';
    document.getElementById('flagChallenge').value = '';
    renderFlags();
}

function renderFlags(){
    const el = document.getElementById('flagList');
    if(!el) return;
    const flags = getJsonStore('bb_flags');
    if(!flags.length){
        el.innerHTML = '<div style="color:var(--muted); text-align:center; padding:20px;">No flags saved yet.</div>';
        return;
    }
    el.innerHTML = flags.map((item, index) => `
    <div style="padding:10px; background:var(--panel-light); border-radius:var(--radius-sm);
                margin-bottom:6px; border-left:3px solid var(--success);">
        <div style="display:flex; justify-content:space-between; align-items:center; gap:12px;">
            <div style="min-width:0;">
                <div style="color:var(--success); font-family:var(--font-mono); font-weight:700; word-break:break-all;">${escapeHtml(item.flag)}</div>
                <div style="color:var(--muted); font-size:12px;">${escapeHtml(item.challenge || 'Untitled')} - ${escapeHtml(item.time)}</div>
            </div>
            <div style="display:flex; gap:6px;">
                <button class="output-action-btn" onclick="copyText('${item.flag.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}', this)">Copy</button>
                <button class="output-action-btn" onclick="deleteFlag(${index})" style="color:var(--danger);">Delete</button>
            </div>
        </div>
    </div>`).join('');
}

function deleteFlag(index){
    const flags = getJsonStore('bb_flags');
    flags.splice(index, 1);
    setJsonStore('bb_flags', flags);
    renderFlags();
}

function addCred(){
    const service = document.getElementById('credService').value.trim();
    const user = document.getElementById('credUser').value.trim();
    const pass = document.getElementById('credPass').value.trim();
    if(!service && !user){ showToast('Enter at least service and username', 'error'); return; }
    const creds = getJsonStore('bb_creds');
    creds.push({ service, user, pass, time: new Date().toLocaleString() });
    setJsonStore('bb_creds', creds);
    ['credService', 'credUser', 'credPass'].forEach(id => { document.getElementById(id).value = ''; });
    renderCreds();
}

function renderCreds(){
    const el = document.getElementById('credList');
    if(!el) return;
    const creds = getJsonStore('bb_creds');
    if(!creds.length){
        el.innerHTML = '<div style="color:var(--muted); text-align:center; padding:20px;">No credentials saved yet.</div>';
        return;
    }
    el.innerHTML = creds.map((item, index) => `
    <div style="padding:10px; background:var(--panel-light); border-radius:var(--radius-sm);
                margin-bottom:6px; border-left:3px solid var(--warning);">
        <div style="display:flex; justify-content:space-between; align-items:center; gap:12px;">
            <div style="display:flex; gap:16px; flex-wrap:wrap; font-size:13px; min-width:0;">
                <span><span style="color:var(--muted);">Service:</span> <strong>${escapeHtml(item.service)}</strong></span>
                <span><span style="color:var(--muted);">User:</span> <strong>${escapeHtml(item.user)}</strong></span>
                <span><span style="color:var(--muted);">Pass:</span> <strong>${escapeHtml(item.pass)}</strong></span>
            </div>
            <div style="display:flex; gap:6px;">
                <button class="output-action-btn" onclick="copyText('${`${item.user}:${item.pass}`.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}', this)">Copy</button>
                <button class="output-action-btn" onclick="deleteCred(${index})" style="color:var(--danger);">Delete</button>
            </div>
        </div>
    </div>`).join('');
}

function deleteCred(index){
    const creds = getJsonStore('bb_creds');
    creds.splice(index, 1);
    setJsonStore('bb_creds', creds);
    renderCreds();
}

function exportNotepad(){
    const notes = document.getElementById('notepadText')?.value || '';
    const flags = getJsonStore('bb_flags');
    const creds = getJsonStore('bb_creds');
    const text =
        `BLACKBOX CTF NOTES EXPORT\n${'='.repeat(50)}\nExported: ${new Date().toLocaleString()}\n\n` +
        `NOTES\n${'-'.repeat(40)}\n${notes}\n\n` +
        `FLAGS FOUND\n${'-'.repeat(40)}\n${flags.map(item => `[${item.challenge || 'Untitled'}] ${item.flag}`).join('\n') || 'None'}\n\n` +
        `CREDENTIALS\n${'-'.repeat(40)}\n${creds.map(item => `${item.service} | ${item.user} | ${item.pass}`).join('\n') || 'None'}\n`;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ctf-notes-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}

// =========================
// TOOL CHAINER
// =========================

const CHAIN_OPS = [
    'Base64 Decode', 'Base64 Encode',
    'Hex Decode', 'Hex Encode',
    'URL Decode', 'URL Encode',
    'HTML Decode', 'HTML Encode',
    'ROT13', 'ROT47', 'Atbash',
    'Binary Decode', 'Binary Encode',
    'Base32 Decode', 'Base32 Encode',
    'Reverse String', 'To Uppercase', 'To Lowercase',
    'Remove Spaces', 'Remove Newlines',
    'Unicode Decode', 'Hex Escape Decode',
    'Caesar +1', 'Caesar +3', 'Caesar +13',
];

function buildToolChainer(panel){
    panel.innerHTML = `
    ${toolHeader('', 'Tool Chainer', 'Pipe outputs through multiple decode or transform steps')}
    <div class="tool-wrap">
        <div class="tool-title">Tool Chainer</div>
        <div class="info-box">The output of each step becomes the input for the next step.</div>
        <label>Initial Input</label>
        <textarea id="chainInput" style="min-height:80px;" placeholder="Paste your starting data..."></textarea>
        <div style="margin:16px 0;">
            <div style="color:var(--muted); font-size:12px; margin-bottom:8px;">Chain Steps</div>
            <div id="chainSteps"></div>
            <button class="btn btn-outline btn-sm" onclick="addChainStep()" style="margin-top:8px;">Add Step</button>
        </div>
        <div class="button-group">
            <button class="btn btn-run" onclick="runToolChainer()">Run Chain</button>
            <button class="btn btn-outline" onclick="clearChainer()">Clear All</button>
        </div>
        <div id="chainResults"></div>
    </div>`;
    addChainStep();
    addChainStep();
}

function addChainStep(){
    const container = document.getElementById('chainSteps');
    const index = container.children.length;
    const row = document.createElement('div');
    row.style.cssText = 'display:flex; gap:8px; align-items:center; margin-bottom:6px;';
    row.innerHTML = `
        <span style="color:var(--muted); min-width:24px; text-align:center; font-size:13px;">${index + 1}</span>
        <select class="chain-op" style="flex:1; margin:0;">${CHAIN_OPS.map(op => `<option value="${op}">${op}</option>`).join('')}</select>
        <button class="output-action-btn" onclick="this.parentElement.remove(); renumberSteps();">x</button>`;
    container.appendChild(row);
}

function renumberSteps(){
    document.querySelectorAll('#chainSteps > div').forEach((row, index) => {
        const label = row.querySelector('span');
        if(label) label.textContent = index + 1;
    });
}

function applyChainOp(input, op){
    switch(op){
        case 'Base64 Decode': return atob(input.replace(/-/g, '+').replace(/_/g, '/'));
        case 'Base64 Encode': return btoa(input);
        case 'Hex Decode': return input.replace(/\s|0x|\\x/gi, '').match(/.{2}/g).map(byte => String.fromCharCode(parseInt(byte, 16))).join('');
        case 'Hex Encode': return Array.from(input).map(char => char.charCodeAt(0).toString(16).padStart(2, '0')).join(' ');
        case 'URL Decode': return decodeURIComponent(input);
        case 'URL Encode': return encodeURIComponent(input);
        case 'HTML Decode': {
            const div = document.createElement('div');
            div.innerHTML = input;
            return div.textContent;
        }
        case 'HTML Encode': return input.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        case 'ROT13': return caesarShift(input, 13);
        case 'ROT47': return input.split('').map(char => {
            const code = char.charCodeAt(0);
            return code >= 33 && code <= 126 ? String.fromCharCode(((code - 33 + 47) % 94) + 33) : char;
        }).join('');
        case 'Atbash': return input.split('').map(char => {
            if(char >= 'A' && char <= 'Z') return String.fromCharCode(90 - (char.charCodeAt(0) - 65));
            if(char >= 'a' && char <= 'z') return String.fromCharCode(122 - (char.charCodeAt(0) - 97));
            return char;
        }).join('');
        case 'Binary Decode': return input.trim().split(/\s+/).map(byte => String.fromCharCode(parseInt(byte, 2))).join('');
        case 'Binary Encode': return Array.from(input).map(char => char.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
        case 'Base32 Decode': return decodeBase32(input);
        case 'Base32 Encode': return encodeBase32(input);
        case 'Reverse String': return input.split('').reverse().join('');
        case 'To Uppercase': return input.toUpperCase();
        case 'To Lowercase': return input.toLowerCase();
        case 'Remove Spaces': return input.replace(/\s/g, '');
        case 'Remove Newlines': return input.replace(/\n/g, '');
        case 'Unicode Decode': return input.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
        case 'Hex Escape Decode': return input.replace(/\\x([0-9a-fA-F]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
        case 'Caesar +1': return caesarShift(input, 1);
        case 'Caesar +3': return caesarShift(input, 3);
        case 'Caesar +13': return caesarShift(input, 13);
        default: return input;
    }
}

function runToolChainer(){
    const input = document.getElementById('chainInput').value;
    if(!input){ showToast('Enter initial input', 'error'); return; }
    const ops = [...document.querySelectorAll('.chain-op')].map(select => select.value);
    if(!ops.length){ showToast('Add at least one step', 'error'); return; }

    let current = input;
    let html = `
    <div style="margin-top:16px;">
        <div style="color:var(--muted); font-size:12px; margin-bottom:12px;">Chain Results</div>
        <div style="padding:10px; background:var(--panel-light); border-radius:var(--radius-sm); margin-bottom:6px;">
            <div style="color:var(--muted); font-size:11px; margin-bottom:4px;">Input</div>
            <div style="font-family:var(--font-mono); font-size:13px; word-break:break-all;">${escapeHtml(current)}</div>
        </div>`;

    for(let i = 0; i < ops.length; i++){
        try{
            current = applyChainOp(current, ops[i]);
            const hasFlag = /flag\{|ctf\{|HTB\{/i.test(current);
            html += `
            <div style="padding:10px; background:var(--panel-light); border-radius:var(--radius-sm);
                        margin-bottom:6px; border-left:3px solid ${hasFlag ? 'var(--success)' : 'var(--border)'};">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px;">
                    <div style="flex:1;">
                        <div style="color:${hasFlag ? 'var(--success)' : 'var(--primary)'}; font-size:11px; margin-bottom:4px;">
                            Step ${i + 1}: ${escapeHtml(ops[i])}
                        </div>
                        <div style="font-family:var(--font-mono); font-size:13px; word-break:break-all;">${escapeHtml(current)}</div>
                    </div>
                    <button class="output-action-btn" onclick="copyText('${current.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n')}', this)">Copy</button>
                </div>
            </div>`;
        } catch(error){
            html += `<div style="padding:8px; background:rgba(248,81,73,0.1); border-radius:6px;
                                margin-bottom:6px; color:var(--danger); font-size:13px;">
                Step ${i + 1} (${escapeHtml(ops[i])}) failed: ${escapeHtml(error.message)}
            </div>`;
        }
    }
    html += '</div>';
    document.getElementById('chainResults').innerHTML = html;
}

function clearChainer(){
    document.getElementById('chainInput').value = '';
    document.getElementById('chainSteps').innerHTML = '';
    document.getElementById('chainResults').innerHTML = '';
    addChainStep();
    addChainStep();
}
