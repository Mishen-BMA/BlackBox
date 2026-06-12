// =========================
// PLAYFAIR CIPHER
// =========================

function buildPlayfairCipher(panel){
    panel.innerHTML = `
    ${toolHeader('', 'Playfair Cipher', 'Classic digraph substitution cipher')}
    <div class="tool-wrap">
        <div class="tool-title">Playfair Cipher</div>
        <label>Text</label>
        <textarea id="pfText" placeholder="Enter text..."></textarea>
        <label>Key</label>
        <input type="text" id="pfKey" placeholder="Enter keyword, e.g. MONARCHY">
        <div class="button-group">
            <button class="btn btn-run" onclick="runPlayfair('enc')">Encrypt</button>
            <button class="btn btn-run" onclick="runPlayfair('dec')">Decrypt</button>
            <button class="btn btn-outline" onclick="clearPlayfair()">Clear</button>
        </div>
        <div id="pfGrid" style="margin:12px 0;"></div>
        ${createOutput('pfOutput', 'Playfair Output')}
    </div>`;
}

function buildPlayfairMatrix(key){
    const cleanKey = String(key || '').toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '');
    const seen = new Set();
    const matrix = [];
    for(const char of cleanKey + 'ABCDEFGHIKLMNOPQRSTUVWXYZ'){
        if(!seen.has(char)){
            seen.add(char);
            matrix.push(char);
        }
    }
    return matrix;
}

function playfairPos(matrix, char){
    const index = matrix.indexOf(char);
    return [Math.floor(index / 5), index % 5];
}

function preparePlayfairText(text, mode){
    const clean = String(text || '').toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '');
    if(mode === 'dec') return clean.length % 2 === 0 ? clean : clean + 'X';

    let prepared = '';
    for(let i = 0; i < clean.length;){
        const a = clean[i];
        const b = clean[i + 1] || 'X';
        if(a === b){
            prepared += a + 'X';
            i++;
        } else {
            prepared += a + b;
            i += 2;
        }
    }
    return prepared.length % 2 === 0 ? prepared : prepared + 'X';
}

function renderPlayfairGrid(matrix){
    return `
    <div style="display:inline-grid; grid-template-columns:repeat(5,36px); gap:3px;">
        ${matrix.map(char => `
        <div style="background:var(--panel-light); border:1px solid var(--border);
                    border-radius:4px; text-align:center; padding:6px;
                    font-family:var(--font-mono); color:var(--primary); font-weight:700;">
            ${char}
        </div>`).join('')}
    </div>`;
}

function runPlayfair(mode){
    const text = document.getElementById('pfText').value;
    const key = document.getElementById('pfKey').value;
    if(!text){ showToast('Enter text', 'error'); return; }
    if(!key){ showToast('Enter key', 'error'); return; }

    const matrix = buildPlayfairMatrix(key);
    document.getElementById('pfGrid').innerHTML = renderPlayfairGrid(matrix);

    const prepared = preparePlayfairText(text, mode);
    let result = '';
    for(let i = 0; i < prepared.length; i += 2){
        const a = prepared[i];
        const b = prepared[i + 1];
        const [ar, ac] = playfairPos(matrix, a);
        const [br, bc] = playfairPos(matrix, b);
        const delta = mode === 'enc' ? 1 : 4;

        if(ar === br){
            result += matrix[ar * 5 + ((ac + delta) % 5)] + matrix[br * 5 + ((bc + delta) % 5)];
        } else if(ac === bc){
            result += matrix[((ar + delta) % 5) * 5 + ac] + matrix[((br + delta) % 5) * 5 + bc];
        } else {
            result += matrix[ar * 5 + bc] + matrix[br * 5 + ac];
        }
    }
    setOutput('pfOutput', result);
}

function clearPlayfair(){
    document.getElementById('pfText').value = '';
    document.getElementById('pfKey').value = '';
    document.getElementById('pfGrid').innerHTML = '';
    const out = document.getElementById('pfOutput');
    if(out) out.innerHTML = TOOL_PLACEHOLDER;
}

// =========================
// AFFINE CIPHER
// =========================

function buildAffineCipher(panel){
    panel.innerHTML = `
    ${toolHeader('', 'Affine Cipher', 'Mathematical substitution: E(x) = (a*x + b) mod 26')}
    <div class="tool-wrap">
        <div class="tool-title">Affine Cipher</div>
        <div class="info-box">Key a must be coprime with 26. Valid values: 1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25.</div>
        <div class="tabs">
            <button class="tab-btn active" onclick="switchTab(this,'affineManual')">Encrypt / Decrypt</button>
            <button class="tab-btn" onclick="switchTab(this,'affineBrute')">Brute Force</button>
        </div>
        <div class="tab-content active" id="affineManual">
            <label>Text</label>
            <textarea id="affText" placeholder="Enter text..."></textarea>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                <div>
                    <label>Key a</label>
                    <select id="affA">${[1,3,5,7,9,11,15,17,19,21,23,25].map(n => `<option value="${n}">${n}</option>`).join('')}</select>
                </div>
                <div>
                    <label>Key b (0-25)</label>
                    <input type="number" id="affB" value="0" min="0" max="25">
                </div>
            </div>
            <div class="button-group">
                <button class="btn btn-run" onclick="runAffine('enc')">Encrypt</button>
                <button class="btn btn-run" onclick="runAffine('dec')">Decrypt</button>
                <button class="btn btn-outline" onclick="clearAffine()">Clear</button>
            </div>
            ${createOutput('affOutput', 'Affine Output')}
        </div>
        <div class="tab-content" id="affineBrute">
            <label>Ciphertext</label>
            <textarea id="affBruteInput" placeholder="Enter ciphertext..."></textarea>
            <div class="button-group">
                <button class="btn btn-run" onclick="runAffineBrute()">Brute Force All Keys</button>
            </div>
            ${createOutput('affBruteOutput', 'All Decryptions')}
        </div>
    </div>`;
}

function modInverse(a, m){
    a = ((a % m) + m) % m;
    for(let x = 1; x < m; x++){
        if((a * x) % m === 1) return x;
    }
    return -1;
}

function runAffine(mode){
    const text = document.getElementById('affText').value;
    const a = parseInt(document.getElementById('affA').value, 10);
    const b = parseInt(document.getElementById('affB').value, 10) || 0;
    if(!text){ showToast('Enter text', 'error'); return; }

    const inverse = modInverse(a, 26);
    if(inverse === -1){ showToast('Key a is not coprime with 26', 'error'); return; }

    const result = text.split('').map(char => {
        const code = char.charCodeAt(0);
        const base = char >= 'A' && char <= 'Z' ? 65 : char >= 'a' && char <= 'z' ? 97 : null;
        if(base === null) return char;
        const x = code - base;
        const next = mode === 'enc' ? (a * x + b) % 26 : (inverse * (x - b + 26)) % 26;
        return String.fromCharCode(next + base);
    }).join('');
    setOutput('affOutput', result);
}

function runAffineBrute(){
    const text = document.getElementById('affBruteInput').value;
    if(!text){ showToast('Enter ciphertext', 'error'); return; }

    const validA = [1,3,5,7,9,11,15,17,19,21,23,25];
    const rows = [];
    for(const a of validA){
        const inverse = modInverse(a, 26);
        for(let b = 0; b < 26; b++){
            const dec = text.split('').map(char => {
                const base = char >= 'A' && char <= 'Z' ? 65 : char >= 'a' && char <= 'z' ? 97 : null;
                if(base === null) return char;
                const x = char.charCodeAt(0) - base;
                return String.fromCharCode(((inverse * (x - b + 26)) % 26) + base);
            }).join('');
            rows.push({ a, b, dec });
        }
    }

    const html = rows.map(row => `
    <div style="display:flex; gap:12px; padding:7px; background:var(--panel-light);
                border-radius:6px; margin-bottom:3px; font-size:13px;">
        <span style="color:var(--primary); min-width:80px; font-family:var(--font-mono);">a=${row.a}, b=${row.b}</span>
        <span style="word-break:break-word; font-family:var(--font-mono); flex:1;">${escapeHtml(row.dec)}</span>
        <button class="output-action-btn" onclick="copyText('${row.dec.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}', this)">Copy</button>
    </div>`).join('');
    setOutput('affBruteOutput', html, true);
}

function clearAffine(){
    document.getElementById('affText').value = '';
    const out = document.getElementById('affOutput');
    if(out) out.innerHTML = TOOL_PLACEHOLDER;
}

// =========================
// BACON CIPHER
// =========================

const BACON_MAP = {
    A:'AAAAA', B:'AAAAB', C:'AAABA', D:'AAABB', E:'AABAA',
    F:'AABAB', G:'AABBA', H:'AABBB', I:'ABAAA', J:'ABAAA',
    K:'ABAAB', L:'ABABA', M:'ABABB', N:'ABBAA', O:'ABBAB',
    P:'ABBBA', Q:'ABBBB', R:'BAAAA', S:'BAAAB', T:'BAABA',
    U:'BAABB', V:'BAABB', W:'BABAA', X:'BABAB', Y:'BABBA', Z:'BABBB',
};
const BACON_REVERSE = Object.fromEntries(Object.entries(BACON_MAP).map(([key, value]) => [value, key]));

function buildBaconCipher(panel){
    panel.innerHTML = `
    ${toolHeader('', 'Bacon Cipher', 'A/B binary substitution cipher')}
    <div class="tool-wrap">
        <div class="tool-title">Bacon Cipher</div>
        <div class="tabs">
            <button class="tab-btn active" onclick="switchTab(this,'baconEnc')">Text To Bacon</button>
            <button class="tab-btn" onclick="switchTab(this,'baconDec')">Bacon To Text</button>
        </div>
        <div class="tab-content active" id="baconEnc">
            <label>Plaintext</label>
            <textarea id="baconEncInput" placeholder="Enter text..."></textarea>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                <div><label>Character for A</label><input type="text" id="baconCharA" value="A" maxlength="1"></div>
                <div><label>Character for B</label><input type="text" id="baconCharB" value="B" maxlength="1"></div>
            </div>
            <div class="button-group">
                <button class="btn btn-run" onclick="runBaconEncode()">Encode</button>
                <button class="btn btn-outline" onclick="clearBacon()">Clear</button>
            </div>
            ${createOutput('baconEncOutput', 'Bacon Encoded')}
        </div>
        <div class="tab-content" id="baconDec">
            <label>Bacon Cipher</label>
            <textarea id="baconDecInput" placeholder="AAAAA AAAAB AAABA..."></textarea>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                <div><label>Character for A</label><input type="text" id="baconCharA2" value="A" maxlength="1"></div>
                <div><label>Character for B</label><input type="text" id="baconCharB2" value="B" maxlength="1"></div>
            </div>
            <div class="button-group">
                <button class="btn btn-run" onclick="runBaconDecode()">Decode</button>
                <button class="btn btn-outline" onclick="clearBaconDec()">Clear</button>
            </div>
            ${createOutput('baconDecOutput', 'Decoded Text')}
        </div>
    </div>`;
}

function runBaconEncode(){
    const text = document.getElementById('baconEncInput').value.toUpperCase().replace(/[^A-Z]/g, '');
    const charA = document.getElementById('baconCharA').value || 'A';
    const charB = document.getElementById('baconCharB').value || 'B';
    if(!text){ showToast('Enter text', 'error'); return; }
    const result = text.split('').map(char => BACON_MAP[char].replace(/A/g, charA).replace(/B/g, charB)).join(' ');
    setOutput('baconEncOutput', result);
}

function runBaconDecode(){
    const input = document.getElementById('baconDecInput').value.trim();
    const charA = document.getElementById('baconCharA2').value || 'A';
    const charB = document.getElementById('baconCharB2').value || 'B';
    if(!input){ showToast('Enter Bacon cipher', 'error'); return; }
    const result = input.split(/\s+/).map(group => {
        const normalized = group.split('').map(char => char === charA ? 'A' : char === charB ? 'B' : char).join('');
        return BACON_REVERSE[normalized] || '?';
    }).join('');
    setOutput('baconDecOutput', result);
}

function clearBacon(){
    document.getElementById('baconEncInput').value = '';
    const out = document.getElementById('baconEncOutput');
    if(out) out.innerHTML = TOOL_PLACEHOLDER;
}

function clearBaconDec(){
    document.getElementById('baconDecInput').value = '';
    const out = document.getElementById('baconDecOutput');
    if(out) out.innerHTML = TOOL_PLACEHOLDER;
}

// =========================
// POLYBIUS SQUARE
// =========================

const POLYBIUS = [
    ['A','B','C','D','E'],
    ['F','G','H','I','K'],
    ['L','M','N','O','P'],
    ['Q','R','S','T','U'],
    ['V','W','X','Y','Z'],
];

function buildPolybiusSquare(panel){
    panel.innerHTML = `
    ${toolHeader('', 'Polybius Square', 'Grid-based cipher that encodes letters as coordinate pairs')}
    <div class="tool-wrap">
        <div class="tool-title">Polybius Square</div>
        <div class="tabs">
            <button class="tab-btn active" onclick="switchTab(this,'polyEnc')">Encode</button>
            <button class="tab-btn" onclick="switchTab(this,'polyDec')">Decode</button>
            <button class="tab-btn" onclick="switchTab(this,'polyTap')">Tap Code</button>
        </div>
        <div class="tab-content active" id="polyEnc">
            <div style="margin-bottom:12px;">${buildPolybiusGrid()}</div>
            <label>Plaintext</label>
            <textarea id="polyEncInput" placeholder="Enter text..."></textarea>
            <div class="button-group">
                <button class="btn btn-run" onclick="runPolybiusEncode()">Encode</button>
                <button class="btn btn-outline" onclick="clearPolybius()">Clear</button>
            </div>
            ${createOutput('polyEncOutput', 'Encoded Pairs')}
        </div>
        <div class="tab-content" id="polyDec">
            <label>Number Pairs</label>
            <textarea id="polyDecInput" placeholder="e.g. 23 15 31 31 34"></textarea>
            <div class="button-group">
                <button class="btn btn-run" onclick="runPolybiusDecode()">Decode</button>
                <button class="btn btn-outline" onclick="clearPolybiusDec()">Clear</button>
            </div>
            ${createOutput('polyDecOutput', 'Decoded Text')}
        </div>
        <div class="tab-content" id="polyTap">
            <label>Tap Code Input</label>
            <textarea id="tapInput" placeholder="Text for encode, or pairs like 1 1  1 2 for decode"></textarea>
            <div class="button-group">
                <button class="btn btn-run" onclick="runTapCode('enc')">Encode Tap Code</button>
                <button class="btn btn-run" onclick="runTapCode('dec')">Decode Tap Code</button>
            </div>
            ${createOutput('tapOutput', 'Tap Code')}
        </div>
    </div>`;
}

function buildPolybiusGrid(){
    let html = '<div style="display:inline-grid; grid-template-columns:repeat(6,36px); gap:2px;">';
    html += '<div></div>';
    for(let col = 1; col <= 5; col++) html += `<div style="text-align:center; color:var(--primary); font-weight:700; font-size:12px; padding:4px;">${col}</div>`;
    for(let row = 0; row < 5; row++){
        html += `<div style="color:var(--primary); font-weight:700; font-size:12px; padding:4px; text-align:center;">${row + 1}</div>`;
        for(let col = 0; col < 5; col++){
            html += `<div style="background:var(--panel-light); border:1px solid var(--border); border-radius:4px;
                         text-align:center; padding:5px; font-family:var(--font-mono); font-size:13px;">${POLYBIUS[row][col]}</div>`;
        }
    }
    return html + '</div>';
}

function runPolybiusEncode(){
    const text = document.getElementById('polyEncInput').value.toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '');
    if(!text){ showToast('Enter text', 'error'); return; }
    const result = text.split('').map(char => {
        for(let row = 0; row < 5; row++){
            for(let col = 0; col < 5; col++){
                if(POLYBIUS[row][col] === char) return `${row + 1}${col + 1}`;
            }
        }
        return '??';
    }).join(' ');
    setOutput('polyEncOutput', result);
}

function runPolybiusDecode(){
    const input = document.getElementById('polyDecInput').value.trim();
    if(!input){ showToast('Enter number pairs', 'error'); return; }
    const pairs = input.replace(/\s+/g, '').match(/.{1,2}/g) || [];
    const result = pairs.map(pair => {
        const row = parseInt(pair[0], 10) - 1;
        const col = parseInt(pair[1], 10) - 1;
        return row >= 0 && row < 5 && col >= 0 && col < 5 ? POLYBIUS[row][col] : '?';
    }).join('');
    setOutput('polyDecOutput', result);
}

function runTapCode(mode){
    const input = document.getElementById('tapInput').value.trim();
    if(!input){ showToast('Enter input', 'error'); return; }

    if(mode === 'enc'){
        document.getElementById('polyEncInput').value = input;
        runPolybiusEncode();
        setOutput('tapOutput', getOutputText('polyEncOutput').replace(/(\d)(\d)/g, '$1 $2'));
        return;
    }

    const result = input.split(/\s{2,}|\n/).map(pair => {
        const [rowRaw, colRaw] = pair.trim().split(/\s+/);
        const row = parseInt(rowRaw, 10) - 1;
        const col = parseInt(colRaw, 10) - 1;
        return row >= 0 && row < 5 && col >= 0 && col < 5 ? POLYBIUS[row][col] : '?';
    }).join('');
    setOutput('tapOutput', result);
}

function clearPolybius(){
    document.getElementById('polyEncInput').value = '';
    const out = document.getElementById('polyEncOutput');
    if(out) out.innerHTML = TOOL_PLACEHOLDER;
}

function clearPolybiusDec(){
    document.getElementById('polyDecInput').value = '';
    const out = document.getElementById('polyDecOutput');
    if(out) out.innerHTML = TOOL_PLACEHOLDER;
}

// =========================
// NUMBER THEORY
// =========================

function buildNumberTheory(panel){
    panel.innerHTML = `
    ${toolHeader('', 'Number Theory', 'GCD, LCM, modular inverse, primality, factorization and Euler totient')}
    <div class="tool-wrap">
        <div class="tool-title">Number Theory Toolkit</div>
        <div class="tabs">
            <button class="tab-btn active" onclick="switchTab(this,'ntBasic')">GCD / LCM</button>
            <button class="tab-btn" onclick="switchTab(this,'ntModular')">Modular Arithmetic</button>
            <button class="tab-btn" onclick="switchTab(this,'ntPrime')">Primality</button>
            <button class="tab-btn" onclick="switchTab(this,'ntTotient')">Euler Totient</button>
        </div>
        <div class="tab-content active" id="ntBasic">
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                <div><label>Number A</label><input type="text" id="ntA" placeholder="e.g. 48"></div>
                <div><label>Number B</label><input type="text" id="ntB" placeholder="e.g. 18"></div>
            </div>
            <div class="button-group"><button class="btn btn-run" onclick="runGcdLcm()">Calculate</button></div>
            ${createOutput('ntBasicOutput', 'Result')}
        </div>
        <div class="tab-content" id="ntModular">
            <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px;">
                <div><label>Base (a)</label><input type="text" id="ntBase" placeholder="e.g. 5"></div>
                <div><label>Exponent (e)</label><input type="text" id="ntExp" placeholder="e.g. 3"></div>
                <div><label>Modulus (m)</label><input type="text" id="ntMod" placeholder="e.g. 13"></div>
            </div>
            <div class="button-group"><button class="btn btn-run" onclick="runModArith()">Calculate All</button></div>
            ${createOutput('ntModOutput', 'Result')}
        </div>
        <div class="tab-content" id="ntPrime">
            <label>Number to Test</label>
            <input type="text" id="ntPrimeInput" placeholder="e.g. 9973">
            <div class="button-group">
                <button class="btn btn-run" onclick="runPrimality()">Test Primality</button>
                <button class="btn btn-run" onclick="runFactorize()">Factorize</button>
                <button class="btn btn-run" onclick="runPrimesUpTo()">Primes Up To N</button>
            </div>
            ${createOutput('ntPrimeOutput', 'Result')}
        </div>
        <div class="tab-content" id="ntTotient">
            <label>Number n</label>
            <input type="text" id="ntTotientInput" placeholder="e.g. 3233">
            <div class="button-group"><button class="btn btn-run" onclick="runTotient()">Calculate phi(n)</button></div>
            ${createOutput('ntTotientOutput', 'Result')}
        </div>
    </div>`;
}

function gcdBig(a, b){
    a = a < 0n ? -a : a;
    b = b < 0n ? -b : b;
    return b === 0n ? a : gcdBig(b, a % b);
}

function lcmBig(a, b){
    return (a * b) / gcdBig(a, b);
}

function runGcdLcm(){
    const a = BigInt(document.getElementById('ntA').value.trim() || 0);
    const b = BigInt(document.getElementById('ntB').value.trim() || 0);
    if(a === 0n || b === 0n){ showToast('Enter both numbers', 'error'); return; }
    const g = gcdBig(a, b);
    const l = lcmBig(a < 0n ? -a : a, b < 0n ? -b : b);
    const inverse = modInverse(Number(a), Number(b));
    setOutput('ntBasicOutput',
        `GCD(${a}, ${b}) = ${g}\n` +
        `LCM(${a}, ${b}) = ${l}\n\n` +
        `Modular inverse of A mod B: ${inverse === -1 ? 'does not exist' : inverse}`
    );
}

function modPowBig(base, exp, mod){
    let result = 1n;
    base %= mod;
    while(exp > 0n){
        if(exp % 2n === 1n) result = (result * base) % mod;
        exp /= 2n;
        base = (base * base) % mod;
    }
    return result;
}

function runModArith(){
    const a = BigInt(document.getElementById('ntBase').value.trim() || 0);
    const e = BigInt(document.getElementById('ntExp').value.trim() || 1);
    const m = BigInt(document.getElementById('ntMod').value.trim() || 0);
    if(m === 0n){ showToast('Enter a non-zero modulus', 'error'); return; }
    const inverse = modInverse(Number(a), Number(m));
    setOutput('ntModOutput',
        `a mod m = ${a % m}\n` +
        `a^e mod m = ${modPowBig(a, e, m)}\n` +
        `Modular inverse = ${inverse === -1 ? 'does not exist' : inverse}\n\n` +
        `(a + e) mod m = ${(a + e) % m}\n` +
        `(a - e) mod m = ${((a - e) % m + m) % m}\n` +
        `(a * e) mod m = ${(a * e) % m}`
    );
}

function isPrimeBig(n){
    if(n < 2n) return false;
    for(let i = 2n; i * i <= n; i++){
        if(n % i === 0n) return false;
    }
    return true;
}

function runPrimality(){
    const n = BigInt(document.getElementById('ntPrimeInput').value.trim() || 0);
    if(n < 2n){ setOutput('ntPrimeOutput', 'Number must be at least 2'); return; }
    setOutput('ntPrimeOutput', `${n} is ${isPrimeBig(n) ? 'prime' : 'not prime'}.`);
}

function runFactorize(){
    let n = BigInt(document.getElementById('ntPrimeInput').value.trim() || 0);
    if(n < 2n){ setOutput('ntPrimeOutput', 'Number must be at least 2'); return; }
    const original = n;
    const factors = [];
    for(let i = 2n; i * i <= n && i < 1000000n; i++){
        while(n % i === 0n){
            factors.push(i);
            n /= i;
        }
    }
    if(n > 1n) factors.push(n);
    setOutput('ntPrimeOutput', `${original} = ${factors.join(' * ')}\nPrime factors: ${[...new Set(factors)].join(', ')}`);
}

function runPrimesUpTo(){
    const n = parseInt(document.getElementById('ntPrimeInput').value.trim() || 100, 10);
    if(n > 10000){ showToast('Keep N under 10000', 'error'); return; }
    const sieve = new Array(n + 1).fill(true);
    sieve[0] = sieve[1] = false;
    for(let i = 2; i * i <= n; i++){
        if(sieve[i]){
            for(let j = i * i; j <= n; j += i) sieve[j] = false;
        }
    }
    const primes = sieve.map((isPrime, index) => isPrime ? index : null).filter(Boolean);
    setOutput('ntPrimeOutput', `Primes up to ${n} (${primes.length} found):\n\n${primes.join(', ')}`);
}

function runTotient(){
    let n = parseInt(document.getElementById('ntTotientInput').value.trim() || 0, 10);
    if(!n || n < 1){ showToast('Enter a positive integer', 'error'); return; }
    const original = n;
    let result = n;
    for(let p = 2; p * p <= n; p++){
        if(n % p === 0){
            while(n % p === 0) n /= p;
            result -= result / p;
        }
    }
    if(n > 1) result -= result / n;
    setOutput('ntTotientOutput', `phi(${original}) = ${result}\n\n${result} integers from 1 to ${original} are coprime with ${original}.`);
}
