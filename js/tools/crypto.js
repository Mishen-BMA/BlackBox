// =========================
// HASH GENERATOR
// =========================

function buildHashGenerator(panel){
    panel.innerHTML = `
    ${toolHeader('', 'Hash Generator', 'Generate MD5, SHA1, SHA256, SHA512, SHA3 and RIPEMD hashes')}

    <div class="tool-wrap">
        <div class="tool-title">Hash Generator</div>
        <label>Input Text</label>
        <textarea id="hashGenInput" placeholder="Enter text to hash..."></textarea>
        <div class="button-group">
            <button class="btn btn-run" onclick="runHashGenerator()">Generate All</button>
            <button class="btn btn-outline" onclick="clearHashGen()">Clear</button>
        </div>
        ${createOutput('hashGenOutput', 'Hash Results')}
    </div>`;
    autoSaveInput('hashGenInput', 'hashGenerator');
}

function runHashGenerator(){
    const text = document.getElementById('hashGenInput').value;
    if(!text){ showToast('Enter some text first', 'error'); return; }

    const results = [
        { type: 'MD5',        hash: CryptoJS.MD5(text).toString() },
        { type: 'SHA1',       hash: CryptoJS.SHA1(text).toString() },
        { type: 'SHA224',     hash: CryptoJS.SHA224(text).toString() },
        { type: 'SHA256',     hash: CryptoJS.SHA256(text).toString() },
        { type: 'SHA384',     hash: CryptoJS.SHA384(text).toString() },
        { type: 'SHA512',     hash: CryptoJS.SHA512(text).toString() },
        { type: 'SHA3-256',   hash: CryptoJS.SHA3(text, { outputLength: 256 }).toString() },
        { type: 'SHA3-512',   hash: CryptoJS.SHA3(text, { outputLength: 512 }).toString() },
        { type: 'RIPEMD-160', hash: CryptoJS.RIPEMD160(text).toString() },
    ];

    const html = results.map(r => `
        <div style="margin-bottom:12px; padding-bottom:12px; border-bottom:1px solid var(--border);">
            <div style="color:var(--primary); font-size:12px; margin-bottom:4px; font-family:var(--font);">
                ${r.type}
            </div>
            <div style="word-break:break-all; font-family:var(--font-mono); font-size:13px;">
                ${r.hash}
            </div>
            <button class="output-action-btn" style="margin-top:6px;"
                onclick="copyText('${r.hash}', this)">Copy</button>
        </div>
    `).join('');

    setOutput('hashGenOutput', html, true);
}

function clearHashGen(){
    document.getElementById('hashGenInput').value = '';
    const out = document.getElementById('hashGenOutput');
    if(out) out.innerHTML = '<span style="color:var(--muted)">Result will appear here...</span>';
}

// =========================
// HASH CRACKER
// =========================

function buildHashCracker(panel){
    panel.innerHTML = `
    ${toolHeader('', 'Hash Cracker', 'Crack common hex hashes using wordlists')}

    <div class="tool-wrap">
        <div class="tool-title">Hash Cracker</div>
        <label>Hash to Crack</label>
        <input type="text" id="crackInput" placeholder="Paste hash here...">
        <div id="crackHashInfo" class="info-box" style="display:none;"></div>

        <label>Hash Type</label>
        <select id="crackType">
            <option value="auto" selected>Auto Detect</option>
            <option value="MD5">MD5</option>
            <option value="SHA1">SHA1</option>
            <option value="RIPEMD160">RIPEMD160</option>
            <option value="SHA224">SHA224</option>
            <option value="SHA256">SHA256</option>
            <option value="SHA3-256">SHA3-256 / Keccak-256</option>
            <option value="SHA384">SHA384</option>
            <option value="SHA512">SHA512</option>
            <option value="SHA3-512">SHA3-512 / Keccak-512</option>
        </select>

        <label>Wordlist</label>
        <select id="wordlistSelect">
            <option value="common">Common Passwords</option>
            <option value="rockyou">RockYou Mini</option>
            <option value="ctf">CTF Common</option>
            <option value="all" selected>All Wordlists</option>
        </select>

        <label>Custom Words (one per line)</label>
        <textarea id="customWords" placeholder="Add custom words here (optional)..." style="min-height:80px;"></textarea>

        <label>Upload Custom Wordlist</label>
        <input type="file" id="wordlistFile" accept=".txt">

        <div class="button-group">
            <button class="btn btn-run" onclick="runHashCracker()">Crack Hash</button>
            <button class="btn btn-outline" onclick="clearCracker()">Clear</button>
        </div>

        <div id="crackProgress" style="display:none; margin-top:12px;">
            <div style="color:var(--muted); font-size:13px;" id="crackProgressText">Loading...</div>
            <div style="background:var(--border); border-radius:10px; height:6px; margin-top:8px;">
                <div id="crackProgressBar"
                    style="background:var(--primary); height:6px; border-radius:10px;
                           width:0%; transition:width 0.3s;">
                </div>
            </div>
        </div>

        ${createOutput('crackOutput', 'Result')}
    </div>`;
    autoSaveInput('crackInput', 'hashCracker');
    autoSaveInput('customWords', 'hashCracker');

    const input = document.getElementById('crackInput');
    if(input){
        input.addEventListener('input', updateCrackHashInfo);
        updateCrackHashInfo();
    }

    const typeSelect = document.getElementById('crackType');
    if(typeSelect) typeSelect.addEventListener('change', updateCrackHashInfo);
}

async function loadWordlist(path){
    const fallback = WORDLIST_FALLBACKS[path] || [];
    try{
        const r = await fetch(path);
        if(!r.ok) return fallback;
        const t = await r.text();
        const words = collectWordsFromText(t);
        return words.length ? words : fallback;
    } catch(e){
        return fallback;
    }
}

const WORDLIST_FALLBACKS = {
    'assets/wordlists/common-passwords.txt': [
        'password', '123456', '123456789', 'qwerty', 'abc123', 'letmein',
        'admin', 'welcome', 'monkey', 'dragon', 'iloveyou', 'password1',
        '123123', '111111', 'secret', 'passw0rd', 'root', 'toor', 'guest', 'test',
    ],
    'assets/wordlists/rockyou-mini.txt': [
        '123456', '12345', '123456789', 'password', 'iloveyou', 'princess',
        '1234567', 'rockyou', '12345678', 'abc123', 'nicole', 'daniel',
        'babygirl', 'monkey', 'lovely', 'jessica', '654321', 'michael',
        'ashley', 'qwerty',
    ],
    'assets/wordlists/ctf-common.txt': [
        'flag', 'ctf', 'capture', 'security', 'hacker', 'crypto', 'reverse',
        'forensics', 'admin', 'root', 'password', 'secret', 'key', 'challenge',
        'blackbox', 'picoctf', 'hackthebox', 'tryhackme', 'cyber', 'shell',
    ],
};

const HASH_CRACK_ALGORITHMS = [
    { type: 'MD5',      length: 32,  hash: word => CryptoJS.MD5(word).toString() },
    { type: 'SHA1',     length: 40,  hash: word => CryptoJS.SHA1(word).toString() },
    { type: 'RIPEMD160', length: 40, hash: word => CryptoJS.RIPEMD160(word).toString() },
    { type: 'SHA224',   length: 56,  hash: word => CryptoJS.SHA224(word).toString() },
    { type: 'SHA256',   length: 64,  hash: word => CryptoJS.SHA256(word).toString() },
    { type: 'SHA3-256', length: 64,  hash: word => CryptoJS.SHA3(word, { outputLength: 256 }).toString() },
    { type: 'SHA384',   length: 96,  hash: word => CryptoJS.SHA384(word).toString() },
    { type: 'SHA512',   length: 128, hash: word => CryptoJS.SHA512(word).toString() },
    { type: 'SHA3-512', length: 128, hash: word => CryptoJS.SHA3(word, { outputLength: 512 }).toString() },
];

function normalizeCrackHash(value){
    return String(value || '')
        .trim()
        .replace(/^0x/i, '')
        .replace(/\s+/g, '')
        .toLowerCase();
}

function getCrackCandidates(hash){
    if(!/^[a-f0-9]+$/i.test(hash)) return [];
    const selectedType = document.getElementById('crackType')?.value || 'auto';
    if(selectedType !== 'auto'){
        const selected = HASH_CRACK_ALGORITHMS.find(algorithm => algorithm.type === selectedType);
        return selected && selected.length === hash.length ? [selected] : [];
    }
    return HASH_CRACK_ALGORITHMS.filter(algorithm => algorithm.length === hash.length);
}

function updateCrackHashInfo(){
    const box = document.getElementById('crackHashInfo');
    const input = document.getElementById('crackInput');
    if(!box || !input) return;

    const hash = normalizeCrackHash(input.value);
    if(!hash){
        box.style.display = 'none';
        return;
    }

    const candidates = getCrackCandidates(hash);
    const selectedType = document.getElementById('crackType')?.value || 'auto';
    box.style.display = 'block';
    if(!/^[a-f0-9]+$/i.test(hash)){
        box.innerHTML = 'Only unsalted hexadecimal hashes are supported by this browser scanner.';
        return;
    }

    if(selectedType !== 'auto' && !candidates.length){
        const selected = HASH_CRACK_ALGORITHMS.find(algorithm => algorithm.type === selectedType);
        box.innerHTML = selected
            ? `${selectedType} hashes must be <strong>${selected.length}</strong> hex characters. Current length: <strong>${hash.length}</strong>.`
            : 'Unsupported hash type selected.';
        return;
    }

    box.innerHTML = candidates.length
        ? `Detected possible type${candidates.length > 1 ? 's' : ''}: <strong>${candidates.map(c => c.type).join(', ')}</strong>`
        : `Unsupported hash length: <strong>${hash.length}</strong> hex characters.`;
}

function collectWordsFromText(text){
    return String(text || '')
        .split(/\r?\n/)
        .map(word => word.trim())
        .filter(Boolean);
}

async function runHashCracker(){
    const hash = normalizeCrackHash(document.getElementById('crackInput').value);
    if(!hash){ showToast('Paste a hash first', 'error'); return; }
    if(typeof CryptoJS === 'undefined'){
        showToast('Crypto library is not loaded', 'error');
        return;
    }

    const candidates = getCrackCandidates(hash);
    if(!/^[a-f0-9]+$/i.test(hash)){
        setOutput('crackOutput', 'Unsupported hash format. Paste an unsalted hexadecimal hash.', false);
        showToast('Unsupported hash format', 'error');
        updateCrackHashInfo();
        return;
    }
    if(!candidates.length){
        const selectedType = document.getElementById('crackType')?.value || 'auto';
        const selected = HASH_CRACK_ALGORITHMS.find(algorithm => algorithm.type === selectedType);
        const message = selected
            ? `${selectedType} hashes must be ${selected.length} hex characters. Current length: ${hash.length}.`
            : `Unsupported hash length: ${hash.length} hex characters.`;
        setOutput('crackOutput', message, false);
        showToast('Unsupported hash settings', 'error');
        updateCrackHashInfo();
        return;
    }

    const progressWrap = document.getElementById('crackProgress');
    const progressText = document.getElementById('crackProgressText');
    const progressBar  = document.getElementById('crackProgressBar');
    progressWrap.style.display = 'block';
    progressText.textContent   = 'Loading wordlists...';
    progressBar.style.width    = '0%';

    let words = [];
    const selected = document.getElementById('wordlistSelect').value;

    if(selected === 'all' || selected === 'common')
        words.push(...await loadWordlist('assets/wordlists/common-passwords.txt'));
    if(selected === 'all' || selected === 'rockyou')
        words.push(...await loadWordlist('assets/wordlists/rockyou-mini.txt'));
    if(selected === 'all' || selected === 'ctf')
        words.push(...await loadWordlist('assets/wordlists/ctf-common.txt'));

    const customWords = collectWordsFromText(document.getElementById('customWords').value);
    words.push(...customWords);

    const fileInput = document.getElementById('wordlistFile');
    if(fileInput.files.length > 0){
        const text = await fileInput.files[0].text();
        words.push(...collectWordsFromText(text));
    }

    words = [...new Set(words)];
    if(!words.length){
        progressWrap.style.display = 'none';
        setOutput('crackOutput', `
            <div style="color:var(--danger); font-size:16px; font-weight:700; margin-bottom:12px;">
                NO WORDS LOADED
            </div>
            <div style="color:var(--muted-light); font-size:13px;">
                Add custom words, upload a text wordlist, or run the app through the local server so built-in wordlists can load.
            </div>
        `, true);
        showToast('No words to scan', 'error');
        return;
    }

    progressText.textContent = `Scanning ${words.length.toLocaleString()} words against ${candidates.map(c => c.type).join(', ')}...`;
    progressBar.style.width  = '10%';

    const startTime = performance.now();
    let found       = null;
    let foundType   = null;
    const total     = words.length;
    let checkedWords = 0;
    let attempts     = 0;
    const totalAttempts = total * candidates.length;

    // Process in chunks to keep UI responsive
    const chunkSize = 500;
    for(let i = 0; i < total; i += chunkSize){
        const chunk = words.slice(i, i + chunkSize);

        for(const word of chunk){
            for(const algorithm of candidates){
                attempts++;
                if(hash === algorithm.hash(word).toLowerCase()){
                    found     = word;
                    foundType = algorithm.type;
                    break;
                }
            }
            checkedWords++;
            if(found) break;
        }

        if(found) break;

        const pct = Math.min(95, Math.round((attempts / totalAttempts) * 95));
        progressBar.style.width = `${pct}%`;
        progressText.textContent =
            `Scanned ${checkedWords.toLocaleString()} / ${total.toLocaleString()} words ` +
            `(${attempts.toLocaleString()} hash attempt${attempts === 1 ? '' : 's'})...`;

        // Yield to UI
        await new Promise(r => setTimeout(r, 0));
    }

    progressBar.style.width  = '100%';
    const duration = ((performance.now() - startTime) / 1000).toFixed(2);

    setTimeout(() => { progressWrap.style.display = 'none'; }, 1000);

    if(found){
        const safeFound = escapeHtml(found);
        const safeFoundType = escapeHtml(foundType);
        setOutput('crackOutput', `
            <div style="color:var(--success); font-size:16px; font-weight:700; margin-bottom:12px;">
                CRACKED!
            </div>
            <div style="margin-bottom:8px;">
                <span style="color:var(--muted);">Plaintext: </span>
                <strong style="color:var(--text);">${safeFound}</strong>
            </div>
            <div style="margin-bottom:8px;">
                <span style="color:var(--muted);">Hash Type: </span>
                <strong style="color:var(--primary);">${safeFoundType}</strong>
            </div>
            <div style="margin-bottom:8px;">
                <span style="color:var(--muted);">Words Scanned: </span>${checkedWords.toLocaleString()} / ${total.toLocaleString()}
            </div>
            <div style="margin-bottom:8px;">
                <span style="color:var(--muted);">Hash Attempts: </span>${attempts.toLocaleString()}
            </div>
            <div>
                <span style="color:var(--muted);">Time: </span>${duration}s
            </div>
        `, true);
        showToast('Hash cracked!');
    } else {
        setOutput('crackOutput', `
            <div style="color:var(--danger); font-size:16px; font-weight:700; margin-bottom:12px;">
                NOT FOUND
            </div>
            <div style="margin-bottom:8px;">
                <span style="color:var(--muted);">Words Scanned: </span>${checkedWords.toLocaleString()} / ${total.toLocaleString()}
            </div>
            <div style="margin-bottom:8px;">
                <span style="color:var(--muted);">Hash Attempts: </span>${attempts.toLocaleString()}
            </div>
            <div style="margin-bottom:8px;">
                <span style="color:var(--muted);">Types Scanned: </span>${candidates.map(c => c.type).join(', ')}
            </div>
            <div>
                <span style="color:var(--muted);">Time: </span>${duration}s
            </div>
            <div style="margin-top:12px; color:var(--muted); font-size:13px;">
                Try adding custom words or uploading a larger wordlist.
            </div>
        `, true);
    }
}

function clearCracker(){
    document.getElementById('crackInput').value   = '';
    document.getElementById('customWords').value  = '';
    document.getElementById('wordlistFile').value = '';
    updateCrackHashInfo();
    const out = document.getElementById('crackOutput');
    if(out) out.innerHTML = '<span style="color:var(--muted)">Result will appear here...</span>';
}

// =========================
// HASH IDENTIFIER
// =========================

function buildHashIdentifier(panel){
    panel.innerHTML = `
    ${toolHeader('', 'Hash Identifier', 'Automatically identify the type of a hash')}

    <div class="tool-wrap">
        <div class="tool-title">Hash Identifier</div>
        <label>Hash or Encoded String</label>
        <input type="text" id="identInput" placeholder="Paste hash or encoded string...">
        <div class="button-group">
            <button class="btn btn-run" onclick="runHashIdentifier()">Identify</button>
            <button class="btn btn-outline" onclick="clearIdentifier()">Clear</button>
        </div>
        ${createOutput('identOutput', 'Identification Results')}
    </div>`;
    autoSaveInput('identInput', 'hashIdentifier');
}

function runHashIdentifier(){
    const input = document.getElementById('identInput').value.trim();
    if(!input){ showToast('Paste something to identify', 'error'); return; }

    const results = [];

    const hexOnly    = /^[0-9a-fA-F]+$/.test(input);
    const base64Only = /^[A-Za-z0-9+/]+=*$/.test(input) && input.length % 4 === 0;
    const b64url     = /^[A-Za-z0-9\-_]+=*$/.test(input);
    const binaryOnly = /^[01\s]+$/.test(input);
    const urlEnc     = input.includes('%') && /%[0-9A-Fa-f]{2}/.test(input);

    // Hash identification by length
    const hashMap = {
        32:  [{ name: 'MD5',        confidence: 'High' },
              { name: 'NTLM',       confidence: 'Medium' }],
        40:  [{ name: 'SHA1',       confidence: 'High' },
              { name: 'RIPEMD-160', confidence: 'Medium' },
              { name: 'SHA1(HMAC)', confidence: 'Low' }],
        56:  [{ name: 'SHA224',     confidence: 'High' }],
        64:  [{ name: 'SHA256',     confidence: 'High' },
              { name: 'SHA3-256',   confidence: 'Medium' },
              { name: 'Keccak-256', confidence: 'Low' }],
        96:  [{ name: 'SHA384',     confidence: 'High' }],
        128: [{ name: 'SHA512',     confidence: 'High' },
              { name: 'SHA3-512',   confidence: 'Medium' },
              { name: 'Whirlpool',  confidence: 'Low' }],
    };

    if(hexOnly && hashMap[input.length]){
        hashMap[input.length].forEach(h => {
            results.push({ name: h.name, confidence: h.confidence, detail: `${input.length} hex chars` });
        });
    }

    // Special patterns
    if(/^\$2[aby]\$/.test(input))
        results.push({ name: 'bcrypt', confidence: 'High', detail: 'Starts with $2a$, $2b$ or $2y$' });

    if(/^\$1\$/.test(input))
        results.push({ name: 'MD5 Crypt (Linux)', confidence: 'High', detail: 'Starts with $1$' });

    if(/^\$6\$/.test(input))
        results.push({ name: 'SHA512 Crypt', confidence: 'High', detail: 'Starts with $6$' });

    if(/^\$5\$/.test(input))
        results.push({ name: 'SHA256 Crypt', confidence: 'High', detail: 'Starts with $5$' });

    if(/^[a-f0-9]{32}:[a-f0-9]{32}$/.test(input))
        results.push({ name: 'MD5 with Salt', confidence: 'High', detail: 'hash:salt format' });

    // Encoding identification
    if(base64Only && !hexOnly)
        results.push({ name: 'Base64', confidence: 'High', detail: `Length ${input.length}, valid Base64 chars` });

    if(b64url && !base64Only)
        results.push({ name: 'Base64 URL', confidence: 'High', detail: 'URL-safe Base64' });

    if(binaryOnly && input.replace(/\s/g,'').length % 8 === 0)
        results.push({ name: 'Binary', confidence: 'High', detail: `${input.replace(/\s/g,'').length / 8} bytes` });

    if(urlEnc)
        results.push({ name: 'URL Encoded', confidence: 'High', detail: 'Contains %XX sequences' });

    if(hexOnly && input.length % 2 === 0 && !hashMap[input.length])
        results.push({ name: 'Hex Encoded', confidence: 'Medium', detail: `${input.length / 2} bytes` });

    if(/^[A-Z2-7]+=*$/.test(input))
        results.push({ name: 'Base32', confidence: 'Medium', detail: 'Base32 alphabet' });

    // JWT
    if(input.split('.').length === 3)
        results.push({ name: 'JWT Token', confidence: 'High', detail: '3 Base64 parts separated by dots' });

    if(!results.length)
        results.push({ name: 'Unknown', confidence: 'None', detail: 'Could not identify format' });

    const confidenceColor = {
        'High':   'var(--success)',
        'Medium': 'var(--warning)',
        'Low':    'var(--muted)',
        'None':   'var(--danger)',
    };

    const html = results.map(r => `
        <div style="padding:10px; margin-bottom:8px; background:var(--panel-light);
                    border-radius:var(--radius-sm); border-left:3px solid ${confidenceColor[r.confidence]};">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <strong style="color:var(--text);">${r.name}</strong>
                <span style="font-size:11px; color:${confidenceColor[r.confidence]};
                             background:rgba(0,0,0,0.2); padding:2px 8px; border-radius:10px;">
                    ${r.confidence} Confidence
                </span>
            </div>
            <div style="color:var(--muted); font-size:12px; margin-top:4px;">${r.detail}</div>
        </div>
    `).join('');

    setOutput('identOutput', `
        <div style="margin-bottom:12px; color:var(--muted); font-size:12px;">
            Input length: ${input.length} chars
        </div>
        ${html}
    `, true);
}

function clearIdentifier(){
    document.getElementById('identInput').value = '';
    const out = document.getElementById('identOutput');
    if(out) out.innerHTML = '<span style="color:var(--muted)">Result will appear here...</span>';
}

// =========================
// ENCODER
// =========================

function buildEncoder(panel){
    panel.innerHTML = `
    ${toolHeader('', 'Encoder', 'Encode text in Base64, Base32, Hex, Binary, URL and more')}

    <div class="tool-wrap">
        <div class="tool-title">Encoder</div>
        <label>Input Text</label>
        <textarea id="encInput" placeholder="Enter text to encode..."></textarea>
        <div class="button-group">
            <button class="btn btn-run" onclick="runEncode('base64')">Base64</button>
            <button class="btn btn-run" onclick="runEncode('base32')">Base32</button>
            <button class="btn btn-run" onclick="runEncode('hex')">Hex</button>
            <button class="btn btn-run" onclick="runEncode('binary')">Binary</button>
            <button class="btn btn-run" onclick="runEncode('url')">URL</button>
            <button class="btn btn-run" onclick="runEncode('html')">HTML</button>
            <button class="btn btn-run" onclick="runEncode('octal')">Octal</button>
            <button class="btn btn-run" onclick="runEncode('morse')">Morse</button>
            <button class="btn btn-outline" onclick="clearEncoder()">Clear</button>
        </div>
        ${createOutput('encOutput', 'Encoded Output')}
    </div>`;
    autoSaveInput('encInput', 'encoder');
}

function runEncode(type){
    const text = document.getElementById('encInput').value;
    if(!text){ showToast('Enter text to encode', 'error'); return; }
    let result = '';

    switch(type){
        case 'base64':
            result = btoa(unescape(encodeURIComponent(text)));
            break;

        case 'base32':
            result = encodeBase32(text);
            break;

        case 'hex':
            result = Array.from(text)
                .map(c => c.charCodeAt(0).toString(16).padStart(2,'0'))
                .join(' ');
            break;

        case 'binary':
            result = Array.from(text)
                .map(c => c.charCodeAt(0).toString(2).padStart(8,'0'))
                .join(' ');
            break;

        case 'url':
            result = encodeURIComponent(text);
            break;

        case 'html':
            result = text
                .replace(/&/g,'&amp;')
                .replace(/</g,'&lt;')
                .replace(/>/g,'&gt;')
                .replace(/"/g,'&quot;')
                .replace(/'/g,'&#39;');
            break;

        case 'octal':
            result = Array.from(text)
                .map(c => c.charCodeAt(0).toString(8).padStart(3,'0'))
                .join(' ');
            break;

        case 'morse':
            result = textToMorse(text);
            break;
    }

    setOutput('encOutput', result);
}

function clearEncoder(){
    document.getElementById('encInput').value = '';
    const out = document.getElementById('encOutput');
    if(out) out.innerHTML = '<span style="color:var(--muted)">Result will appear here...</span>';
}

// Base32 encode
function encodeBase32(str){
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = '';
    for(let i = 0; i < str.length; i++)
        bits += str.charCodeAt(i).toString(2).padStart(8,'0');
    while(bits.length % 5 !== 0) bits += '0';
    let result = '';
    for(let i = 0; i < bits.length; i += 5)
        result += alphabet[parseInt(bits.slice(i, i+5), 2)];
    while(result.length % 8 !== 0) result += '=';
    return result;
}

// =========================
// DECODER
// =========================

function buildDecoder(panel){
    panel.innerHTML = `
    ${toolHeader('', 'Decoder', 'Decode Base64, Base32, Hex, Binary, URL and more')}

    <div class="tool-wrap">
        <div class="tool-title">Decoder</div>
        <label>Encoded Input</label>
        <textarea id="decInput" placeholder="Paste encoded string here..."></textarea>
        <div class="button-group">
            <button class="btn btn-run" onclick="runDecode('auto')">Auto Detect</button>
            <button class="btn btn-run" onclick="runDecode('base64')">Base64</button>
            <button class="btn btn-run" onclick="runDecode('base32')">Base32</button>
            <button class="btn btn-run" onclick="runDecode('hex')">Hex</button>
            <button class="btn btn-run" onclick="runDecode('binary')">Binary</button>
            <button class="btn btn-run" onclick="runDecode('url')">URL</button>
            <button class="btn btn-run" onclick="runDecode('html')">HTML</button>
            <button class="btn btn-run" onclick="runDecode('octal')">Octal</button>
            <button class="btn btn-run" onclick="runDecode('morse')">Morse</button>
            <button class="btn btn-outline" onclick="clearDecoder()">Clear</button>
        </div>
        ${createOutput('decOutput', 'Decoded Output')}
    </div>`;
    autoSaveInput('decInput', 'decoder');
}

function runDecode(type){
    const text = document.getElementById('decInput').value.trim();
    if(!text){ showToast('Paste encoded text first', 'error'); return; }
    let result = '';

    try{
        if(type === 'auto'){
            const guesses = getDecodeGuesses(text);
            if(!guesses.length){
                setOutput('decOutput', 'No confident decoder match found. Try selecting a format manually.');
                showToast('No decoder match found', 'warning');
                return;
            }

            const best = guesses[0];
            const html = `
                <div style="margin-bottom:12px;">
                    <span style="color:var(--muted);">Best match: </span>
                    <strong style="color:var(--primary);">${escapeHtml(best.name)}</strong>
                    <span style="color:var(--muted); margin-left:10px;">${escapeHtml(best.reason)}</span>
                </div>
                <div style="font-family:var(--font-mono); word-break:break-word; margin-bottom:16px;">
                    ${escapeHtml(best.result)}
                </div>
                ${guesses.length > 1 ? `
                    <div style="color:var(--muted); font-size:12px; margin-bottom:8px;">Other possible decodes:</div>
                    ${guesses.slice(1, 6).map(guess => `
                        <div style="padding:8px; margin-bottom:6px; background:var(--panel-light); border-radius:var(--radius-sm);">
                            <div style="color:var(--primary); font-size:12px; margin-bottom:4px;">
                                ${escapeHtml(guess.name)} <span style="color:var(--muted);">- ${escapeHtml(guess.reason)}</span>
                            </div>
                            <div style="font-family:var(--font-mono); word-break:break-word;">${escapeHtml(guess.result)}</div>
                        </div>
                    `).join('')}
                ` : ''}`;
            setOutput('decOutput', html, true);
            return;
        }

        switch(type){
            case 'base64':
                result = decodeBase64Text(text);
                break;

            case 'base32':
                result = decodeBase32(text);
                break;

            case 'hex':
                result = bytesToText(parseHexBytes(text));
                break;

            case 'binary':
                result = bytesToText(parseBinaryBytes(text));
                break;

            case 'url':
                result = decodeURIComponent(text);
                break;

            case 'html':
                const d = document.createElement('div');
                d.innerHTML = text;
                result = d.textContent;
                break;

            case 'octal':
                result = bytesToText(parseOctalBytes(text));
                break;

            case 'morse':
                result = morseToText(text);
                break;
        }
        setOutput('decOutput', result);
    } catch(e){
        setOutput('decOutput', `Error: Invalid ${type} input - ${e.message}`);
        showToast('Decoding failed', 'error');
    }
}

function clearDecoder(){
    document.getElementById('decInput').value = '';
    const out = document.getElementById('decOutput');
    if(out) out.innerHTML = '<span style="color:var(--muted)">Result will appear here...</span>';
}

function decodeBase64Text(input){
    const compact = input.replace(/\s+/g, '');
    const padded = compact.padEnd(Math.ceil(compact.length / 4) * 4, '=');
    const binary = atob(padded);
    try{
        return decodeURIComponent(escape(binary));
    } catch(e){
        return binary;
    }
}

function bytesToText(bytes){
    return bytes.map(byte => String.fromCharCode(byte)).join('');
}

function normalizeHexInput(input){
    return String(input || '')
        .replace(/\\x/gi, '')
        .replace(/0x/gi, '')
        .replace(/[^0-9a-f]/gi, '');
}

function parseHexBytes(input){
    const hex = normalizeHexInput(input);
    if(!hex || hex.length % 2 !== 0 || /[^0-9a-f]/i.test(hex)){
        throw new Error('Hex input must contain complete byte pairs');
    }
    return hex.match(/.{2}/g).map(byte => parseInt(byte, 16));
}

function parseBinaryBytes(input){
    const compact = String(input || '').replace(/\s+/g, '');
    const groups = /\s/.test(input)
        ? String(input).trim().split(/\s+/)
        : compact.match(/.{8}/g);
    if(!groups || compact.length % 8 !== 0 || groups.some(group => !/^[01]{8}$/.test(group))){
        throw new Error('Binary input must use 8-bit bytes');
    }
    return groups.map(group => parseInt(group, 2));
}

function parseOctalBytes(input){
    const raw = String(input || '').trim();
    const compact = raw.replace(/\s+/g, '');
    const groups = /\s/.test(raw) ? raw.split(/\s+/) : compact.match(/.{3}/g);
    if(!groups || compact.length % 3 !== 0 || groups.some(group => !/^[0-7]{3}$/.test(group))){
        throw new Error('Octal input must use 3-digit bytes');
    }
    return groups.map(group => parseInt(group, 8));
}

function printableRatio(value){
    if(!value) return 0;
    const printable = Array.from(value).filter(char => {
        const code = char.charCodeAt(0);
        return code === 9 || code === 10 || code === 13 || (code >= 32 && code <= 126);
    }).length;
    return printable / value.length;
}

function englishTextScore(value){
    const text = String(value || '');
    if(!text) return 0;
    const printable = printableRatio(text);
    const letters = (text.match(/[A-Za-z]/g) || []).length / text.length;
    const spaces = (text.match(/\s/g) || []).length / text.length;
    const common = (text.match(/\b(the|and|you|that|have|for|flag|hello|secret|attack)\b/gi) || []).length;
    const bad = (text.match(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g) || []).length / text.length;
    return printable * 60 + letters * 20 + Math.min(spaces, 0.25) * 30 + common * 10 - bad * 80;
}

function addDecodeGuess(guesses, name, reason, score, decoder){
    try{
        const result = decoder();
        if(!result || printableRatio(result) < 0.65) return;
        guesses.push({ name, reason, score: score + englishTextScore(result), result });
    } catch(e){}
}

function getDecodeGuesses(input){
    const text = String(input || '').trim();
    const guesses = [];
    const compact = text.replace(/\s+/g, '');

    if(/^[A-Za-z0-9+/]+={0,2}$/.test(compact) && compact.length >= 4 && compact.length % 4 !== 1){
        addDecodeGuess(guesses, 'Base64', 'valid Base64 alphabet', 35, () => decodeBase64Text(text));
    }
    if(/^[A-Z2-7]+=*$/i.test(compact) && compact.length >= 8){
        addDecodeGuess(guesses, 'Base32', 'valid Base32 alphabet', 25, () => decodeBase32(text));
    }
    if(/^(?:0x)?(?:[0-9a-f]{2}[\s:-]*)+$/i.test(text) || /^(?:\\x[0-9a-f]{2})+$/i.test(text)){
        addDecodeGuess(guesses, 'Hex', 'complete hex byte pairs', 45, () => bytesToText(parseHexBytes(text)));
    }
    if(/^[01\s]+$/.test(text) && compact.length >= 8 && compact.length % 8 === 0){
        addDecodeGuess(guesses, 'Binary', '8-bit binary bytes', 50, () => bytesToText(parseBinaryBytes(text)));
    }
    if(/%[0-9a-f]{2}/i.test(text)){
        addDecodeGuess(guesses, 'URL', 'contains %XX escapes', 55, () => decodeURIComponent(text));
    }
    if(/&(?:[a-z]+|#\d+|#x[0-9a-f]+);/i.test(text)){
        addDecodeGuess(guesses, 'HTML', 'contains HTML entities', 55, () => {
            const d = document.createElement('div');
            d.innerHTML = text;
            return d.textContent;
        });
    }
    if(/^[0-7\s]+$/.test(text) && compact.length >= 3 && compact.length % 3 === 0){
        addDecodeGuess(guesses, 'Octal', '3-digit octal bytes', 25, () => bytesToText(parseOctalBytes(text)));
    }
    if(/^[.\-/\s]+$/.test(text) && /[.-]/.test(text)){
        addDecodeGuess(guesses, 'Morse', 'dot/dash Morse symbols', 40, () => morseToText(text));
    }

    return guesses
        .filter((guess, index, all) => all.findIndex(item => item.name === guess.name && item.result === guess.result) === index)
        .sort((a, b) => b.score - a.score);
}

// Base32 decode
function decodeBase32(str){
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    str = str.toUpperCase().replace(/=+$/,'');
    let bits = '';
    for(const c of str){
        const idx = alphabet.indexOf(c);
        if(idx < 0) continue;
        bits += idx.toString(2).padStart(5,'0');
    }
    let result = '';
    for(let i = 0; i + 8 <= bits.length; i += 8)
        result += String.fromCharCode(parseInt(bits.slice(i,i+8),2));
    return result;
}

// =========================
// CAESAR / ROT CIPHER
// =========================

function buildCaesarCipher(panel){
    panel.innerHTML = `
    ${toolHeader('', 'Caesar / ROT Cipher', 'Caesar cipher, ROT13, ROT47 with brute force')}

    <div class="tool-wrap">
        <div class="tool-title">Caesar / ROT Cipher</div>

        <div class="tabs">
            <button class="tab-btn active" onclick="switchTab(this,'caesarManual')">Manual</button>
            <button class="tab-btn"        onclick="switchTab(this,'caesarBrute')">Brute Force</button>
            <button class="tab-btn"        onclick="switchTab(this,'rot13tab')">ROT13</button>
            <button class="tab-btn"        onclick="switchTab(this,'rot47tab')">ROT47</button>
        </div>

        <div class="tab-content active" id="caesarManual">
            <label>Input Text</label>
            <textarea id="caesarInput" placeholder="Enter text..."></textarea>
            <label>Shift (1-25)</label>
            <input type="number" id="caesarShift" value="13" min="1" max="25">
            <div class="button-group">
                <button class="btn btn-run" onclick="runCaesar('enc')">Encrypt</button>
                <button class="btn btn-run" onclick="runCaesar('dec')">Decrypt</button>
                <button class="btn btn-outline" onclick="clearCaesar()">Clear</button>
            </div>
            ${createOutput('caesarOutput', 'Caesar Output')}
        </div>

        <div class="tab-content" id="caesarBrute">
            <label>Ciphertext to Brute Force</label>
            <textarea id="caesarBruteInput" placeholder="Enter ciphertext..."></textarea>
            <div class="button-group">
                <button class="btn btn-run" onclick="runCaesarBrute()">Brute Force All Shifts</button>
            </div>
            ${createOutput('caesarBruteOutput', 'All 25 Shifts')}
        </div>

        <div class="tab-content" id="rot13tab">
            <label>Input Text</label>
            <textarea id="rot13Input" placeholder="Enter text..."></textarea>
            <div class="button-group">
                <button class="btn btn-run" onclick="runROT13()">ROT13</button>
                <button class="btn btn-outline" onclick="clearROT13()">Clear</button>
            </div>
            ${createOutput('rot13Output', 'ROT13 Output')}
        </div>

        <div class="tab-content" id="rot47tab">
            <label>Input Text</label>
            <textarea id="rot47Input" placeholder="Enter text..."></textarea>
            <div class="button-group">
                <button class="btn btn-run" onclick="runROT47()">ROT47</button>
                <button class="btn btn-outline" onclick="clearROT47()">Clear</button>
            </div>
            ${createOutput('rot47Output', 'ROT47 Output')}
        </div>
    </div>`;

    autoSaveInput('caesarInput', 'caesarCipher');
}

function runCaesar(mode){
    const text  = document.getElementById('caesarInput').value;
    const shift = parseInt(document.getElementById('caesarShift').value) || 13;
    if(!text){ showToast('Enter text first', 'error'); return; }
    const s = mode === 'enc' ? shift : 26 - shift;
    setOutput('caesarOutput', caesarShift(text, s));
}

function caesarShift(text, shift){
    return text.split('').map(c => {
        if(c >= 'A' && c <= 'Z')
            return String.fromCharCode(((c.charCodeAt(0) - 65 + shift) % 26) + 65);
        if(c >= 'a' && c <= 'z')
            return String.fromCharCode(((c.charCodeAt(0) - 97 + shift) % 26) + 97);
        return c;
    }).join('');
}

function runCaesarBrute(){
    const text = document.getElementById('caesarBruteInput').value;
    if(!text){ showToast('Enter text first', 'error'); return; }

    const html = Array.from({length:25}, (_,i) => {
        const shift = i + 1;
        const result = caesarShift(text, shift);
        return `
        <div style="padding:8px; margin-bottom:6px; background:var(--panel-light);
                    border-radius:var(--radius-sm); display:flex; gap:12px; align-items:flex-start;">
            <span style="color:var(--primary); min-width:60px; font-size:12px;">
                Shift ${shift}
            </span>
            <span style="word-break:break-word; font-family:var(--font-mono); font-size:13px;">
                ${result}
            </span>
            <button class="output-action-btn" style="flex-shrink:0;"
                onclick="copyText('${result.replace(/'/g,"\\'")}', this)">Copy</button>
        </div>`;
    }).join('');

    setOutput('caesarBruteOutput', html, true);
}

function clearCaesar(){
    document.getElementById('caesarInput').value = '';
    const out = document.getElementById('caesarOutput');
    if(out) out.innerHTML = '<span style="color:var(--muted)">Result will appear here...</span>';
}

function runROT13(){
    const text = document.getElementById('rot13Input').value;
    if(!text){ showToast('Enter text first', 'error'); return; }
    setOutput('rot13Output', caesarShift(text, 13));
}

function clearROT13(){
    document.getElementById('rot13Input').value = '';
    const out = document.getElementById('rot13Output');
    if(out) out.innerHTML = '<span style="color:var(--muted)">Result will appear here...</span>';
}

function runROT47(){
    const text = document.getElementById('rot47Input').value;
    if(!text){ showToast('Enter text first', 'error'); return; }
    const result = text.split('').map(c => {
        const code = c.charCodeAt(0);
        if(code >= 33 && code <= 126)
            return String.fromCharCode(((code - 33 + 47) % 94) + 33);
        return c;
    }).join('');
    setOutput('rot47Output', result);
}

function clearROT47(){
    document.getElementById('rot47Input').value = '';
    const out = document.getElementById('rot47Output');
    if(out) out.innerHTML = '<span style="color:var(--muted)">Result will appear here...</span>';
}

// =========================
// VIGENERE CIPHER
// =========================

function buildVigenereCipher(panel){
    panel.innerHTML = `
    ${toolHeader('', 'Vigenere Cipher', 'Encrypt, decrypt and crack Vigenere cipher')}

    <div class="tool-wrap">
        <div class="tool-title">Vigenere Cipher</div>

        <div class="tabs">
            <button class="tab-btn active" onclick="switchTab(this,'vigEncDec')">Encrypt / Decrypt</button>
            <button class="tab-btn"        onclick="switchTab(this,'vigCrack')">Auto Crack</button>
        </div>

        <div class="tab-content active" id="vigEncDec">
            <label>Text</label>
            <textarea id="vigInput" placeholder="Enter text..."></textarea>
            <label>Key</label>
            <input type="text" id="vigKey" placeholder="Enter key (letters only)...">
            <div class="button-group">
                <button class="btn btn-run" onclick="runVigenere('enc')">Encrypt</button>
                <button class="btn btn-run" onclick="runVigenere('dec')">Decrypt</button>
                <button class="btn btn-outline" onclick="clearVigenere()">Clear</button>
            </div>
            ${createOutput('vigOutput', 'Vigenere Output')}
        </div>

        <div class="tab-content" id="vigCrack">
            <div class="info-box">
                Enter a known key to decode immediately, or leave it blank to let frequency analysis guess the key.
                Auto cracking works best on longer ciphertexts (100+ chars).
            </div>
            <label>Ciphertext</label>
            <textarea id="vigCrackInput" placeholder="Paste Vigenere ciphertext..."></textarea>
            <label>Known Key (optional)</label>
            <input type="text" id="vigCrackKey" placeholder="Enter key if you already know it...">
            <label>Max Key Length to Try</label>
            <input type="number" id="vigMaxKey" value="12" min="2" max="20">
            <div class="button-group">
                <button class="btn btn-run" onclick="runVigenereCrack(true)">Decode With Key</button>
                <button class="btn btn-run" onclick="runVigenereCrack()">Auto Crack</button>
            </div>
            ${createOutput('vigCrackOutput', 'Crack Results')}
        </div>
    </div>`;

    autoSaveInput('vigInput', 'vigenereCipher');
}

function runVigenere(mode){
    const text = document.getElementById('vigInput').value;
    const key  = document.getElementById('vigKey').value.toUpperCase().replace(/[^A-Z]/g,'');
    if(!text){ showToast('Enter text first', 'error'); return; }
    if(!key){  showToast('Enter a key', 'error'); return; }
    setOutput('vigOutput', vigenereTransform(text, key, mode));
}

function vigenereTransform(text, key, mode){
    let result = '';
    let ki = 0;
    for(const c of text){
        if(c >= 'A' && c <= 'Z'){
            const shift = key.charCodeAt(ki % key.length) - 65;
            result += mode === 'enc'
                ? String.fromCharCode(((c.charCodeAt(0) - 65 + shift) % 26) + 65)
                : String.fromCharCode(((c.charCodeAt(0) - 65 - shift + 26) % 26) + 65);
            ki++;
        } else if(c >= 'a' && c <= 'z'){
            const shift = key.charCodeAt(ki % key.length) - 65;
            result += mode === 'enc'
                ? String.fromCharCode(((c.charCodeAt(0) - 97 + shift) % 26) + 97)
                : String.fromCharCode(((c.charCodeAt(0) - 97 - shift + 26) % 26) + 97);
            ki++;
        } else {
            result += c;
        }
    }
    return result;
}

function clearVigenere(){
    document.getElementById('vigInput').value = '';
    document.getElementById('vigKey').value  = '';
    const out = document.getElementById('vigOutput');
    if(out) out.innerHTML = '<span style="color:var(--muted)">Result will appear here...</span>';
}

function runVigenereCrack(useKnownKeyOnly = false){
    const rawCipher = document.getElementById('vigCrackInput').value;
    const cipher  = rawCipher.toUpperCase().replace(/[^A-Z]/g,'');
    const knownKey = document.getElementById('vigCrackKey')?.value.toUpperCase().replace(/[^A-Z]/g,'') || '';
    const maxKey  = parseInt(document.getElementById('vigMaxKey').value) || 12;
    if(!cipher){ showToast('Enter ciphertext', 'error'); return; }

    if(knownKey){
        const plain = vigenereTransform(rawCipher, knownKey, 'dec');
        setOutput('vigCrackOutput', `
            <div style="margin-bottom:12px;">
                <span style="color:var(--muted);">Used Key: </span>
                <strong style="color:var(--success);">${escapeHtml(knownKey)}</strong>
            </div>
            <div style="color:var(--muted); font-size:12px; margin-bottom:8px;">Decrypted Text:</div>
            <div style="font-family:var(--font-mono); word-break:break-word;">${escapeHtml(plain)}</div>
        `, true);
        return;
    }

    if(useKnownKeyOnly){ showToast('Enter a key first', 'error'); return; }
    if(cipher.length < 20){ showToast('Need more ciphertext (20+ chars)', 'error'); return; }

    // Step 1: Find best key length using IoC
    function ioc(text){
        const freq = new Array(26).fill(0);
        for(const c of text) freq[c.charCodeAt(0)-65]++;
        const n = text.length;
        let sum = 0;
        for(const f of freq) sum += f * (f - 1);
        return sum / (n * (n - 1));
    }

    let bestLen = 1;
    let bestIoC = 0;
    for(let kl = 2; kl <= maxKey; kl++){
        let avgIoC = 0;
        for(let col = 0; col < kl; col++){
            const column = cipher.split('').filter((_,i) => i % kl === col).join('');
            if(column.length > 1) avgIoC += ioc(column);
        }
        avgIoC /= kl;
        if(avgIoC > bestIoC){ bestIoC = avgIoC; bestLen = kl; }
    }

    // Step 2: Recover key using frequency analysis
    const ENGLISH_FREQ = [0.082,0.015,0.028,0.043,0.127,0.022,0.020,0.061,0.070,
                          0.002,0.008,0.040,0.024,0.067,0.075,0.019,0.001,0.060,
                          0.063,0.091,0.028,0.010,0.023,0.001,0.020,0.001];

    let key = '';
    for(let col = 0; col < bestLen; col++){
        const column = cipher.split('').filter((_,i) => i % bestLen === col).join('');
        const freq   = new Array(26).fill(0);
        for(const c of column) freq[c.charCodeAt(0)-65]++;
        const total  = column.length;

        let bestShift = 0, bestScore = -Infinity;
        for(let shift = 0; shift < 26; shift++){
            let score = 0;
            for(let i = 0; i < 26; i++)
                score += (freq[i] / total) * ENGLISH_FREQ[(i - shift + 26) % 26];
            if(score > bestScore){ bestScore = score; bestShift = shift; }
        }
        key += String.fromCharCode(bestShift + 65);
    }

    // Step 3: Decrypt with found key
    let plain = '';
    let ki = 0;
    for(const c of cipher){
        const shift = key.charCodeAt(ki % key.length) - 65;
        plain += String.fromCharCode(((c.charCodeAt(0) - 65 - shift + 26) % 26) + 65);
        ki++;
    }

    setOutput('vigCrackOutput', `
        <div style="margin-bottom:12px;">
            <span style="color:var(--muted);">Detected Key Length: </span>
            <strong style="color:var(--primary);">${bestLen}</strong>
            <span style="color:var(--muted); margin-left:16px;">Recovered Key: </span>
            <strong style="color:var(--success);">${key}</strong>
        </div>
        <div style="color:var(--muted); font-size:12px; margin-bottom:8px;">Decrypted Text:</div>
        <div style="font-family:var(--font-mono); word-break:break-word;">${escapeHtml(plain)}</div>
    `, true);
}

// =========================
// XOR TOOL
// =========================

function buildXorTool(panel){
    panel.innerHTML = `
    ${toolHeader('', 'XOR Tool', 'Single byte and multi-byte XOR operations')}

    <div class="tool-wrap">
        <div class="tool-title">XOR Tool</div>

        <div class="tabs">
            <button class="tab-btn active" onclick="switchTab(this,'xorSingle')">Single Byte XOR</button>
            <button class="tab-btn"        onclick="switchTab(this,'xorMulti')">Multi Byte XOR</button>
            <button class="tab-btn"        onclick="switchTab(this,'xorBrute')">Brute Force</button>
        </div>

        <div class="tab-content active" id="xorSingle">
            <label>Input (text or hex)</label>
            <textarea id="xorSingleInput" placeholder="Enter text or hex (e.g. 48656c6c6f, 0x48656c6c6f or \\x48\\x65)..."></textarea>
            <label>XOR Key (single byte, decimal 0-255 or hex 0x00-0xFF)</label>
            <input type="text" id="xorSingleKey" placeholder="e.g. 0x41 or 65">
            <div class="button-group">
                <button class="btn btn-run" onclick="runXorSingle()">XOR</button>
                <button class="btn btn-outline" onclick="clearXorSingle()">Clear</button>
            </div>
            ${createOutput('xorSingleOutput', 'XOR Result')}
        </div>

        <div class="tab-content" id="xorMulti">
            <label>Input (text or hex)</label>
            <textarea id="xorMultiInput" placeholder="Enter text or hex..."></textarea>
            <label>XOR Key (text or hex)</label>
            <input type="text" id="xorMultiKey" placeholder="e.g. secret or 0xDEADBEEF">
            <div class="button-group">
                <button class="btn btn-run" onclick="runXorMulti()">XOR</button>
                <button class="btn btn-outline" onclick="clearXorMulti()">Clear</button>
            </div>
            ${createOutput('xorMultiOutput', 'XOR Result')}
        </div>

        <div class="tab-content" id="xorBrute">
            <div class="info-box">
                Tries all 255 single-byte XOR keys and shows results that contain
                printable ASCII text - useful for CTF reversing challenges.
            </div>
            <label>Hex Input (space separated or continuous)</label>
            <textarea id="xorBruteInput" placeholder="e.g. 2b 3c 4d or 2b3c4d..."></textarea>
            <div class="button-group">
                <button class="btn btn-run" onclick="runXorBrute()">Brute Force XOR</button>
            </div>
            ${createOutput('xorBruteOutput', 'Brute Force Results')}
        </div>
    </div>`;

    autoSaveInput('xorSingleInput', 'xorTool');
}

function runXorSingle(){
    const rawInput = document.getElementById('xorSingleInput').value.trim();
    const rawKey   = document.getElementById('xorSingleKey').value.trim();
    if(!rawInput){ showToast('Enter input', 'error'); return; }
    if(!rawKey){   showToast('Enter key', 'error');   return; }

    const keyByte = rawKey.startsWith('0x') || rawKey.startsWith('0X')
        ? parseInt(rawKey, 16)
        : parseInt(rawKey);

    if(isNaN(keyByte) || keyByte < 0 || keyByte > 255){
        showToast('Key must be 0-255', 'error');
        return;
    }

    let bytes;
    try{
        bytes = parseXorInputBytes(rawInput);
    } catch(e){
        showToast(e.message, 'error');
        return;
    }

    const xored   = bytes.map(b => b ^ keyByte);
    const asText  = bytesToDisplayText(xored);
    const asHex   = bytesToHex(xored);

    setOutput('xorSingleOutput', `Text: ${asText}\nHex:  ${asHex}`);
}

function clearXorSingle(){
    document.getElementById('xorSingleInput').value = '';
    document.getElementById('xorSingleKey').value   = '';
    const out = document.getElementById('xorSingleOutput');
    if(out) out.innerHTML = '<span style="color:var(--muted)">Result will appear here...</span>';
}

function runXorMulti(){
    const text = document.getElementById('xorMultiInput').value;
    const key  = document.getElementById('xorMultiKey').value.trim();
    if(!text){ showToast('Enter input', 'error'); return; }
    if(!key){  showToast('Enter key',  'error'); return; }

    let inputBytes, keyBytes;
    try{
        inputBytes = parseXorInputBytes(text);
        keyBytes = parseXorInputBytes(key);
    } catch(e){
        showToast(e.message, 'error');
        return;
    }

    const resultBytes = inputBytes.map((byte, i) => byte ^ keyBytes[i % keyBytes.length]);

    setOutput('xorMultiOutput', `Text: ${bytesToDisplayText(resultBytes)}\nHex:  ${bytesToHex(resultBytes)}`);
}

function clearXorMulti(){
    document.getElementById('xorMultiInput').value = '';
    document.getElementById('xorMultiKey').value   = '';
    const out = document.getElementById('xorMultiOutput');
    if(out) out.innerHTML = '<span style="color:var(--muted)">Result will appear here...</span>';
}

function runXorBrute(){
    const hexInput = document.getElementById('xorBruteInput').value;
    if(!hexInput){ showToast('Enter hex input', 'error'); return; }

    let bytes;
    try{
        bytes = parseHexBytes(hexInput);
    } catch(e){
        showToast(e.message, 'error');
        return;
    }

    const results = [];
    for(let key = 0; key <= 255; key++){
        const decoded = bytes.map(b => b ^ key);
        const text    = decoded.map(b => String.fromCharCode(b)).join('');
        const printable = decoded.filter(b => b >= 32 && b < 127).length;
        const ratio   = printable / decoded.length;
        const score = englishTextScore(text);
        if(ratio > 0.85) results.push({ key, text, ratio, score });
    }

    if(!results.length){
        setOutput('xorBruteOutput', 'No printable results found. Try multi-byte XOR.');
        return;
    }

    results.sort((a,b) => b.score - a.score || b.ratio - a.ratio);

    const html = results.slice(0, 40).map(r => `
        <div style="padding:8px; margin-bottom:6px; background:var(--panel-light);
                    border-radius:var(--radius-sm); display:flex; gap:12px; align-items:flex-start;">
            <span style="color:var(--primary); min-width:80px; font-size:12px; flex-shrink:0;">
                Key: 0x${r.key.toString(16).padStart(2,'0')} (${r.key})
            </span>
            <span style="font-family:var(--font-mono); word-break:break-word; font-size:13px;">
                ${escapeHtml(r.text)}
            </span>
            <button class="output-action-btn" style="flex-shrink:0;"
                onclick="copyText('${r.text.replace(/'/g,"\\'")}', this)">Copy</button>
        </div>
    `).join('');

    setOutput('xorBruteOutput', html, true);
}

function looksLikeHexBytes(input){
    const raw = String(input || '').trim();
    if(/^0x[0-9a-f\s:-]+$/i.test(raw) || /^(?:\\x[0-9a-f]{2})+$/i.test(raw)) return true;
    if(/^[0-9a-f]{2}(?:[\s:-]+[0-9a-f]{2})+$/i.test(raw)) return true;
    const compact = raw.replace(/\s+/g, '');
    return compact.length >= 4 && compact.length % 2 === 0 && /^[0-9a-f]+$/i.test(compact) && /\d/.test(compact);
}

function parseXorInputBytes(input){
    const raw = String(input || '');
    if(!raw) throw new Error('Enter input');
    if(looksLikeHexBytes(raw)) return parseHexBytes(raw);
    return Array.from(raw).map(char => char.charCodeAt(0) & 0xff);
}

function bytesToDisplayText(bytes){
    return bytes.map(byte => byte >= 32 && byte < 127 ? String.fromCharCode(byte) : '.').join('');
}

function bytesToHex(bytes){
    return bytes.map(byte => byte.toString(16).padStart(2,'0')).join(' ');
}

// =========================
// ATBASH & RAIL FENCE
// =========================

function buildAtbashCipher(panel){
    panel.innerHTML = `
    ${toolHeader('', 'Atbash / Rail Fence', 'Atbash cipher and Rail Fence transposition cipher')}

    <div class="tool-wrap">
        <div class="tool-title">Atbash / Rail Fence</div>

        <div class="tabs">
            <button class="tab-btn active" onclick="switchTab(this,'atbashTab')">Atbash</button>
            <button class="tab-btn"        onclick="switchTab(this,'railFenceTab')">Rail Fence</button>
        </div>

        <div class="tab-content active" id="atbashTab">
            <div class="info-box">
                Atbash substitutes A to Z, B to Y, C to X etc. It is its own inverse - encrypt and decrypt are the same operation.
            </div>
            <label>Input Text</label>
            <textarea id="atbashInput" placeholder="Enter text..."></textarea>
            <div class="button-group">
                <button class="btn btn-run" onclick="runAtbash()">Atbash</button>
                <button class="btn btn-outline" onclick="clearAtbash()">Clear</button>
            </div>
            ${createOutput('atbashOutput', 'Atbash Output')}
        </div>

        <div class="tab-content" id="railFenceTab">
            <label>Input Text</label>
            <textarea id="rfInput" placeholder="Enter text..."></textarea>
            <label>Number of Rails</label>
            <input type="number" id="rfRails" value="3" min="2" max="10">
            <div class="button-group">
                <button class="btn btn-run" onclick="runRailFence('enc')">Encrypt</button>
                <button class="btn btn-run" onclick="runRailFence('dec')">Decrypt</button>
                <button class="btn btn-outline" onclick="clearRailFence()">Clear</button>
            </div>
            ${createOutput('rfOutput', 'Rail Fence Output')}
        </div>
    </div>`;
}

function runAtbash(){
    const text = document.getElementById('atbashInput').value;
    if(!text){ showToast('Enter text first', 'error'); return; }
    const result = text.split('').map(c => {
        if(c >= 'A' && c <= 'Z') return String.fromCharCode(90 - (c.charCodeAt(0) - 65));
        if(c >= 'a' && c <= 'z') return String.fromCharCode(122 - (c.charCodeAt(0) - 97));
        return c;
    }).join('');
    setOutput('atbashOutput', result);
}

function clearAtbash(){
    document.getElementById('atbashInput').value = '';
    const out = document.getElementById('atbashOutput');
    if(out) out.innerHTML = '<span style="color:var(--muted)">Result will appear here...</span>';
}

function runRailFence(mode){
    const text  = document.getElementById('rfInput').value;
    const rails = parseInt(document.getElementById('rfRails').value) || 3;
    if(!text){ showToast('Enter text first', 'error'); return; }

    let result;
    if(mode === 'enc'){
        const fence = Array.from({length: rails}, () => []);
        let rail = 0, dir = 1;
        for(const c of text){
            fence[rail].push(c);
            if(rail === 0) dir = 1;
            if(rail === rails - 1) dir = -1;
            rail += dir;
        }
        result = fence.map(r => r.join('')).join('');
    } else {
        const len    = text.length;
        const pattern = [];
        let rail = 0, dir = 1;
        for(let i = 0; i < len; i++){
            pattern.push(rail);
            if(rail === 0) dir = 1;
            if(rail === rails - 1) dir = -1;
            rail += dir;
        }
        const indices = Array.from({length: rails}, (_,r) =>
            pattern.map((p,i) => p === r ? i : -1).filter(i => i >= 0)
        );
        const chars = new Array(len);
        let pos = 0;
        for(const group of indices){
            for(const idx of group){
                chars[idx] = text[pos++];
            }
        }
        result = chars.join('');
    }
    setOutput('rfOutput', result);
}

function clearRailFence(){
    document.getElementById('rfInput').value = '';
    const out = document.getElementById('rfOutput');
    if(out) out.innerHTML = '<span style="color:var(--muted)">Result will appear here...</span>';
}

// =========================
// FREQUENCY ANALYZER
// =========================

function buildFrequencyAnalyzer(panel){
    panel.innerHTML = `
    ${toolHeader('', 'Frequency Analyzer', 'Analyze character frequency to help crack substitution ciphers')}

    <div class="tool-wrap">
        <div class="tool-title">Frequency Analyzer</div>
        <label>Ciphertext</label>
        <textarea id="freqInput" placeholder="Paste ciphertext here..."></textarea>
        <div class="button-group">
            <button class="btn btn-run" onclick="runFrequencyAnalyzer()">Analyze</button>
            <button class="btn btn-outline" onclick="clearFreqAnalyzer()">Clear</button>
        </div>
        ${createOutput('freqOutput', 'Frequency Analysis')}
    </div>`;
    autoSaveInput('freqInput', 'frequencyAnalyzer');
}

function runFrequencyAnalyzer(){
    const rawText = document.getElementById('freqInput').value;
    const text = rawText.toUpperCase().replace(/[^A-Z]/g,'');
    if(!text){ showToast('Enter ciphertext', 'error'); return; }

    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const freq = Object.fromEntries(alphabet.map(char => [char, 0]));
    for(const c of text) freq[c]++;

    const sorted = Object.entries(freq).sort((a,b) => b[1]-a[1] || a[0].localeCompare(b[0]));
    const total  = text.length;
    const english = 'ETAOINSHRDLCUMWFGYPBVKJXQZ'.split('');
    const nonLetters = rawText.length - text.length;
    const ioc = total > 1
        ? Object.values(freq).reduce((sum, count) => sum + count * (count - 1), 0) / (total * (total - 1))
        : 0;

    const html = `
    <div style="margin-bottom:16px; color:var(--muted); font-size:13px;">
        Total letters: <strong style="color:var(--text);">${total}</strong>
        &nbsp;|&nbsp; Ignored non-letters: <strong style="color:var(--text);">${nonLetters}</strong>
        &nbsp;|&nbsp; Index of Coincidence: <strong style="color:var(--text);">${ioc.toFixed(4)}</strong>
    </div>
    <div style="margin-bottom:16px;">
        <div style="color:var(--muted); font-size:12px; margin-bottom:8px;">
            English frequency order: E T A O I N S H R D L C U M W F G Y P B
        </div>
        <div style="color:var(--primary); font-size:12px; margin-bottom:8px;">
            Your frequency order: ${sorted.filter(s => s[1] > 0).map(s=>s[0]).join(' ') || 'N/A'}
        </div>
    </div>
    ${sorted.map(([char, count], idx) => {
        const pct      = ((count / total) * 100).toFixed(1);
        const engChar  = english[idx] || '?';
        const barWidth = sorted[0][1] ? Math.round((count / sorted[0][1]) * 100) : 0;
        return `
        <div style="display:flex; align-items:center; gap:12px; margin-bottom:8px;">
            <span style="color:var(--primary); font-weight:700; min-width:20px;
                         font-size:16px; font-family:var(--font-mono);">${char}</span>
            <div style="flex:1; background:var(--border); border-radius:4px; height:20px; position:relative;">
                <div style="background:var(--primary); width:${barWidth}%; height:100%;
                            border-radius:4px; opacity:0.7;"></div>
            </div>
            <span style="min-width:50px; font-size:12px; color:var(--text);">${count} (${pct}%)</span>
            <span style="min-width:60px; font-size:12px; color:var(--muted);">
                -> likely <strong style="color:var(--success);">${engChar}</strong>
            </span>
        </div>`;
    }).join('')}`;

    setOutput('freqOutput', html, true);
}

function clearFreqAnalyzer(){
    document.getElementById('freqInput').value = '';
    const out = document.getElementById('freqOutput');
    if(out) out.innerHTML = '<span style="color:var(--muted)">Result will appear here...</span>';
}

// =========================
// RSA TOOL
// =========================

function buildRsaTool(panel){
    panel.innerHTML = `
    ${toolHeader('', 'RSA Tool', 'RSA encrypt, decrypt and key inspector for small keys')}

    <div class="tool-wrap">
        <div class="tool-title">RSA Tool</div>

        <div class="tabs">
            <button class="tab-btn active" onclick="switchTab(this,'rsaEnc')">Encrypt</button>
            <button class="tab-btn"        onclick="switchTab(this,'rsaDec')">Decrypt</button>
            <button class="tab-btn"        onclick="switchTab(this,'rsaFactor')">Factor N</button>
        </div>

        <div class="tab-content active" id="rsaEnc">
            <label>Message (number)</label>
            <input type="text" id="rsaEncMsg" placeholder="e.g. 42">
            <label>Public Key e</label>
            <input type="text" id="rsaEncE" placeholder="e.g. 65537">
            <label>Modulus n</label>
            <input type="text" id="rsaEncN" placeholder="e.g. 3233">
            <div class="button-group">
                <button class="btn btn-run" onclick="runRsaEncrypt()">Encrypt</button>
            </div>
            ${createOutput('rsaEncOutput', 'Ciphertext')}
        </div>

        <div class="tab-content" id="rsaDec">
            <label>Ciphertext (number)</label>
            <input type="text" id="rsaDecC" placeholder="e.g. 2790">
            <label>Private Key d</label>
            <input type="text" id="rsaDecD" placeholder="e.g. 2753">
            <label>Modulus n</label>
            <input type="text" id="rsaDecN" placeholder="e.g. 3233">
            <div class="button-group">
                <button class="btn btn-run" onclick="runRsaDecrypt()">Decrypt</button>
            </div>
            ${createOutput('rsaDecOutput', 'Plaintext')}
        </div>

        <div class="tab-content" id="rsaFactor">
            <div class="info-box">
                Attempts to factor small N values using trial division.
                Works for N up to ~10^12 in reasonable time.
                For larger N use factordb.com.
            </div>
            <label>Modulus n to Factor</label>
            <input type="text" id="rsaFactorN" placeholder="e.g. 3233">
            <div class="button-group">
                <button class="btn btn-run" onclick="runRsaFactor()">Factor N</button>
            </div>
            ${createOutput('rsaFactorOutput', 'Factors')}
        </div>
    </div>`;
}

function modPow(base, exp, mod){
    base = BigInt(base);
    exp  = BigInt(exp);
    mod  = BigInt(mod);
    let result = 1n;
    base = base % mod;
    while(exp > 0n){
        if(exp % 2n === 1n) result = (result * base) % mod;
        exp  = exp / 2n;
        base = (base * base) % mod;
    }
    return result;
}

function runRsaEncrypt(){
    try{
        const m = document.getElementById('rsaEncMsg').value.trim();
        const e = document.getElementById('rsaEncE').value.trim();
        const n = document.getElementById('rsaEncN').value.trim();
        if(!m || !e || !n){ showToast('Fill all fields', 'error'); return; }
        const c = modPow(m, e, n);
        setOutput('rsaEncOutput', `Ciphertext: ${c.toString()}\n\nFormula: c = m^e mod n = ${m}^${e} mod ${n}`);
    } catch(err){ showToast('Invalid input', 'error'); }
}

function runRsaDecrypt(){
    try{
        const c = document.getElementById('rsaDecC').value.trim();
        const d = document.getElementById('rsaDecD').value.trim();
        const n = document.getElementById('rsaDecN').value.trim();
        if(!c || !d || !n){ showToast('Fill all fields', 'error'); return; }
        const m = modPow(c, d, n);
        setOutput('rsaDecOutput', `Plaintext: ${m.toString()}\n\nFormula: m = c^d mod n = ${c}^${d} mod ${n}`);
    } catch(err){ showToast('Invalid input', 'error'); }
}

function runRsaFactor(){
    const nStr = document.getElementById('rsaFactorN').value.trim();
    if(!nStr){ showToast('Enter N', 'error'); return; }

    let n = BigInt(nStr);
    if(n <= 1n){ setOutput('rsaFactorOutput', 'N must be greater than 1'); return; }

    const factors = [];
    let temp = n;

    // Trial division
    for(let i = 2n; i * i <= temp && i < 1000000n; i++){
        while(temp % i === 0n){
            factors.push(i);
            temp /= i;
        }
    }
    if(temp > 1n) factors.push(temp);

    if(factors.length === 2 && factors[0] !== factors[1]){
        const p = factors[0], q = factors[1];
        setOutput('rsaFactorOutput',
            `Factored!\n\np = ${p}\nq = ${q}\nn = p * q = ${(p*q)}\n\n` +
            `phi(n) = (p-1)(q-1) = ${(p-1n)*(q-1n)}`
        );
    } else if(factors.length === 1){
        setOutput('rsaFactorOutput', `N appears to be prime: ${factors[0]}`);
    } else {
        setOutput('rsaFactorOutput', `Factors: ${factors.join(', ')}\n\nFor large N use factordb.com`);
    }
}

// =========================
// AES TOOL
// =========================

function buildAesTool(panel){
    panel.innerHTML = `
    ${toolHeader('', 'AES Tool', 'AES encrypt and decrypt with various modes')}

    <div class="tool-wrap">
        <div class="tool-title">AES Tool</div>

        <label>Text</label>
        <textarea id="aesInput" placeholder="Enter text to encrypt or decrypt..."></textarea>
        <label>Key (any length - will be hashed to AES key)</label>
        <input type="text" id="aesKey" placeholder="Enter encryption key...">
        <label>Mode</label>
        <select id="aesMode">
            <option value="CBC">CBC</option>
            <option value="ECB">ECB</option>
            <option value="CTR">CTR</option>
            <option value="CFB">CFB</option>
            <option value="OFB">OFB</option>
        </select>
        <div class="button-group">
            <button class="btn btn-run" onclick="runAes('enc')">Encrypt</button>
            <button class="btn btn-run" onclick="runAes('dec')">Decrypt</button>
            <button class="btn btn-outline" onclick="clearAes()">Clear</button>
        </div>
        ${createOutput('aesOutput', 'AES Output')}
    </div>`;
    autoSaveInput('aesInput', 'aesTool');
}

function runAes(mode){
    const text    = document.getElementById('aesInput').value;
    const key     = document.getElementById('aesKey').value;
    const aesMode = document.getElementById('aesMode').value;
    if(!text){ showToast('Enter text', 'error'); return; }
    if(!key){  showToast('Enter key',  'error'); return; }

    try{
        const modeMap = {
            CBC: CryptoJS.mode.CBC,
            ECB: CryptoJS.mode.ECB,
            CTR: CryptoJS.mode.CTR,
            CFB: CryptoJS.mode.CFB,
            OFB: CryptoJS.mode.OFB,
        };
        const hashedKey = CryptoJS.SHA256(key);
        const cfg = { mode: modeMap[aesMode], padding: CryptoJS.pad.Pkcs7 };
        if(aesMode !== 'ECB') cfg.iv = CryptoJS.MD5(key);

        if(mode === 'enc'){
            const encrypted = CryptoJS.AES.encrypt(text, hashedKey, cfg);
            setOutput('aesOutput', encrypted.toString());
        } else {
            const decrypted = CryptoJS.AES.decrypt(text, hashedKey, cfg);
            const plaintext = decrypted.toString(CryptoJS.enc.Utf8);
            if(!plaintext) throw new Error('Invalid key, mode or ciphertext');
            setOutput('aesOutput', plaintext);
        }
    } catch(e){
        setOutput('aesOutput', `Error: ${e.message}`);
        showToast('AES operation failed', 'error');
    }
}

function clearAes(){
    document.getElementById('aesInput').value = '';
    document.getElementById('aesKey').value   = '';
    const out = document.getElementById('aesOutput');
    if(out) out.innerHTML = '<span style="color:var(--muted)">Result will appear here...</span>';
}

// =========================
// BASE CONVERTER
// =========================

function buildBaseConverter(panel){
    panel.innerHTML = `
    ${toolHeader('', 'Base Converter', 'Convert numbers between all common bases')}

    <div class="tool-wrap">
        <div class="tool-title">Base Converter</div>

        <label>Input Value</label>
        <input type="text" id="baseInput" placeholder="Enter number..." oninput="runBaseConverter()">
        <label>Input Base</label>
        <select id="baseFrom" onchange="runBaseConverter()">
            <option value="2">Binary (Base 2)</option>
            <option value="8">Octal (Base 8)</option>
            <option value="10" selected>Decimal (Base 10)</option>
            <option value="16">Hexadecimal (Base 16)</option>
            <option value="32">Base 32</option>
            <option value="36">Base 36</option>
            <option value="64">Base 64</option>
        </select>

        ${createOutput('baseOutput', 'Conversions')}
    </div>`;
}

function runBaseConverter(){
    const input    = document.getElementById('baseInput').value.trim();
    const fromBase = parseInt(document.getElementById('baseFrom').value);
    if(!input) return;

    try{
        let decimal;
        if(fromBase === 64){
            const decoded = atob(input);
            decimal = 0;
            for(let i = 0; i < decoded.length; i++)
                decimal = decimal * 256 + decoded.charCodeAt(i);
        } else {
            decimal = parseInt(input.replace(/\s/g,''), fromBase);
        }

        if(isNaN(decimal)){ setOutput('baseOutput', 'Invalid input for selected base'); return; }

        const d = BigInt(Math.floor(decimal));

        const results = [
            { label: 'Binary (Base 2)',    value: d.toString(2) },
            { label: 'Octal (Base 8)',     value: d.toString(8) },
            { label: 'Decimal (Base 10)',  value: d.toString(10) },
            { label: 'Hex (Base 16)',      value: d.toString(16).toUpperCase() },
            { label: 'Base 36',            value: d.toString(36).toUpperCase() },
            { label: 'ASCII',              value: decimal >= 32 && decimal < 127
                ? String.fromCharCode(decimal) : 'N/A' },
        ];

        const html = results.map(r => `
            <div style="display:flex; justify-content:space-between; align-items:center;
                        padding:10px; background:var(--panel-light); border-radius:var(--radius-sm);
                        margin-bottom:6px;">
                <span style="color:var(--muted); font-size:13px; min-width:160px;">${r.label}</span>
                <span style="font-family:var(--font-mono); color:var(--text); word-break:break-all;">
                    ${r.value}
                </span>
                <button class="output-action-btn"
                    onclick="copyText('${r.value}', this)">Copy</button>
            </div>
        `).join('');

        setOutput('baseOutput', html, true);
    } catch(e){
        setOutput('baseOutput', `Error: ${e.message}`);
    }
}

// =========================
// HMAC GENERATOR
// =========================

function buildHmacGenerator(panel){
    panel.innerHTML = `
    ${toolHeader('', 'HMAC Generator', 'Generate HMAC signatures for authentication')}

    <div class="tool-wrap">
        <div class="tool-title">HMAC Generator</div>
        <label>Message</label>
        <textarea id="hmacMsg" placeholder="Enter message..."></textarea>
        <label>Secret Key</label>
        <input type="text" id="hmacKey" placeholder="Enter secret key...">
        <label>Algorithm</label>
        <select id="hmacAlgo">
            <option value="MD5">HMAC-MD5</option>
            <option value="SHA1">HMAC-SHA1</option>
            <option value="SHA256" selected>HMAC-SHA256</option>
            <option value="SHA512">HMAC-SHA512</option>
        </select>
        <div class="button-group">
            <button class="btn btn-run" onclick="runHmac()">Generate HMAC</button>
            <button class="btn btn-outline" onclick="clearHmac()">Clear</button>
        </div>
        ${createOutput('hmacOutput', 'HMAC Result')}
    </div>`;
    autoSaveInput('hmacMsg', 'hmacGenerator');
}

function runHmac(){
    const msg   = document.getElementById('hmacMsg').value;
    const key   = document.getElementById('hmacKey').value;
    const algo  = document.getElementById('hmacAlgo').value;
    if(!msg){ showToast('Enter message', 'error'); return; }
    if(!key){ showToast('Enter key',     'error'); return; }

    const algoMap = {
        MD5:    CryptoJS.HmacMD5,
        SHA1:   CryptoJS.HmacSHA1,
        SHA256: CryptoJS.HmacSHA256,
        SHA512: CryptoJS.HmacSHA512,
    };

    const hmac = algoMap[algo](msg, key).toString();
    setOutput('hmacOutput', `Algorithm: HMAC-${algo}\nKey:       ${key}\nMessage:   ${msg}\n\nHMAC:      ${hmac}`);
}

function clearHmac(){
    document.getElementById('hmacMsg').value = '';
    document.getElementById('hmacKey').value = '';
    const out = document.getElementById('hmacOutput');
    if(out) out.innerHTML = '<span style="color:var(--muted)">Result will appear here...</span>';
}

// =========================
// ASCII CONVERTER
// =========================

function buildAsciiConverter(panel){
    panel.innerHTML = `
    ${toolHeader('', 'ASCII Converter', 'Convert between ASCII text, decimal, hex and binary')}

    <div class="tool-wrap">
        <div class="tool-title">ASCII Converter</div>

        <div class="tabs">
            <button class="tab-btn active" onclick="switchTab(this,'asciiText')">Text to Numbers</button>
            <button class="tab-btn"        onclick="switchTab(this,'asciiNum')">Numbers to Text</button>
            <button class="tab-btn"        onclick="switchTab(this,'asciiTable')">ASCII Table</button>
        </div>

        <div class="tab-content active" id="asciiText">
            <label>Text</label>
            <textarea id="asciiTextInput" placeholder="Enter text..."></textarea>
            <div class="button-group">
                <button class="btn btn-run" onclick="runAsciiToNum('dec')">To Decimal</button>
                <button class="btn btn-run" onclick="runAsciiToNum('hex')">To Hex</button>
                <button class="btn btn-run" onclick="runAsciiToNum('bin')">To Binary</button>
                <button class="btn btn-outline" onclick="clearAsciiText()">Clear</button>
            </div>
            ${createOutput('asciiTextOutput', 'Number Output')}
        </div>

        <div class="tab-content" id="asciiNum">
            <label>Numbers (space or comma separated)</label>
            <textarea id="asciiNumInput" placeholder="e.g. 72 101 108 108 111 or 0x48 0x65..."></textarea>
            <div class="button-group">
                <button class="btn btn-run" onclick="runNumToAscii('dec')">From Decimal</button>
                <button class="btn btn-run" onclick="runNumToAscii('hex')">From Hex</button>
                <button class="btn btn-run" onclick="runNumToAscii('bin')">From Binary</button>
                <button class="btn btn-outline" onclick="clearAsciiNum()">Clear</button>
            </div>
            ${createOutput('asciiNumOutput', 'Text Output')}
        </div>

        <div class="tab-content" id="asciiTable">
            ${buildAsciiTableHTML()}
        </div>
    </div>`;

    autoSaveInput('asciiTextInput', 'asciiConverter');
}

function runAsciiToNum(type){
    const text = document.getElementById('asciiTextInput').value;
    if(!text){ showToast('Enter text', 'error'); return; }
    let result;
    switch(type){
        case 'dec': result = Array.from(text).map(c => c.charCodeAt(0)).join(' '); break;
        case 'hex': result = Array.from(text).map(c => '0x'+c.charCodeAt(0).toString(16).padStart(2,'0')).join(' '); break;
        case 'bin': result = Array.from(text).map(c => c.charCodeAt(0).toString(2).padStart(8,'0')).join(' '); break;
    }
    setOutput('asciiTextOutput', result);
}

function clearAsciiText(){
    document.getElementById('asciiTextInput').value = '';
    const out = document.getElementById('asciiTextOutput');
    if(out) out.innerHTML = '<span style="color:var(--muted)">Result will appear here...</span>';
}

function runNumToAscii(type){
    const input = document.getElementById('asciiNumInput').value.trim();
    if(!input){ showToast('Enter numbers', 'error'); return; }
    try{
        let nums;
        switch(type){
            case 'dec': nums = input.split(/[\s,]+/).map(n => parseInt(n,10)); break;
            case 'hex': nums = input.split(/[\s,]+/).map(n => parseInt(n.replace('0x',''),16)); break;
            case 'bin': nums = input.split(/[\s,]+/).map(n => parseInt(n,2)); break;
        }
        const result = nums.map(n => String.fromCharCode(n)).join('');
        setOutput('asciiNumOutput', result);
    } catch(e){
        showToast('Invalid input', 'error');
    }
}

function clearAsciiNum(){
    document.getElementById('asciiNumInput').value = '';
    const out = document.getElementById('asciiNumOutput');
    if(out) out.innerHTML = '<span style="color:var(--muted)">Result will appear here...</span>';
}

function buildAsciiTableHTML(){
    const printable = [];
    for(let i = 32; i <= 126; i++){
        printable.push(`
            <div style="display:flex; gap:6px; padding:4px 8px;
                        background:var(--panel-light); border-radius:6px;
                        font-size:12px; align-items:center; min-width:120px;">
                <span style="color:var(--primary); font-weight:700; min-width:24px;
                             font-size:14px; text-align:center;">
                    ${String.fromCharCode(i) === ' ' ? 'SP' : String.fromCharCode(i)}
                </span>
                <span style="color:var(--muted); min-width:30px;">${i}</span>
                <span style="color:var(--text); font-family:var(--font-mono);">
                    0x${i.toString(16).padStart(2,'0').toUpperCase()}
                </span>
            </div>
        `);
    }
    return `
    <div style="display:flex; flex-wrap:wrap; gap:4px; max-height:400px; overflow-y:auto; padding:8px 0;">
        ${printable.join('')}
    </div>`;
}

// =========================
// MORSE CODE HELPERS
// =========================

const MORSE_MAP = {
    A:'.-', B:'-...', C:'-.-.', D:'-..', E:'.', F:'..-.', G:'--.', H:'....',
    I:'..', J:'.---', K:'-.-', L:'.-..', M:'--', N:'-.', O:'---', P:'.--.',
    Q:'--.-', R:'.-.', S:'...', T:'-', U:'..-', V:'...-', W:'.--', X:'-..-',
    Y:'-.--', Z:'--..', '0':'-----', '1':'.----', '2':'..---', '3':'...--',
    '4':'....-', '5':'.....', '6':'-....', '7':'--...', '8':'---..', '9':'----.',
    '.':'.-.-.-', ',':'--..--', '?':'..--..', "'":'.----.', '!':'-.-.--',
    '/':'-..-.', '(':'-.--.', ')':'-.--.-', '&':'.-...', ':':'---...',
    ';':'-.-.-.', '=':'-...-', '+':'.-.-.', '-':'-....-', '_':'..--.-',
    '"':'.-..-.', '$':'...-..-', '@':'.--.-.', ' ':' '
};
const REVERSE_MORSE = Object.fromEntries(Object.entries(MORSE_MAP).map(([k,v]) => [v,k]));

function textToMorse(text){
    return text.toUpperCase().split('').map(c =>
        MORSE_MAP[c] || c
    ).join(' ');
}

function morseToText(morse){
    return morse.split('   ').map(word =>
        word.split(' ').map(code => REVERSE_MORSE[code] || code).join('')
    ).join(' ');
}

// =========================
// TAB SWITCHER
// =========================

function switchTab(btn, tabId){
    const parent = btn.closest('.tool-wrap');
    parent.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    parent.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    const tab = document.getElementById(tabId);
    if(tab) tab.classList.add('active');
}
