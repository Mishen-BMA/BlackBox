// =========================
// DIFF CHECKER
// =========================

function buildDiffChecker(panel){
    panel.innerHTML = `
    ${toolHeader('', 'Diff Checker', 'Compare two texts and highlight differences')}
    <div class="tool-wrap">
        <div class="tool-title">Diff Checker</div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            <div>
                <label>Original Text</label>
                <textarea id="diffA" placeholder="Original text..." style="min-height:150px;"></textarea>
            </div>
            <div>
                <label>Modified Text</label>
                <textarea id="diffB" placeholder="Modified text..." style="min-height:150px;"></textarea>
            </div>
        </div>
        <div class="button-group">
            <button class="btn btn-run" onclick="runDiffChecker()">Compare</button>
            <button class="btn btn-outline" onclick="clearDiff()">Clear</button>
        </div>
        ${createOutput('diffOutput', 'Differences')}
    </div>`;
}

function runDiffChecker(){
    const a = document.getElementById('diffA').value;
    const b = document.getElementById('diffB').value;
    if(!a && !b){ showToast('Enter text in both fields', 'error'); return; }

    const aLines = a.split('\n');
    const bLines = b.split('\n');

    // Simple line-by-line diff
    const maxLen = Math.max(aLines.length, bLines.length);
    let added = 0, removed = 0, changed = 0;

    const html = Array.from({length: maxLen}, (_,i) => {
        const lineA = aLines[i];
        const lineB = bLines[i];

        if(lineA === lineB){
            return `<div style="padding:3px 8px; font-family:var(--font-mono); font-size:13px;
                        color:var(--muted);">&nbsp; ${escapeHtml(lineA || '')}</div>`;
        } else if(lineA === undefined){
            added++;
            return `<div style="padding:3px 8px; background:rgba(63,185,80,0.1);
                        font-family:var(--font-mono); font-size:13px; color:var(--success);">
                        + ${escapeHtml(lineB)}</div>`;
        } else if(lineB === undefined){
            removed++;
            return `<div style="padding:3px 8px; background:rgba(248,81,73,0.1);
                        font-family:var(--font-mono); font-size:13px; color:var(--danger);">
                        - ${escapeHtml(lineA)}</div>`;
        } else {
            changed++;
            return `
            <div style="padding:3px 8px; background:rgba(248,81,73,0.1);
                        font-family:var(--font-mono); font-size:13px; color:var(--danger);">
                - ${escapeHtml(lineA)}</div>
            <div style="padding:3px 8px; background:rgba(63,185,80,0.1);
                        font-family:var(--font-mono); font-size:13px; color:var(--success);">
                + ${escapeHtml(lineB)}</div>`;
        }
    }).join('');

    setOutput('diffOutput', `
    <div style="margin-bottom:12px; display:flex; gap:16px; font-size:13px;">
        <span style="color:var(--success);">+${added} added</span>
        <span style="color:var(--danger);">-${removed} removed</span>
        <span style="color:var(--warning);">~${changed} changed</span>
    </div>
    ${html}`, true);
}

function escapeHtml(text){
    return text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function clearDiff(){
    document.getElementById('diffA').value = '';
    document.getElementById('diffB').value = '';
    const out = document.getElementById('diffOutput');
    if(out) out.innerHTML = '<span style="color:var(--muted)">Result will appear here...</span>';
}

// =========================
// TIMESTAMP CONVERTER
// =========================

function buildTimestampConverter(panel){
    panel.innerHTML = `
    ${toolHeader('', 'Timestamp Converter', 'Convert between Unix timestamps and human-readable dates')}
    <div class="tool-wrap">
        <div class="tool-title">Timestamp Converter</div>

        <div class="tabs">
            <button class="tab-btn active" onclick="switchTab(this,'tsToDate')">Timestamp -> Date</button>
            <button class="tab-btn"        onclick="switchTab(this,'dateToTs')">Date -> Timestamp</button>
            <button class="tab-btn"        onclick="switchTab(this,'tsNow')">Current Time</button>
        </div>

        <div class="tab-content active" id="tsToDate">
            <label>Unix Timestamp (seconds or milliseconds)</label>
            <input type="text" id="tsInput" placeholder="e.g. 1700000000" oninput="runTsToDate()">
            ${createOutput('tsOutput', 'Date Conversions')}
        </div>

        <div class="tab-content" id="dateToTs">
            <label>Date and Time</label>
            <input type="datetime-local" id="dateInput" oninput="runDateToTs()">
            ${createOutput('dateOutput', 'Timestamps')}
        </div>

        <div class="tab-content" id="tsNow">
            <div class="button-group">
                <button class="btn btn-run" onclick="runTsNow()">Get Current Time</button>
            </div>
            ${createOutput('tsNowOutput', 'Current Timestamps')}
        </div>
    </div>`;
}

function runTsToDate(){
    let ts = parseInt(document.getElementById('tsInput').value.trim());
    if(isNaN(ts)) return;
    if(ts > 1e12) ts = ts / 1000; // milliseconds
    const d = new Date(ts * 1000);
    const fields = [
        ['Unix Seconds',  Math.floor(ts)],
        ['Unix Millis',   Math.floor(ts*1000)],
        ['UTC',           d.toUTCString()],
        ['ISO 8601',      d.toISOString()],
        ['Local Time',    d.toLocaleString()],
        ['Date only',     d.toLocaleDateString()],
        ['Time only',     d.toLocaleTimeString()],
    ];
    setOutput('tsOutput', fields.map(([k,v])=>`${k.padEnd(16)} ${v}`).join('\n'));
}

function runDateToTs(){
    const val = document.getElementById('dateInput').value;
    if(!val) return;
    const d  = new Date(val);
    const ts = Math.floor(d.getTime()/1000);
    setOutput('dateOutput',
        `Unix Seconds:  ${ts}\nUnix Millis:   ${ts*1000}\nISO 8601:      ${d.toISOString()}\nUTC:           ${d.toUTCString()}`
    );
}

function runTsNow(){
    const now  = new Date();
    const ts   = Math.floor(now.getTime()/1000);
    setOutput('tsNowOutput',
        `Unix Seconds:  ${ts}\nUnix Millis:   ${now.getTime()}\nUTC:           ${now.toUTCString()}\nISO 8601:      ${now.toISOString()}\nLocal:         ${now.toLocaleString()}`
    );
}

// =========================
// QR CODE TOOL
// =========================

function buildQrTool(panel){
    panel.innerHTML = `
    ${toolHeader('', 'QR Code Tool', 'Read and generate QR codes')}
    <div class="tool-wrap">
        <div class="tool-title">QR Code Tool</div>

        <div class="tabs">
            <button class="tab-btn active" onclick="switchTab(this,'qrGen')">Generate</button>
            <button class="tab-btn"        onclick="switchTab(this,'qrRead')">Read</button>
        </div>

        <div class="tab-content active" id="qrGen">
            <label>Text or URL to encode</label>
            <textarea id="qrInput" placeholder="Enter text or URL..."></textarea>
            <label>Size</label>
            <select id="qrSize">
                <option value="128">128px</option>
                <option value="256" selected>256px</option>
                <option value="512">512px</option>
            </select>
            <div class="button-group">
                <button class="btn btn-run" onclick="runQrGenerate()">Generate QR</button>
                <button class="btn btn-outline" onclick="clearQr()">Clear</button>
            </div>
            <div id="qrGenOutput" style="margin-top:16px; text-align:center;"></div>
        </div>

        <div class="tab-content" id="qrRead">
            <div class="info-box">Upload an image containing a QR code to decode it.</div>
            <label>Upload QR Code Image</label>
            <input type="file" id="qrFile" accept="image/*">
            <div class="button-group">
                <button class="btn btn-run" onclick="runQrRead()">Read QR Code</button>
            </div>
            <canvas id="qrCanvas" style="display:none;"></canvas>
            ${createOutput('qrReadOutput', 'QR Content')}
        </div>
    </div>`;
}

function runQrGenerate(){
    const text = document.getElementById('qrInput').value.trim();
    const size = parseInt(document.getElementById('qrSize').value);
    if(!text){ showToast('Enter text to encode', 'error'); return; }

    const container = document.getElementById('qrGenOutput');
    container.innerHTML = '';

    if(typeof QRCode !== 'undefined'){
        container.innerHTML = '<div id="qrcode" style="display:inline-block; padding:16px; background:white; border-radius:12px;"></div>';
        new QRCode(document.getElementById('qrcode'), {
            text, width: size, height: size,
            colorDark: '#000', colorLight: '#fff',
        });
        setTimeout(() => {
            const img = container.querySelector('img');
            if(img){
                container.innerHTML += `
                <br><br>
                <a href="${img.src}" download="qrcode.png" class="btn btn-outline btn-sm">Download PNG
                </a>`;
            }
        }, 200);
    } else {
        // Fallback: use Google Charts API
        const url = `https://chart.googleapis.com/chart?chs=${size}x${size}&cht=qr&chl=${encodeURIComponent(text)}`;
        container.innerHTML = `
        <img src="${url}" style="border-radius:12px; max-width:100%;" alt="QR Code">
        <br><br>
        <a href="${url}" download="qrcode.png" target="_blank" class="btn btn-outline btn-sm">Download
        </a>`;
    }
}

function runQrRead(){
    const file = document.getElementById('qrFile').files[0];
    if(!file){ showToast('Upload a QR code image', 'error'); return; }

    const img    = new Image();
    const canvas = document.getElementById('qrCanvas');
    const ctx    = canvas.getContext('2d');
    const url    = URL.createObjectURL(file);

    img.onload = function(){
        canvas.width  = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        if(typeof jsQR !== 'undefined'){
            const code = jsQR(imageData.data, imageData.width, imageData.height);
            if(code){
                setOutput('qrReadOutput', ` QR Decoded:\n\n${code.data}`);
                showToast('QR code decoded!');
            } else {
                setOutput('qrReadOutput', ' No QR code found in image');
            }
        } else {
            setOutput('qrReadOutput', 'jsQR library not loaded. Add jsqr.min.js to assets/libs/');
        }
    };
    img.src = url;
}

function clearQr(){
    document.getElementById('qrInput').value = '';
    document.getElementById('qrGenOutput').innerHTML = '';
}

// =========================
// MORSE CODE
// =========================

function buildMorseTool(panel){
    panel.innerHTML = `
    ${toolHeader('', 'Morse Code', 'Encode and decode Morse code')}
    <div class="tool-wrap">
        <div class="tool-title">Morse Code</div>

        <div class="tabs">
            <button class="tab-btn active" onclick="switchTab(this,'morseEnc')">Text -> Morse</button>
            <button class="tab-btn"        onclick="switchTab(this,'morseDec')">Morse -> Text</button>
            <button class="tab-btn"        onclick="switchTab(this,'morseRef')">Reference</button>
        </div>

        <div class="tab-content active" id="morseEnc">
            <label>Text</label>
            <textarea id="morseEncInput" placeholder="Enter text to encode..."></textarea>
            <div class="button-group">
                <button class="btn btn-run" onclick="runMorseEncode()">Encode</button>
                <button class="btn btn-outline" onclick="clearMorse()">Clear</button>
            </div>
            ${createOutput('morseEncOutput', 'Morse Code')}
        </div>

        <div class="tab-content" id="morseDec">
            <div class="info-box">
                Use dots and dashes. Separate letters with space, words with 3 spaces or /.
            </div>
            <label>Morse Code</label>
            <textarea id="morseDecInput" placeholder="... --- ... (SOS)"></textarea>
            <div class="button-group">
                <button class="btn btn-run" onclick="runMorseDecode()">Decode</button>
                <button class="btn btn-outline" onclick="clearMorseDec()">Clear</button>
            </div>
            ${createOutput('morseDecOutput', 'Decoded Text')}
        </div>

        <div class="tab-content" id="morseRef">
            <div style="display:flex; flex-wrap:wrap; gap:4px;">
                ${Object.entries(MORSE_MAP).filter(([k]) => k !== ' ').map(([char, code]) => `
                <div style="padding:6px 10px; background:var(--panel-light); border-radius:6px;
                            min-width:80px; text-align:center;">
                    <div style="color:var(--primary); font-weight:700;">${char}</div>
                    <div style="color:var(--muted); font-family:var(--font-mono); font-size:13px;">${code}</div>
                </div>`).join('')}
            </div>
        </div>
    </div>`;
}

function runMorseEncode(){
    const text = document.getElementById('morseEncInput').value;
    if(!text){ showToast('Enter text', 'error'); return; }
    setOutput('morseEncOutput', textToMorse(text));
}

function runMorseDecode(){
    const morse = document.getElementById('morseDecInput').value;
    if(!morse){ showToast('Enter Morse code', 'error'); return; }
    setOutput('morseDecOutput', morseToText(morse));
}

function clearMorse(){
    document.getElementById('morseEncInput').value = '';
    const out = document.getElementById('morseEncOutput');
    if(out) out.innerHTML = '<span style="color:var(--muted)">Result will appear here...</span>';
}

function clearMorseDec(){
    document.getElementById('morseDecInput').value = '';
    const out = document.getElementById('morseDecOutput');
    if(out) out.innerHTML = '<span style="color:var(--muted)">Result will appear here...</span>';
}

// =========================
// PASSWORD GENERATOR
// =========================

function getRandomBytes(length){
    const bytes = new Uint8Array(length);
    const cryptoApi = globalThis.crypto || window.crypto;
    if(cryptoApi?.getRandomValues){
        cryptoApi.getRandomValues(bytes);
        return bytes;
    }

    for(let i = 0; i < length; i++){
        bytes[i] = Math.floor(Math.random() * 256);
    }
    return bytes;
}

function buildPasswordGen(panel){
    panel.innerHTML = `
    ${toolHeader('', 'Password Generator', 'Generate strong passwords with custom options')}
    <div class="tool-wrap">
        <div class="tool-title">Password Generator</div>

        <label>Length: <span id="passLenVal">20</span></label>
        <input type="range" id="passLen" min="4" max="128" value="20"
            oninput="document.getElementById('passLenVal').textContent=this.value" style="width:100%; margin-bottom:12px;">

        <div style="display:flex; gap:16px; flex-wrap:wrap; margin-bottom:12px;">
            <label style="display:flex; align-items:center; gap:6px; color:var(--muted-light); font-size:14px; margin:0;">
                <input type="checkbox" id="passUpper" checked> Uppercase (A-Z)
            </label>
            <label style="display:flex; align-items:center; gap:6px; color:var(--muted-light); font-size:14px; margin:0;">
                <input type="checkbox" id="passLower" checked> Lowercase (a-z)
            </label>
            <label style="display:flex; align-items:center; gap:6px; color:var(--muted-light); font-size:14px; margin:0;">
                <input type="checkbox" id="passNumbers" checked> Numbers (0-9)
            </label>
            <label style="display:flex; align-items:center; gap:6px; color:var(--muted-light); font-size:14px; margin:0;">
                <input type="checkbox" id="passSymbols"> Symbols (!@#$%)
            </label>
        </div>

        <label>Count</label>
        <input type="number" id="passCount" value="5" min="1" max="50">

        <div class="button-group">
            <button class="btn btn-run" onclick="runPasswordGen()">Generate</button>
            <button class="btn btn-outline" onclick="clearPasswordGen()">Clear</button>
        </div>
        ${createOutput('passOutput', 'Generated Passwords')}
    </div>`;
}

function runPasswordGen(){
    const len     = parseInt(document.getElementById('passLen').value);
    const count   = parseInt(document.getElementById('passCount').value) || 5;
    const upper   = document.getElementById('passUpper').checked;
    const lower   = document.getElementById('passLower').checked;
    const numbers = document.getElementById('passNumbers').checked;
    const symbols = document.getElementById('passSymbols').checked;

    if(!upper && !lower && !numbers && !symbols){
        showToast('Select at least one character set', 'error'); return;
    }

    let charset = '';
    if(upper)   charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if(lower)   charset += 'abcdefghijklmnopqrstuvwxyz';
    if(numbers) charset += '0123456789';
    if(symbols) charset += '!@#$%^&*()-_=+[]{}|;:,.<>?';

    const passwords = [];
    for(let i = 0; i < count; i++){
        let pass = '';
        const arr = getRandomBytes(len);
        for(const n of arr) pass += charset[n % charset.length];
        passwords.push(pass);
    }

    const strengthMap = len < 8 ? ['Weak', 'var(--danger)']
        : len < 12 ? ['Fair', 'var(--warning)']
        : len < 16 ? ['Good', 'var(--primary)']
        : ['Strong', 'var(--success)'];

    const html = `
    <div style="margin-bottom:12px; font-size:13px;">
        Strength: <strong style="color:${strengthMap[1]};">${strengthMap[0]}</strong>
        &nbsp;|&nbsp; Length: ${len} &nbsp;|&nbsp; Charset: ${charset.length} chars
    </div>
    ${passwords.map(p => `
    <div style="display:flex; align-items:center; gap:10px; padding:10px;
                background:var(--panel-light); border-radius:var(--radius-sm); margin-bottom:6px;">
        <span style="font-family:var(--font-mono); flex:1; word-break:break-all;">${p}</span>
        <button class="output-action-btn" onclick="copyText('${p}', this)">Copy</button>
    </div>`).join('')}
    <div style="margin-top:10px;">
        <button class="btn btn-outline btn-sm"
            onclick="copyText('${passwords.join('\\n')}')">Copy All</button>
    </div>`;

    setOutput('passOutput', html, true);
}

function clearPasswordGen(){
    const out = document.getElementById('passOutput');
    if(out) out.innerHTML = '<span style="color:var(--muted)">Result will appear here...</span>';
}

// =========================
// WORDLIST GENERATOR
// =========================

function buildWordlistGen(panel){
    panel.innerHTML = `
    ${toolHeader('', 'Wordlist Generator', 'Generate wordlist mutations from a base word')}
    <div class="tool-wrap">
        <div class="tool-title">Wordlist Generator</div>
        <label>Base Word</label>
        <input type="text" id="wlBase" placeholder="e.g. password, company, username">
        <label>Mutations to apply</label>
        <div style="display:flex; gap:12px; flex-wrap:wrap; margin-bottom:12px;">
            ${[
                ['wlCase',    'Case variations'],
                ['wlNumbers', 'Append numbers (0-9, 00-99, 1-100)'],
                ['wlYears',   'Append years (2020-2025)'],
                ['wlSymbols', 'Append symbols (!@#$)'],
                ['wlLeet',    'Leet speak (a->4, e->3, o->0)'],
                ['wlCommon',  'Common suffixes (123, 1234, !)'],
            ].map(([id, label]) => `
            <label style="display:flex; align-items:center; gap:6px;
                          color:var(--muted-light); font-size:13px; margin:0;">
                <input type="checkbox" id="${id}" checked> ${label}
            </label>`).join('')}
        </div>
        <div class="button-group">
            <button class="btn btn-run" onclick="runWordlistGen()">Generate</button>
            <button class="btn btn-outline" onclick="clearWordlistGen()">Clear</button>
        </div>
        ${createOutput('wlOutput', 'Generated Wordlist')}
    </div>`;
}

function runWordlistGen(){
    const base = document.getElementById('wlBase').value.trim();
    if(!base){ showToast('Enter a base word', 'error'); return; }

    const words = new Set([base]);
    const useCase    = document.getElementById('wlCase').checked;
    const useNumbers = document.getElementById('wlNumbers').checked;
    const useYears   = document.getElementById('wlYears').checked;
    const useSymbols = document.getElementById('wlSymbols').checked;
    const useLeet    = document.getElementById('wlLeet').checked;
    const useCommon  = document.getElementById('wlCommon').checked;

    if(useCase){
        words.add(base.toLowerCase());
        words.add(base.toUpperCase());
        words.add(base[0].toUpperCase() + base.slice(1));
        words.add(base[0].toUpperCase() + base.slice(1).toLowerCase());
    }

    if(useLeet){
        const leet = base.toLowerCase()
            .replace(/a/g,'4').replace(/e/g,'3')
            .replace(/o/g,'0').replace(/i/g,'1')
            .replace(/s/g,'5').replace(/t/g,'7');
        words.add(leet);
        words.add(leet[0].toUpperCase()+leet.slice(1));
    }

    const baseVariants = [...words];

    if(useNumbers){
        for(let i = 0; i <= 9;  i++) baseVariants.forEach(w => words.add(w+i));
        for(let i = 0; i <= 99; i++) baseVariants.forEach(w => words.add(w+String(i).padStart(2,'0')));
        for(let i = 1; i <= 100;i++) baseVariants.forEach(w => words.add(w+i));
    }

    if(useYears){
        for(let y = 2018; y <= 2026; y++) baseVariants.forEach(w => words.add(w+y));
    }

    if(useSymbols){
        ['!','@','#','$','*','_'].forEach(s => baseVariants.forEach(w => words.add(w+s)));
    }

    if(useCommon){
        ['123','1234','12345','!','!!','@123','_123','123!'].forEach(s =>
            baseVariants.forEach(w => words.add(w+s)));
    }

    const list = [...words];
    setOutput('wlOutput',
        `Generated ${list.length} words\n\n${list.join('\n')}`
    );
    showToast(`Generated ${list.length} words`);
}

function clearWordlistGen(){
    document.getElementById('wlBase').value = '';
    const out = document.getElementById('wlOutput');
    if(out) out.innerHTML = '<span style="color:var(--muted)">Result will appear here...</span>';
}

// =========================
// UUID TOOL
// =========================

function buildUuidTool(panel){
    panel.innerHTML = `
    ${toolHeader('', 'UUID Tool', 'Generate and analyze UUIDs')}
    <div class="tool-wrap">
        <div class="tool-title">UUID Tool</div>

        <div class="tabs">
            <button class="tab-btn active" onclick="switchTab(this,'uuidGen')">Generate</button>
            <button class="tab-btn"        onclick="switchTab(this,'uuidAnalyze')">Analyze</button>
        </div>

        <div class="tab-content active" id="uuidGen">
            <label>Count</label>
            <input type="number" id="uuidCount" value="5" min="1" max="100">
            <label>Version</label>
            <select id="uuidVersion">
                <option value="4">UUID v4 (Random)</option>
                <option value="nil">Nil UUID</option>
            </select>
            <div class="button-group">
                <button class="btn btn-run" onclick="runUuidGen()">Generate</button>
            </div>
            ${createOutput('uuidOutput', 'UUIDs')}
        </div>

        <div class="tab-content" id="uuidAnalyze">
            <label>UUID to Analyze</label>
            <input type="text" id="uuidInput"
                placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000">
            <div class="button-group">
                <button class="btn btn-run" onclick="runUuidAnalyze()">Analyze</button>
            </div>
            ${createOutput('uuidAnalyzeOutput', 'UUID Info')}
        </div>
    </div>`;
}

function generateUuidV4(){
    const bytes = getRandomBytes(16);
    let index = 0;
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = bytes[index++] % 16;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function runUuidGen(){
    const count   = parseInt(document.getElementById('uuidCount').value) || 5;
    const version = document.getElementById('uuidVersion').value;
    const uuids   = [];
    for(let i = 0; i < count; i++){
        uuids.push(version === 'nil'
            ? '00000000-0000-0000-0000-000000000000'
            : generateUuidV4()
        );
    }
    const html = uuids.map(u => `
    <div style="display:flex; gap:10px; align-items:center; padding:8px;
                background:var(--panel-light); border-radius:6px; margin-bottom:4px;">
        <span style="font-family:var(--font-mono); flex:1; font-size:13px;">${u}</span>
        <button class="output-action-btn" onclick="copyText('${u}', this)">Copy</button>
    </div>`).join('');
    setOutput('uuidOutput', html + `
    <div style="margin-top:8px;">
        <button class="btn btn-outline btn-sm" onclick="copyText('${uuids.join('\\n')}')">Copy All
        </button>
    </div>`, true);
}

function runUuidAnalyze(){
    const uuid = document.getElementById('uuidInput').value.trim().toLowerCase();
    if(!uuid){ showToast('Enter a UUID', 'error'); return; }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
    if(!uuidRegex.test(uuid)){
        setOutput('uuidAnalyzeOutput', 'Invalid UUID format');
        return;
    }

    const version = parseInt(uuid[14]);
    const variant = uuid[19];
    const variantStr = ['0','1','2','3','4','5','6','7'].includes(variant) ? 'NCS'
        : ['8','9','a','b'].includes(variant) ? 'RFC 4122 (standard)'
        : ['c','d'].includes(variant) ? 'Microsoft'
        : 'Reserved';

    const parts = uuid.split('-');
    const fields = [
        ['UUID',         uuid],
        ['Version',      `v${version}`],
        ['Variant',      variantStr],
        ['Time Low',     parts[0]],
        ['Time Mid',     parts[1]],
        ['Time Hi+Ver',  parts[2]],
        ['Clock Seq',    parts[3]],
        ['Node',         parts[4]],
        ['URN Format',   `urn:uuid:${uuid}`],
        ['No Hyphens',   uuid.replace(/-/g,'')],
    ];

    const html = fields.map(([k,v]) => `
    <div style="display:flex; gap:12px; padding:7px; background:var(--panel-light);
                border-radius:6px; margin-bottom:3px;">
        <span style="color:var(--primary); min-width:130px; font-size:13px;">${k}</span>
        <span style="color:var(--text); font-family:var(--font-mono); font-size:13px;">${v}</span>
    </div>`).join('');

    setOutput('uuidAnalyzeOutput', html, true);
}
