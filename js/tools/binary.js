// =========================
// PATTERN GENERATOR
// =========================

function buildPatternGen(panel){
    panel.innerHTML = `
    ${toolHeader('', 'Pattern Generator', 'Generate cyclic patterns for buffer overflow offset finding')}
    <div class="tool-wrap">
        <div class="tool-title">Cyclic Pattern Generator</div>

        <div class="tabs">
            <button class="tab-btn active" onclick="switchTab(this,'patGenTab')">Generate</button>
            <button class="tab-btn"        onclick="switchTab(this,'patFindTab')">Find Offset</button>
        </div>

        <div class="tab-content active" id="patGenTab">
            <label>Pattern Length</label>
            <input type="number" id="patLen" value="100" min="1" max="10000">
            <label>Architecture</label>
            <select id="patArch">
                <option value="32">32-bit (4 byte chunks)</option>
                <option value="64">64-bit (8 byte chunks)</option>
            </select>
            <div class="button-group">
                <button class="btn btn-run" onclick="runPatternGen()">Generate Pattern</button>
            </div>
            ${createOutput('patOutput', 'Cyclic Pattern')}
        </div>

        <div class="tab-content" id="patFindTab">
            <label>Value found in EIP/RIP (hex or string)</label>
            <input type="text" id="patFind" placeholder="e.g. 0x61616161 or aaab">
            <label>Pattern Length used</label>
            <input type="number" id="patFindLen" value="200">
            <div class="button-group">
                <button class="btn btn-run" onclick="runPatternFind()">Find Offset</button>
            </div>
            ${createOutput('patFindOutput', 'Offset Result')}
        </div>
    </div>`;
}

function runPatternGen(){
    const len  = parseInt(document.getElementById('patLen').value) || 100;
    const arch = document.getElementById('patArch').value;
    const size = arch === '64' ? 8 : 4;

    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const nums  = '0123456789';
    let pattern = '';
    let i = 0;

    outer: for(const u of upper){
        for(const l of lower){
            for(const n of nums){
                const chunk = arch === '64'
                    ? u+l+n+u+l+n+u+l
                    : u+l+n+(i%10);
                pattern += chunk;
                if(pattern.length >= len){ pattern = pattern.slice(0,len); break outer; }
                i++;
            }
        }
    }

    setOutput('patOutput', pattern);
}

function runPatternFind(){
    const val    = document.getElementById('patFind').value.trim();
    const len    = parseInt(document.getElementById('patFindLen').value) || 200;
    if(!val){ showToast('Enter a value to search', 'error'); return; }

    // Generate same pattern
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    let pattern = '';
    let i = 0;
    outer: for(const u of upper){
        for(const l of lower){
            for(const n of '0123456789'){
                pattern += u+l+n+(i%10);
                if(pattern.length >= len){ pattern = pattern.slice(0,len); break outer; }
                i++;
            }
        }
    }

    let search = val;
    if(val.startsWith('0x') || val.startsWith('0X')){
        const hex = val.slice(2);
        const bytes = hex.match(/.{1,2}/g).map(b => parseInt(b,16));
        search = bytes.map(b => String.fromCharCode(b)).join('');
    }

    const offset = pattern.indexOf(search);
    if(offset === -1){
        // Try reversed (little endian)
        const reversed = search.split('').reverse().join('');
        const revOffset = pattern.indexOf(reversed);
        if(revOffset !== -1){
            setOutput('patFindOutput',
                `Found at offset: ${revOffset} (little-endian match)\n\nValue reversed: ${reversed}`);
        } else {
            setOutput('patFindOutput', 'Pattern not found. Check your value or increase pattern length.');
        }
        return;
    }
    setOutput('patFindOutput', `Offset found: ${offset}\n\nOverwrite EIP/RIP at exactly ${offset} bytes.`);
}

// =========================
// SHELLCODE ENCODER
// =========================

function buildShellcodeEncoder(panel){
    panel.innerHTML = `
    ${toolHeader('', 'Shellcode Encoder', 'Encode and format shellcode for various uses')}
    <div class="tool-wrap">
        <div class="tool-title">Shellcode Encoder</div>

        <div class="tabs">
            <button class="tab-btn active" onclick="switchTab(this,'scFormat')">Format</button>
            <button class="tab-btn"        onclick="switchTab(this,'scAnalyze')">Analyze</button>
        </div>

        <div class="tab-content active" id="scFormat">
            <label>Shellcode (hex bytes, space or \\x separated)</label>
            <textarea id="scInput"
                placeholder="\\x31\\xc0\\x50\\x68 or 31 c0 50 68 or 31c05068..."></textarea>
            <label>Output Format</label>
            <select id="scFormat2">
                <option value="c">C Array (\\x format)</option>
                <option value="python">Python bytes</option>
                <option value="hex">Raw hex</option>
                <option value="nasm">NASM db format</option>
                <option value="powershell">PowerShell byte array</option>
            </select>
            <div class="button-group">
                <button class="btn btn-run" onclick="runShellcodeFormat()">Format</button>
                <button class="btn btn-outline" onclick="clearShellcode()">Clear</button>
            </div>
            ${createOutput('scOutput', 'Formatted Shellcode')}
        </div>

        <div class="tab-content" id="scAnalyze">
            <label>Shellcode (hex)</label>
            <textarea id="scAnalyzeInput"
                placeholder="\\x31\\xc0\\x50\\x68..."></textarea>
            <div class="button-group">
                <button class="btn btn-run" onclick="runShellcodeAnalyze()">Analyze</button>
            </div>
            ${createOutput('scAnalyzeOutput', 'Analysis')}
        </div>
    </div>`;
}

function parseShellcode(raw){
    raw = raw.trim();
    raw = raw.replace(/\\x/g,' ').replace(/0x/gi,' ').replace(/[,;"]/g,' ');
    raw = raw.replace(/\s+/g, ' ').trim();
    if(/^[0-9a-fA-F]+$/.test(raw) && raw.length > 2){
        if(raw.length % 2 !== 0) raw = '0' + raw;
        raw = raw.match(/.{2}/g).join(' ');
    }
    const bytes = raw.split(/\s+/).filter(b => /^[0-9a-fA-F]{1,2}$/.test(b));
    return bytes.map(b => parseInt(b,16));
}

function runShellcodeFormat(){
    const raw    = document.getElementById('scInput').value;
    const format = document.getElementById('scFormat2').value;
    if(!raw){ showToast('Enter shellcode', 'error'); return; }
    const bytes  = parseShellcode(raw);
    if(!bytes.length){ showToast('No valid hex bytes found', 'error'); return; }

    let result = '';
    switch(format){
        case 'c':
            result = `unsigned char shellcode[] =\n"${bytes.map(b=>'\\x'+b.toString(16).padStart(2,'0')).join('')}";\n// Length: ${bytes.length} bytes`;
            break;
        case 'python':
            result = `shellcode = b"${bytes.map(b=>'\\x'+b.toString(16).padStart(2,'0')).join('')}"\n# Length: ${bytes.length} bytes`;
            break;
        case 'hex':
            result = bytes.map(b=>b.toString(16).padStart(2,'0')).join('');
            break;
        case 'nasm':
            result = `; Length: ${bytes.length} bytes\nshellcode:\n    db ${bytes.map(b=>'0x'+b.toString(16).padStart(2,'0')).join(', ')}`;
            break;
        case 'powershell':
            result = `[Byte[]] $shellcode = ${bytes.map(b=>'0x'+b.toString(16).padStart(2,'0')).join(',')}`;
            break;
    }
    setOutput('scOutput', result);
}

function runShellcodeAnalyze(){
    const raw   = document.getElementById('scAnalyzeInput').value;
    if(!raw){ showToast('Enter shellcode', 'error'); return; }
    const bytes = parseShellcode(raw);
    if(!bytes.length){ showToast('No valid bytes found', 'error'); return; }

    const nullBytes   = bytes.filter(b => b === 0).length;
    const badChars    = bytes.filter(b => [0x00,0x0a,0x0d].includes(b));
    const printable   = bytes.filter(b => b >= 0x20 && b < 0x7f);
    const strings     = [];
    let cur = '';
    for(const b of bytes){
        if(b >= 0x20 && b < 0x7f) cur += String.fromCharCode(b);
        else{ if(cur.length >= 4) strings.push(cur); cur = ''; }
    }
    if(cur.length >= 4) strings.push(cur);

    setOutput('scAnalyzeOutput', `
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:16px;">
        ${[
            ['Total Bytes',  bytes.length],
            ['Null Bytes',   nullBytes],
            ['Bad Chars',    badChars.map(b=>'0x'+b.toString(16).padStart(2,'0')).join(', ') || 'None'],
            ['Printable %',  ((printable.length/bytes.length)*100).toFixed(1)+'%'],
        ].map(([k,v]) => `
        <div style="padding:10px; background:var(--panel-light); border-radius:var(--radius-sm);">
            <div style="color:var(--muted); font-size:12px;">${k}</div>
            <div style="color:var(--primary); font-weight:700; margin-top:4px;">${v}</div>
        </div>`).join('')}
    </div>
    ${strings.length ? `
    <div>
        <div style="color:var(--muted); font-size:12px; margin-bottom:6px;">Embedded Strings</div>
        ${strings.map(s => `
        <div style="padding:6px 10px; background:var(--panel-light); border-radius:6px;
                    margin-bottom:4px; font-family:var(--font-mono); font-size:13px;">
            ${s}
        </div>`).join('')}
    </div>` : ''}
    `, true);
}

function clearShellcode(){
    document.getElementById('scInput').value = '';
    const out = document.getElementById('scOutput');
    if(out) out.innerHTML = '<span style="color:var(--muted)">Result will appear here...</span>';
}

// =========================
// STRING HEX CONVERTER
// =========================

function buildStringHexConverter(panel){
    panel.innerHTML = `
    ${toolHeader('', 'String / Hex', 'Convert between strings and hex representations')}
    <div class="tool-wrap">
        <div class="tool-title">String / Hex Converter</div>
        <label>Input</label>
        <textarea id="strHexInput" placeholder="Enter string or hex..."></textarea>
        <div class="button-group">
            <button class="btn btn-run" onclick="runStrToHex()">String -> Hex</button>
            <button class="btn btn-run" onclick="runHexToStr()">Hex -> String</button>
            <button class="btn btn-run" onclick="runStrToHexEscape()">String -> \\x Escape</button>
            <button class="btn btn-run" onclick="runHexToBytes()">Hex -> Byte Array</button>
            <button class="btn btn-outline" onclick="clearStrHex()">Clear</button>
        </div>
        ${createOutput('strHexOutput', 'Output')}
    </div>`;
    autoSaveInput('strHexInput', 'stringHexConverter');
}

function runStrToHex(){
    const t = document.getElementById('strHexInput').value;
    if(!t){ showToast('Enter text', 'error'); return; }
    setOutput('strHexOutput', Array.from(t).map(c=>c.charCodeAt(0).toString(16).padStart(2,'0')).join(' '));
}

function runHexToStr(){
    const t = document.getElementById('strHexInput').value.replace(/\\x|0x|,|\s/g,' ').trim();
    const bytes = t.split(/\s+/).filter(b=>/^[0-9a-fA-F]{1,2}$/.test(b));
    if(!bytes.length){ showToast('No valid hex found', 'error'); return; }
    setOutput('strHexOutput', bytes.map(b=>String.fromCharCode(parseInt(b,16))).join(''));
}

function runStrToHexEscape(){
    const t = document.getElementById('strHexInput').value;
    if(!t){ showToast('Enter text', 'error'); return; }
    setOutput('strHexOutput', Array.from(t).map(c=>'\\x'+c.charCodeAt(0).toString(16).padStart(2,'0')).join(''));
}

function runHexToBytes(){
    const t = document.getElementById('strHexInput').value.replace(/\\x|0x|,|\s/g,' ').trim();
    const bytes = t.split(/\s+/).filter(b=>/^[0-9a-fA-F]{1,2}$/.test(b));
    if(!bytes.length){ showToast('No valid hex found', 'error'); return; }
    setOutput('strHexOutput', `[${bytes.map(b=>'0x'+b.padStart(2,'0')).join(', ')}]`);
}

function clearStrHex(){
    document.getElementById('strHexInput').value = '';
    const out = document.getElementById('strHexOutput');
    if(out) out.innerHTML = '<span style="color:var(--muted)">Result will appear here...</span>';
}

// =========================
// ELF PARSER
// =========================

function buildElfParser(panel){
    panel.innerHTML = `
    ${toolHeader('', 'ELF Header Parser', 'Parse ELF binary headers from uploaded files')}
    <div class="tool-wrap">
        <div class="tool-title">ELF Header Parser</div>
        <div class="info-box">Upload a Linux ELF binary to parse its header information.</div>
        <label>Upload ELF Binary</label>
        <input type="file" id="elfFile" accept="*">
        <div class="button-group">
            <button class="btn btn-run" onclick="runElfParser()">Parse ELF</button>
        </div>
        ${createOutput('elfOutput', 'ELF Header Info')}
    </div>`;
}

function runElfParser(){
    const file = document.getElementById('elfFile').files[0];
    if(!file){ showToast('Upload a file first', 'error'); return; }
    const reader = new FileReader();
    reader.onload = function(e){
        const bytes = new Uint8Array(e.target.result);

        // Check ELF magic
        if(bytes[0]!==0x7f || bytes[1]!==0x45 || bytes[2]!==0x4c || bytes[3]!==0x46){
            setOutput('elfOutput', 'Not a valid ELF file (missing ELF magic bytes 7f 45 4c 46)');
            return;
        }

        const class_  = bytes[4] === 1 ? '32-bit' : bytes[4] === 2 ? '64-bit' : 'Unknown';
        const endian  = bytes[5] === 1 ? 'Little Endian' : bytes[5] === 2 ? 'Big Endian' : 'Unknown';
        const version = bytes[6];
        const osAbi   = {0:'System V',1:'HP-UX',2:'NetBSD',3:'Linux',6:'Solaris',9:'FreeBSD'}[bytes[7]] || `0x${bytes[7].toString(16)}`;
        const typeMap = {0:'ET_NONE',1:'ET_REL (Relocatable)',2:'ET_EXEC (Executable)',3:'ET_DYN (Shared Object)',4:'ET_CORE (Core)'};
        const elfType = typeMap[(bytes[17]<<8)|bytes[16]] || 'Unknown';
        const machineMap = {0x03:'x86',0x28:'ARM',0x3e:'x86-64',0xb7:'AArch64',0x08:'MIPS'};
        const machine = machineMap[(bytes[19]<<8)|bytes[18]] || `0x${((bytes[19]<<8)|bytes[18]).toString(16)}`;

        const fields = [
            ['Magic',       '7f 45 4c 46 (ELF)'],
            ['Class',       class_],
            ['Endianness',  endian],
            ['ELF Version', version],
            ['OS/ABI',      osAbi],
            ['Type',        elfType],
            ['Machine',     machine],
            ['File Size',   `${file.size.toLocaleString()} bytes`],
        ];

        const html = fields.map(([k,v]) => `
        <div style="display:flex; gap:12px; padding:8px; background:var(--panel-light);
                    border-radius:var(--radius-sm); margin-bottom:4px;">
            <span style="color:var(--primary); min-width:120px; font-size:13px;">${k}</span>
            <span style="color:var(--text); font-family:var(--font-mono); font-size:13px;">${v}</span>
        </div>`).join('');

        setOutput('elfOutput', html, true);
    };
    reader.readAsArrayBuffer(file);
}

// =========================
// ROP REFERENCE
// =========================

function buildRopReference(panel){
    panel.innerHTML = `
    ${toolHeader('', 'ROP Reference', 'Common ROP gadgets and exploitation techniques')}
    <div class="tool-wrap">
        <div class="tool-title">ROP Gadget Reference</div>
        <div class="info-box">
            Common ROP gadgets for x86/x64 exploitation. Use tools like ROPgadget, ropper, or pwntools to find these in binaries.
        </div>
        <div style="font-family:var(--font-mono); font-size:13px; line-height:2;">
            ${[
                ['pop rdi ; ret',           'Load 1st argument (x64 calling convention)'],
                ['pop rsi ; ret',           'Load 2nd argument'],
                ['pop rdx ; ret',           'Load 3rd argument'],
                ['pop rax ; ret',           'Load value into RAX (syscall number)'],
                ['syscall',                 'Execute syscall'],
                ['ret',                     'Stack alignment gadget (needed for MOVAPS)'],
                ['pop rbp ; ret',           'Control RBP for stack pivoting'],
                ['leave ; ret',             'Stack pivot'],
                ['pop rsp ; ret',           'Stack pivot to new location'],
                ['xor rax,rax ; ret',       'Zero out RAX'],
                ['mov [rdi], rsi ; ret',    'Write primitive'],
                ['add rsp, 0x?? ; ret',     'Skip stack bytes'],
                ['jmp rsp',                 'Jump to stack shellcode'],
                ['call rsp',                'Call stack shellcode'],
            ].map(([g,d]) => `
            <div style="display:flex; gap:16px; padding:8px; background:var(--panel-light);
                        border-radius:6px; margin-bottom:4px; align-items:flex-start;">
                <code style="min-width:220px; color:var(--primary); flex-shrink:0;">${g}</code>
                <span style="color:var(--muted); font-family:var(--font); font-size:12px;">${d}</span>
            </div>`).join('')}
        </div>
    </div>`;
}

// =========================
// ASSEMBLY REFERENCE
// =========================

function buildAsmConverter(panel){
    panel.innerHTML = `
    ${toolHeader('', 'Assembly Reference', 'Common x86/x64 assembly instructions')}
    <div class="tool-wrap">
        <div class="tool-title">x86/x64 Assembly Reference</div>

        <div class="tabs">
            <button class="tab-btn active" onclick="switchTab(this,'asmData')">Data Movement</button>
            <button class="tab-btn"        onclick="switchTab(this,'asmArith')">Arithmetic</button>
            <button class="tab-btn"        onclick="switchTab(this,'asmStack')">Stack</button>
            <button class="tab-btn"        onclick="switchTab(this,'asmSyscall')">Syscalls</button>
        </div>

        <div class="tab-content active" id="asmData">
            ${asmTable([
                ['mov dst, src',  'Move/copy value'],
                ['lea dst, [src]','Load effective address'],
                ['xchg a, b',     'Swap two values'],
                ['movzx dst, src','Move with zero extension'],
                ['movsx dst, src','Move with sign extension'],
            ])}
        </div>
        <div class="tab-content" id="asmArith">
            ${asmTable([
                ['add dst, src', 'Add'],
                ['sub dst, src', 'Subtract'],
                ['mul src',      'Unsigned multiply (rax * src)'],
                ['div src',      'Unsigned divide (rax / src)'],
                ['inc dst',      'Increment by 1'],
                ['dec dst',      'Decrement by 1'],
                ['xor dst, src', 'Bitwise XOR (xor rax,rax = zero)'],
                ['and dst, src', 'Bitwise AND'],
                ['or  dst, src', 'Bitwise OR'],
                ['neg dst',      'Negate (two\'s complement)'],
                ['shl dst, n',   'Shift left (multiply by 2^n)'],
                ['shr dst, n',   'Shift right (divide by 2^n)'],
            ])}
        </div>
        <div class="tab-content" id="asmStack">
            ${asmTable([
                ['push src',     'Push onto stack (rsp -= 8)'],
                ['pop  dst',     'Pop from stack (rsp += 8)'],
                ['call addr',    'Push rip, jump to addr'],
                ['ret',          'Pop rip (return)'],
                ['leave',        'mov rsp,rbp; pop rbp'],
                ['enter n,0',    'Setup stack frame'],
            ])}
        </div>
        <div class="tab-content" id="asmSyscall">
            <div style="font-family:var(--font-mono); font-size:13px;">
            ${[
                ['0', 'read',    'rdi=fd, rsi=buf, rdx=count'],
                ['1', 'write',   'rdi=fd, rsi=buf, rdx=count'],
                ['2', 'open',    'rdi=path, rsi=flags, rdx=mode'],
                ['3', 'close',   'rdi=fd'],
                ['11','execve',  'rdi=path, rsi=argv, rdx=envp'],
                ['60','exit',    'rdi=status'],
            ].map(([n,name,args]) => `
            <div style="display:flex; gap:12px; padding:8px; background:var(--panel-light);
                        border-radius:6px; margin-bottom:4px;">
                <span style="color:var(--primary); min-width:30px;">${n}</span>
                <span style="color:var(--success); min-width:80px;">${name}</span>
                <span style="color:var(--muted); font-size:12px;">${args}</span>
            </div>`).join('')}
            </div>
        </div>
    </div>`;
}

function asmTable(rows){
    return rows.map(([inst,desc]) => `
    <div style="display:flex; gap:16px; padding:8px; background:var(--panel-light);
                border-radius:6px; margin-bottom:4px;">
        <code style="min-width:200px; color:var(--primary); flex-shrink:0;">${inst}</code>
        <span style="color:var(--muted); font-size:13px;">${desc}</span>
    </div>`).join('');
}
