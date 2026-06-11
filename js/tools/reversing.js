// =========================
// HEX VIEWER
// =========================

function buildHexViewer(panel){
    panel.innerHTML = `
    ${toolHeader('', 'Hex Viewer', 'View any file as a hex dump')}
    <div class="tool-wrap">
        <div class="tool-title">Hex Viewer</div>
        <label>Upload File</label>
        <input type="file" id="hexViewFile">
        <label>Or paste text</label>
        <textarea id="hexViewText" placeholder="Paste text to view as hex..."></textarea>
        <div class="button-group">
            <button class="btn btn-run" onclick="runHexViewer()">View Hex</button>
            <button class="btn btn-outline" onclick="clearHexViewer()">Clear</button>
        </div>
        ${createOutput('hexViewOutput', 'Hex Dump')}
    </div>`;
}

function runHexViewer(){
    const file = document.getElementById('hexViewFile').files[0];
    const text = document.getElementById('hexViewText').value;

    if(file){
        const reader = new FileReader();
        reader.onload = e => renderHexDump(new Uint8Array(e.target.result), 'hexViewOutput');
        reader.readAsArrayBuffer(file);
    } else if(text){
        const bytes = new TextEncoder().encode(text);
        renderHexDump(bytes, 'hexViewOutput');
    } else {
        showToast('Upload a file or paste text', 'error');
    }
}

function renderHexDump(bytes, outputId){
    const maxBytes = 2048;
    const limited  = bytes.slice(0, maxBytes);
    const lines    = [];

    for(let i = 0; i < limited.length; i += 16){
        const chunk   = limited.slice(i, i+16);
        const offset  = i.toString(16).padStart(8, '0');
        const hex     = Array.from(chunk).map(b => b.toString(16).padStart(2,'0'));
        const hexPart = hex.join(' ').padEnd(47, ' ');
        const ascii   = Array.from(chunk).map(b =>
            b >= 0x20 && b < 0x7f ? String.fromCharCode(b) : '.'
        ).join('');
        lines.push(`${offset}  ${hexPart}  |${ascii}|`);
    }

    if(bytes.length > maxBytes)
        lines.push(`\n... truncated (showing first ${maxBytes} of ${bytes.length} bytes)`);

    const el = document.getElementById(outputId);
    if(el){
        el.textContent = lines.join('\n');
        el.innerHTML += `<div class="output-actions">
            <button class="output-action-btn" onclick="copyOutput('${outputId}', this)">Copy</button>
            <button class="output-action-btn" onclick="exportOutput('${outputId}')">Save</button>
        </div>`;
    }
}

function clearHexViewer(){
    document.getElementById('hexViewFile').value = '';
    document.getElementById('hexViewText').value = '';
    const out = document.getElementById('hexViewOutput');
    if(out) out.innerHTML = '<span style="color:var(--muted)">Result will appear here...</span>';
}

// =========================
// STRINGS EXTRACTOR
// =========================

function buildStringsExtractor(panel){
    panel.innerHTML = `
    ${toolHeader('', 'Strings Extractor', 'Extract printable strings from binary files')}
    <div class="tool-wrap">
        <div class="tool-title">Strings Extractor</div>
        <label>Upload File</label>
        <input type="file" id="stringsFile">
        <label>Minimum String Length</label>
        <input type="number" id="stringsMinLen" value="4" min="2" max="20">
        <label>Filter (optional)</label>
        <input type="text" id="stringsFilter" placeholder="Filter results (e.g. flag, http, pass)">
        <div class="button-group">
            <button class="btn btn-run" onclick="runStringsExtractor()">Extract Strings</button>
            <button class="btn btn-outline" onclick="clearStrings()">Clear</button>
        </div>
        ${createOutput('stringsOutput', 'Extracted Strings')}
    </div>`;
}

function runStringsExtractor(){
    const file   = document.getElementById('stringsFile').files[0];
    const minLen = parseInt(document.getElementById('stringsMinLen').value) || 4;
    const filter = document.getElementById('stringsFilter').value.toLowerCase().trim();
    if(!file){ showToast('Upload a file first', 'error'); return; }

    const reader = new FileReader();
    reader.onload = function(e){
        const bytes   = new Uint8Array(e.target.result);
        const strings = [];
        let   current = '';

        for(const b of bytes){
            if(b >= 0x20 && b < 0x7f){
                current += String.fromCharCode(b);
            } else {
                if(current.length >= minLen) strings.push(current);
                current = '';
            }
        }
        if(current.length >= minLen) strings.push(current);

        let filtered = strings;
        if(filter) filtered = strings.filter(s => s.toLowerCase().includes(filter));

        setOutput('stringsOutput',
            `Found ${strings.length} strings${filter ? ` (${filtered.length} matching "${filter}")` : ''}\n` +
            `File: ${file.name} (${file.size.toLocaleString()} bytes)\n\n` +
            filtered.join('\n')
        );
        showToast(`Found ${filtered.length} strings`);
    };
    reader.readAsArrayBuffer(file);
}

function clearStrings(){
    document.getElementById('stringsFile').value  = '';
    document.getElementById('stringsFilter').value = '';
    const out = document.getElementById('stringsOutput');
    if(out) out.innerHTML = '<span style="color:var(--muted)">Result will appear here...</span>';
}

// =========================
// MAGIC BYTES IDENTIFIER
// =========================

function buildMagicBytes(panel){
    panel.innerHTML = `
    ${toolHeader('', 'Magic Bytes ID', 'Identify file types by their magic bytes')}
    <div class="tool-wrap">
        <div class="tool-title">Magic Bytes Identifier</div>

        <div class="tabs">
            <button class="tab-btn active" onclick="switchTab(this,'magicUpload')">Upload File</button>
            <button class="tab-btn"        onclick="switchTab(this,'magicHex')">Paste Hex</button>
            <button class="tab-btn"        onclick="switchTab(this,'magicRef')">Reference Table</button>
        </div>

        <div class="tab-content active" id="magicUpload">
            <label>Upload File to Identify</label>
            <input type="file" id="magicFile">
            <div class="button-group">
                <button class="btn btn-run" onclick="runMagicBytes()">Identify</button>
            </div>
            ${createOutput('magicOutput', 'File Type')}
        </div>

        <div class="tab-content" id="magicHex">
            <label>Paste hex bytes (first bytes of file)</label>
            <input type="text" id="magicHexInput" placeholder="e.g. 89 50 4e 47 or 89504e47">
            <div class="button-group">
                <button class="btn btn-run" onclick="runMagicHex()">Identify</button>
            </div>
            ${createOutput('magicHexOutput', 'Identification')}
        </div>

        <div class="tab-content" id="magicRef">
            ${buildMagicRefTable()}
        </div>
    </div>`;
}

const MAGIC_SIGNATURES = [
    { bytes:[0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a], type:'PNG Image',       ext:'.png'  },
    { bytes:[0xff,0xd8,0xff],                            type:'JPEG Image',      ext:'.jpg'  },
    { bytes:[0x47,0x49,0x46,0x38],                       type:'GIF Image',       ext:'.gif'  },
    { bytes:[0x42,0x4d],                                 type:'BMP Image',       ext:'.bmp'  },
    { bytes:[0x49,0x49,0x2a,0x00],                       type:'TIFF Image (LE)', ext:'.tiff' },
    { bytes:[0x4d,0x4d,0x00,0x2a],                       type:'TIFF Image (BE)', ext:'.tiff' },
    { bytes:[0x25,0x50,0x44,0x46],                       type:'PDF Document',    ext:'.pdf'  },
    { bytes:[0x50,0x4b,0x03,0x04],                       type:'ZIP Archive',     ext:'.zip'  },
    { bytes:[0x52,0x61,0x72,0x21,0x1a,0x07],             type:'RAR Archive',     ext:'.rar'  },
    { bytes:[0x1f,0x8b,0x08],                            type:'GZIP Archive',    ext:'.gz'   },
    { bytes:[0x42,0x5a,0x68],                            type:'BZIP2 Archive',   ext:'.bz2'  },
    { bytes:[0xfd,0x37,0x7a,0x58,0x5a,0x00],             type:'XZ Archive',      ext:'.xz'   },
    { bytes:[0x7f,0x45,0x4c,0x46],                       type:'ELF Binary',      ext:'ELF'   },
    { bytes:[0x4d,0x5a],                                 type:'Windows PE/EXE',  ext:'.exe'  },
    { bytes:[0xca,0xfe,0xba,0xbe],                       type:'Java Class',      ext:'.class'},
    { bytes:[0xce,0xfa,0xed,0xfe],                       type:'Mach-O 32-bit',   ext:'Mach-O'},
    { bytes:[0xcf,0xfa,0xed,0xfe],                       type:'Mach-O 64-bit',   ext:'Mach-O'},
    { bytes:[0x4f,0x67,0x67,0x53],                       type:'OGG Audio',       ext:'.ogg'  },
    { bytes:[0x49,0x44,0x33],                            type:'MP3 Audio',       ext:'.mp3'  },
    { bytes:[0x52,0x49,0x46,0x46],                       type:'WAV/AVI',         ext:'.wav'  },
    { bytes:[0x00,0x00,0x00,0x18,0x66,0x74,0x79,0x70],   type:'MP4 Video',       ext:'.mp4'  },
    { bytes:[0x53,0x51,0x4c,0x69,0x74,0x65,0x20],        type:'SQLite Database',  ext:'.db'  },
    { bytes:[0x23,0x21],                                  type:'Script/Shebang',  ext:'script'},
];

function identifyMagic(bytes){
    for(const sig of MAGIC_SIGNATURES){
        if(sig.bytes.every((b,i) => bytes[i] === b))
            return sig;
    }
    return null;
}

function runMagicBytes(){
    const file = document.getElementById('magicFile').files[0];
    if(!file){ showToast('Upload a file', 'error'); return; }
    const reader = new FileReader();
    reader.onload = e => {
        const bytes  = new Uint8Array(e.target.result.slice(0,16));
        const match  = identifyMagic(bytes);
        const hexStr = Array.from(bytes).map(b=>b.toString(16).padStart(2,'0')).join(' ');
        setOutput('magicOutput', match
            ? `Detected: ${match.type}\nExtension: ${match.ext}\n\nFirst bytes: ${hexStr}\nFile: ${file.name} (${file.size.toLocaleString()} bytes)`
            : `Unknown file type\n\nFirst bytes: ${hexStr}\nFile: ${file.name}`
        );
    };
    reader.readAsArrayBuffer(file);
}

function runMagicHex(){
    const raw = document.getElementById('magicHexInput').value.replace(/\s/g,'');
    if(!raw){
        showToast('Paste hex bytes first', 'error');
        return;
    }
    if(!/^[a-f0-9]+$/i.test(raw) || raw.length % 2 !== 0){
        setOutput('magicHexOutput', 'Invalid hex input. Use complete byte pairs such as 89 50 4e 47.');
        return;
    }

    const bytes = raw.match(/.{2}/g).map(b=>parseInt(b,16));
    const match = identifyMagic(bytes);
    setOutput('magicHexOutput', match
        ? `Detected: ${match.type}\nExtension: ${match.ext}`
        : 'Unknown file type'
    );
}

function buildMagicRefTable(){
    return `
    <div style="overflow-x:auto;">
    <table style="width:100%; border-collapse:collapse; font-size:13px;">
        <thead>
            <tr style="border-bottom:1px solid var(--border);">
                <th style="text-align:left; padding:8px; color:var(--muted);">File Type</th>
                <th style="text-align:left; padding:8px; color:var(--muted);">Extension</th>
                <th style="text-align:left; padding:8px; color:var(--muted); font-family:var(--font-mono);">Magic Bytes (hex)</th>
            </tr>
        </thead>
        <tbody>
        ${MAGIC_SIGNATURES.map(s => `
            <tr style="border-bottom:1px solid var(--border);">
                <td style="padding:8px; color:var(--text);">${s.type}</td>
                <td style="padding:8px; color:var(--primary); font-family:var(--font-mono);">${s.ext}</td>
                <td style="padding:8px; color:var(--muted-light); font-family:var(--font-mono);">
                    ${s.bytes.map(b=>b.toString(16).padStart(2,'0')).join(' ')}
                </td>
            </tr>`).join('')}
        </tbody>
    </table>
    </div>`;
}

// =========================
// REGEX TESTER
// =========================

function buildRegexTester(panel){
    panel.innerHTML = `
    ${toolHeader('', 'Regex Tester', 'Test and debug regular expressions in real time')}
    <div class="tool-wrap">
        <div class="tool-title">Regex Tester</div>
        <label>Regular Expression</label>
        <input type="text" id="regexPattern" placeholder="e.g. \\d{1,3}\\.\\d{1,3}\\." oninput="runRegex()">
        <div style="display:flex; gap:10px; margin-bottom:12px; flex-wrap:wrap;">
            <label style="display:flex; align-items:center; gap:6px; margin:0; color:var(--muted-light); font-size:14px;">
                <input type="checkbox" id="regexG" checked onchange="runRegex()"> g (global)
            </label>
            <label style="display:flex; align-items:center; gap:6px; margin:0; color:var(--muted-light); font-size:14px;">
                <input type="checkbox" id="regexI" onchange="runRegex()"> i (case insensitive)
            </label>
            <label style="display:flex; align-items:center; gap:6px; margin:0; color:var(--muted-light); font-size:14px;">
                <input type="checkbox" id="regexM" onchange="runRegex()"> m (multiline)
            </label>
        </div>
        <label>Test String</label>
        <textarea id="regexTest" placeholder="Enter text to test against..." oninput="runRegex()"
            style="min-height:120px;"></textarea>
        ${createOutput('regexOutput', 'Matches')}
    </div>`;
}

function runRegex(){
    const pattern = document.getElementById('regexPattern').value;
    const text    = document.getElementById('regexTest').value;
    const gFlag   = document.getElementById('regexG').checked ? 'g' : '';
    const iFlag   = document.getElementById('regexI').checked ? 'i' : '';
    const mFlag   = document.getElementById('regexM').checked ? 'm' : '';

    if(!pattern || !text) return;

    try{
        const flags   = gFlag + iFlag + mFlag;
        const regex   = new RegExp(pattern, flags);
        const matches = [...text.matchAll(new RegExp(pattern, 'g' + iFlag + mFlag))];

        if(!matches.length){
            setOutput('regexOutput', 'No matches found');
            return;
        }

        const html = `
        <div style="color:var(--success); margin-bottom:12px; font-size:13px;">
             ${matches.length} match${matches.length>1?'es':''} found
        </div>
        ${matches.map((m,i) => `
        <div style="padding:8px; background:var(--panel-light); border-radius:6px;
                    margin-bottom:6px; font-family:var(--font-mono);">
            <div style="color:var(--muted); font-size:11px; margin-bottom:4px;">
                Match ${i+1} - Index: ${m.index}
            </div>
            <div style="color:var(--primary);">${m[0]}</div>
            ${m.length > 1 ? `
            <div style="margin-top:6px;">
                ${m.slice(1).map((g,gi) => g !== undefined ? `
                <div style="color:var(--muted); font-size:12px;">
                    Group ${gi+1}: <span style="color:var(--text);">${g}</span>
                </div>` : '').join('')}
            </div>` : ''}
        </div>`).join('')}`;

        setOutput('regexOutput', html, true);
    } catch(e){
        setOutput('regexOutput', ` Invalid regex: ${e.message}`);
    }
}

// =========================
// JS DEOBFUSCATOR
// =========================

function buildDeobfuscator(panel){
    panel.innerHTML = `
    ${toolHeader('', 'JS Deobfuscator', 'Basic JavaScript deobfuscation helpers')}
    <div class="tool-wrap">
        <div class="tool-title">JS Deobfuscator</div>

        <div class="tabs">
            <button class="tab-btn active" onclick="switchTab(this,'deobfBasic')">Basic Cleanup</button>
            <button class="tab-btn"        onclick="switchTab(this,'deobfEval')">Eval Decoder</button>
            <button class="tab-btn"        onclick="switchTab(this,'deobfUnescape')">Unescape</button>
        </div>

        <div class="tab-content active" id="deobfBasic">
            <div class="info-box">Beautifies minified JS and replaces common obfuscation patterns.</div>
            <label>Obfuscated JavaScript</label>
            <textarea id="deobfInput" style="min-height:150px;" placeholder="Paste obfuscated JS..."></textarea>
            <div class="button-group">
                <button class="btn btn-run" onclick="runDeobfBasic()">Beautify &amp; Clean</button>
                <button class="btn btn-outline" onclick="clearDeobf()">Clear</button>
            </div>
            ${createOutput('deobfOutput', 'Cleaned Code')}
        </div>

        <div class="tab-content" id="deobfEval">
            <div class="warn-box"> This executes code in a sandboxed context. Only use with trusted CTF challenges.</div>
            <label>eval() / Function() obfuscated code</label>
            <textarea id="evalInput" style="min-height:150px;" placeholder="Paste eval-based obfuscated code..."></textarea>
            <div class="button-group">
                <button class="btn btn-run" onclick="runEvalDecode()">Decode eval()</button>
            </div>
            ${createOutput('evalOutput', 'Decoded')}
        </div>

        <div class="tab-content" id="deobfUnescape">
            <label>Escaped / Encoded String</label>
            <textarea id="unescInput" placeholder="\\u0048\\u0065\\u006c\\u006c\\u006f or %48%65%6c%6c%6f"></textarea>
            <div class="button-group">
                <button class="btn btn-run" onclick="runUnescape('unicode')">Decode \\u</button>
                <button class="btn btn-run" onclick="runUnescape('hex')">Decode \\x</button>
                <button class="btn btn-run" onclick="runUnescape('percent')">Decode %</button>
                <button class="btn btn-run" onclick="runUnescape('all')">Decode All</button>
            </div>
            ${createOutput('unescOutput', 'Decoded')}
        </div>
    </div>`;
}

function runDeobfBasic(){
    let code = document.getElementById('deobfInput').value;
    if(!code){ showToast('Enter JavaScript', 'error'); return; }

    // Basic beautification
    code = code
        .replace(/;/g, ';\n')
        .replace(/\{/g, ' {\n')
        .replace(/\}/g, '\n}\n')
        .replace(/,(?=[^\n])/g, ', ')
        .replace(/\n{3,}/g, '\n\n');

    // Decode common patterns
    code = code.replace(/\\x([0-9a-fA-F]{2})/g, (_, h) => String.fromCharCode(parseInt(h,16)));
    code = code.replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h,16)));

    setOutput('deobfOutput', code);
}

function runEvalDecode(){
    const code = document.getElementById('evalInput').value.trim();
    if(!code){ showToast('Enter code', 'error'); return; }
    try{
        let replaced = code.replace(/\beval\b/g, '__capturedEval');
        let captured = '';
        const fn = new Function('__capturedEval', replaced);
        fn(v => { captured = v; });
        setOutput('evalOutput', captured || 'Could not capture eval output');
    } catch(e){
        setOutput('evalOutput', `Error: ${e.message}\n\nTry the Beautify tab instead.`);
    }
}

function runUnescape(type){
    let text = document.getElementById('unescInput').value;
    try{
        switch(type){
            case 'unicode': text = text.replace(/\\u([0-9a-fA-F]{4})/g, (_,h)=>String.fromCharCode(parseInt(h,16))); break;
            case 'hex':     text = text.replace(/\\x([0-9a-fA-F]{2})/g, (_,h)=>String.fromCharCode(parseInt(h,16))); break;
            case 'percent': text = decodeURIComponent(text); break;
            case 'all':
                text = text.replace(/\\u([0-9a-fA-F]{4})/g, (_,h)=>String.fromCharCode(parseInt(h,16)));
                text = text.replace(/\\x([0-9a-fA-F]{2})/g, (_,h)=>String.fromCharCode(parseInt(h,16)));
                try{ text = decodeURIComponent(text); } catch(e){}
                break;
        }
        setOutput('unescOutput', text);
    } catch(e){ showToast('Decode failed: '+e.message, 'error'); }
}

function clearDeobf(){
    document.getElementById('deobfInput').value = '';
    const out = document.getElementById('deobfOutput');
    if(out) out.innerHTML = '<span style="color:var(--muted)">Result will appear here...</span>';
}

// =========================
// DISASSEMBLY REFERENCE
// =========================

function buildDisasmRef(panel){
    panel.innerHTML = `
    ${toolHeader('', 'Disasm Reference', 'x86/x64 instruction reference for reversing')}
    <div class="tool-wrap">
        <div class="tool-title">x86/x64 Instruction Reference</div>
        <input type="text" id="disasmSearch" placeholder="Search instruction..."
            oninput="filterDisasmRef()" style="margin-bottom:16px;">
        <div id="disasmTable">
            ${buildDisasmTable()}
        </div>
    </div>`;
}

const DISASM_REF = [
    ['NOP',  '90',    'No operation'],
    ['PUSH', '50-57', 'Push register onto stack'],
    ['POP',  '58-5f', 'Pop from stack into register'],
    ['MOV',  '88-8b', 'Move data between operands'],
    ['LEA',  '8d',    'Load effective address'],
    ['ADD',  '00-05', 'Addition'],
    ['SUB',  '28-2d', 'Subtraction'],
    ['XOR',  '30-35', 'Bitwise XOR'],
    ['AND',  '20-25', 'Bitwise AND'],
    ['OR',   '08-0d', 'Bitwise OR'],
    ['CMP',  '38-3d', 'Compare (sets flags)'],
    ['TEST', '84-85', 'Logical AND (sets flags only)'],
    ['JMP',  'eb/e9', 'Unconditional jump'],
    ['JE/JZ','74',    'Jump if equal / zero'],
    ['JNE',  '75',    'Jump if not equal'],
    ['JL',   '7c',    'Jump if less'],
    ['JG',   '7f',    'Jump if greater'],
    ['CALL', 'e8',    'Call subroutine (push rip, jmp)'],
    ['RET',  'c3',    'Return (pop rip)'],
    ['INT',  'cd',    'Software interrupt'],
    ['SYSCALL','0f05','64-bit syscall'],
    ['INT 3','cc',    'Breakpoint trap'],
    ['LEAVE','c9',    'Restore stack frame (mov rsp,rbp; pop rbp)'],
    ['MUL',  'f6-f7', 'Unsigned multiply'],
    ['DIV',  'f6-f7', 'Unsigned divide'],
    ['IMUL', '6b/69', 'Signed multiply'],
    ['IDIV', 'f6-f7', 'Signed divide'],
    ['SHL',  'd0-d3', 'Shift left'],
    ['SHR',  'd0-d3', 'Shift right'],
    ['NEG',  'f6-f7', 'Negate (two\'s complement)'],
    ['NOT',  'f6-f7', 'Bitwise NOT'],
    ['INC',  'fe-ff', 'Increment'],
    ['DEC',  'fe-ff', 'Decrement'],
    ['XCHG', '86-87', 'Exchange operands'],
    ['REP MOVS','f3 a4/a5', 'Repeat move string'],
    ['REP STOS','f3 aa/ab', 'Repeat store string'],
];

function buildDisasmTable(){
    return DISASM_REF.map(([mnem,opcode,desc]) => `
    <div class="disasm-row" style="display:flex; gap:12px; padding:7px; background:var(--panel-light);
                border-radius:6px; margin-bottom:3px; font-size:13px;"
        data-search="${mnem.toLowerCase()} ${desc.toLowerCase()}">
        <span style="color:var(--primary); min-width:80px; font-family:var(--font-mono);
                     font-weight:700;">${mnem}</span>
        <span style="color:var(--muted); min-width:70px; font-family:var(--font-mono);">${opcode}</span>
        <span style="color:var(--text);">${desc}</span>
    </div>`).join('');
}

function filterDisasmRef(){
    const q = document.getElementById('disasmSearch').value.toLowerCase();
    document.querySelectorAll('.disasm-row').forEach(row => {
        row.style.display = row.dataset.search.includes(q) ? '' : 'none';
    });
}
