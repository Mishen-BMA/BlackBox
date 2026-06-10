// =========================
// HEX DUMP
// =========================

function buildHexDump(panel){
    panel.innerHTML = `
    ${toolHeader('', 'Hex Dump', 'Full hex dump of uploaded files')}
    <div class="tool-wrap">
        <div class="tool-title">Hex Dump</div>
        <label>Upload File</label>
        <input type="file" id="hexDumpFile">
        <label>Max bytes to show</label>
        <select id="hexDumpMax">
            <option value="512">512 bytes</option>
            <option value="1024">1 KB</option>
            <option value="4096" selected>4 KB</option>
            <option value="16384">16 KB</option>
            <option value="0">All (may be slow)</option>
        </select>
        <div class="button-group">
            <button class="btn btn-run" onclick="runHexDump()">Dump</button>
            <button class="btn btn-outline" onclick="clearHexDump()">Clear</button>
        </div>
        ${createOutput('hexDumpOutput', 'Hex Dump')}
    </div>`;
}

function runHexDump(){
    const file   = document.getElementById('hexDumpFile').files[0];
    const maxVal = parseInt(document.getElementById('hexDumpMax').value);
    if(!file){ showToast('Upload a file', 'error'); return; }
    const reader = new FileReader();
    reader.onload = function(e){
        const all   = new Uint8Array(e.target.result);
        const bytes = maxVal > 0 ? all.slice(0, maxVal) : all;
        renderHexDump(bytes, 'hexDumpOutput');
        if(all.length > bytes.length)
            showToast(`Showing ${bytes.length} of ${all.length} bytes`);
    };
    reader.readAsArrayBuffer(file);
}

function clearHexDump(){
    document.getElementById('hexDumpFile').value = '';
    const out = document.getElementById('hexDumpOutput');
    if(out) out.innerHTML = '<span style="color:var(--muted)">Result will appear here...</span>';
}

// =========================
// METADATA EXTRACTOR
// =========================

function buildMetadataExtractor(panel){
    panel.innerHTML = `
    ${toolHeader('', 'Metadata Extractor', 'Extract EXIF and metadata from images')}
    <div class="tool-wrap">
        <div class="tool-title">Metadata Extractor</div>
        <div class="info-box">
            Extracts EXIF data including GPS coordinates, camera model, date taken,
            and other metadata from JPEG, PNG, TIFF and HEIC images.
        </div>
        <label>Upload Image</label>
        <input type="file" id="metaFile" accept="image/*">
        <div class="button-group">
            <button class="btn btn-run" onclick="runMetadataExtractor()">Extract Metadata</button>
            <button class="btn btn-outline" onclick="clearMeta()">Clear</button>
        </div>
        ${createOutput('metaOutput', 'Metadata')}
    </div>`;
}

async function runMetadataExtractor(){
    const file = document.getElementById('metaFile').files[0];
    if(!file){ showToast('Upload an image', 'error'); return; }

    // Try exifr if available
    if(typeof exifr !== 'undefined'){
        try{
            const data = await exifr.parse(file, true);
            if(!data){ setOutput('metaOutput', 'No EXIF data found in this image.'); return; }
            const html = Object.entries(data)
                .filter(([,v]) => v !== undefined && v !== null)
                .map(([k,v]) => {
                    let val = typeof v === 'object' ? JSON.stringify(v) : String(v);
                    return `
                    <div style="display:flex; gap:12px; padding:7px; background:var(--panel-light);
                                border-radius:6px; margin-bottom:3px;">
                        <span style="color:var(--primary); min-width:200px; font-size:13px;">${k}</span>
                        <span style="color:var(--text); font-size:13px; word-break:break-word;">${val}</span>
                    </div>`;
                }).join('');
            setOutput('metaOutput', html, true);
            return;
        } catch(e){}
    }

    // Fallback: manual EXIF parsing
    const reader = new FileReader();
    reader.onload = function(e){
        const bytes = new Uint8Array(e.target.result);
        const info  = [];

        // File basic info
        info.push({ key: 'File Name',    value: file.name });
        info.push({ key: 'File Size',    value: `${file.size.toLocaleString()} bytes` });
        info.push({ key: 'File Type',    value: file.type });
        info.push({ key: 'Last Modified',value: new Date(file.lastModified).toLocaleString() });

        // Check for JFIF/EXIF marker
        if(bytes[0]===0xff && bytes[1]===0xd8){
            info.push({ key: 'Format', value: 'JPEG' });
            // Look for EXIF marker
            for(let i = 2; i < Math.min(bytes.length, 65536); i++){
                if(bytes[i]===0xff && bytes[i+1]===0xe1){
                    const marker = String.fromCharCode(bytes[i+4],bytes[i+5],bytes[i+6],bytes[i+7]);
                    if(marker === 'Exif') info.push({ key: 'EXIF Data', value: 'Present (install exifr.min.js for full parsing)' });
                    break;
                }
            }
        }

        const html = info.map(({key,value}) => `
        <div style="display:flex; gap:12px; padding:7px; background:var(--panel-light);
                    border-radius:6px; margin-bottom:3px;">
            <span style="color:var(--primary); min-width:160px; font-size:13px;">${key}</span>
            <span style="color:var(--text); font-size:13px;">${value}</span>
        </div>`).join('');

        setOutput('metaOutput', html, true);
    };
    reader.readAsArrayBuffer(file);
}

function clearMeta(){
    document.getElementById('metaFile').value = '';
    const out = document.getElementById('metaOutput');
    if(out) out.innerHTML = '<span style="color:var(--muted)">Result will appear here...</span>';
}

// =========================
// LSB STEGO DETECTOR
// =========================

function buildLsbDetector(panel){
    panel.innerHTML = `
    ${toolHeader('', 'LSB Stego Detector', 'Detect and extract LSB steganography from images')}
    <div class="tool-wrap">
        <div class="tool-title">LSB Steganography Detector</div>
        <div class="info-box">
            Reads the least significant bit of each pixel's RGB values to detect
            and extract hidden messages.
        </div>
        <label>Upload Image (PNG recommended)</label>
        <input type="file" id="lsbFile" accept="image/*">
        <label>Bits to Extract per Channel</label>
        <select id="lsbBits">
            <option value="1">1 bit (most common)</option>
            <option value="2">2 bits</option>
            <option value="4">4 bits</option>
        </select>
        <div class="button-group">
            <button class="btn btn-run" onclick="runLsbDetector()">Extract LSB Data</button>
            <button class="btn btn-outline" onclick="clearLsb()">Clear</button>
        </div>
        <canvas id="lsbCanvas" style="display:none;"></canvas>
        ${createOutput('lsbOutput', 'Extracted Data')}
    </div>`;
}

function runLsbDetector(){
    const file = document.getElementById('lsbFile').files[0];
    const bits = parseInt(document.getElementById('lsbBits').value);
    if(!file){ showToast('Upload an image', 'error'); return; }

    const img    = new Image();
    const canvas = document.getElementById('lsbCanvas');
    const ctx    = canvas.getContext('2d');
    const url    = URL.createObjectURL(file);

    img.onload = function(){
        canvas.width  = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);

        const data    = ctx.getImageData(0, 0, img.width, img.height).data;
        const mask    = (1 << bits) - 1;
        let   bitStr  = '';

        // Extract LSBs from R, G, B channels
        for(let i = 0; i < data.length; i += 4){
            for(let c = 0; c < 3; c++){
                const val = data[i+c] & mask;
                bitStr += val.toString(2).padStart(bits, '0');
            }
        }

        // Convert bits to bytes to characters
        const bytes = [];
        for(let i = 0; i + 8 <= bitStr.length; i += 8){
            bytes.push(parseInt(bitStr.slice(i, i+8), 2));
        }

        // Extract printable chars until null byte or end
        let text = '';
        for(const b of bytes){
            if(b === 0) break;
            if(b >= 32 && b < 127) text += String.fromCharCode(b);
            else if(text.length > 0) text += '.';
        }

        // Check for patterns
        const hexPreview = bytes.slice(0,32).map(b=>b.toString(16).padStart(2,'0')).join(' ');
        const hasFlag    = /flag|ctf|{|}/.test(text.toLowerCase());
        const printableRatio = bytes.filter(b=>b>=32&&b<127).length / Math.min(bytes.length,1000);

        setOutput('lsbOutput', `
        <div style="margin-bottom:12px;">
            <span style="color:var(--muted);">Image: </span>${img.width}x${img.height}px
            &nbsp;|&nbsp;
            <span style="color:var(--muted);">LSB bits: </span>${bits}
            &nbsp;|&nbsp;
            <span style="color:var(--muted);">Printable ratio: </span>
            <span style="color:${printableRatio>0.7?'var(--success)':'var(--muted)'};">
                ${(printableRatio*100).toFixed(1)}%
            </span>
        </div>
        ${hasFlag ? '<div style="color:var(--success); font-weight:700; margin-bottom:8px;"> Possible flag detected!</div>' : ''}
        <div style="margin-bottom:12px;">
            <div style="color:var(--muted); font-size:12px; margin-bottom:4px;">First bytes (hex):</div>
            <div style="font-family:var(--font-mono); font-size:12px; color:var(--text);">${hexPreview}</div>
        </div>
        <div>
            <div style="color:var(--muted); font-size:12px; margin-bottom:4px;">ASCII text (first 500 chars):</div>
            <div style="font-family:var(--font-mono); font-size:13px; word-break:break-all; color:var(--primary);">
                ${text.slice(0,500) || '(no printable text found)'}
            </div>
        </div>
        `, true);
    };
    img.src = url;
}

function clearLsb(){
    document.getElementById('lsbFile').value = '';
    const out = document.getElementById('lsbOutput');
    if(out) out.innerHTML = '<span style="color:var(--muted)">Result will appear here...</span>';
}

// =========================
// ENTROPY ANALYZER
// =========================

function buildEntropyAnalyzer(panel){
    panel.innerHTML = `
    ${toolHeader('', 'Entropy Analyzer', 'Calculate file entropy to detect encryption or compression')}
    <div class="tool-wrap">
        <div class="tool-title">Entropy Analyzer</div>
        <div class="info-box">
            Shannon entropy measures randomness. High entropy (>7.5) suggests encrypted or compressed data.
            Low entropy suggests plain text or structured data.
        </div>
        <label>Upload File</label>
        <input type="file" id="entropyFile">
        <div class="button-group">
            <button class="btn btn-run" onclick="runEntropyAnalyzer()">Analyze Entropy</button>
            <button class="btn btn-outline" onclick="clearEntropy()">Clear</button>
        </div>
        ${createOutput('entropyOutput', 'Entropy Analysis')}
    </div>`;
}

function runEntropyAnalyzer(){
    const file = document.getElementById('entropyFile').files[0];
    if(!file){ showToast('Upload a file', 'error'); return; }

    const reader = new FileReader();
    reader.onload = function(e){
        const bytes = new Uint8Array(e.target.result);
        const freq  = new Array(256).fill(0);
        for(const b of bytes) freq[b]++;
        const n = bytes.length;

        let entropy = 0;
        for(const f of freq){
            if(f > 0){
                const p = f / n;
                entropy -= p * Math.log2(p);
            }
        }

        // Analysis
        let interpretation = '';
        let color = 'var(--text)';
        if(entropy > 7.5){
            interpretation = 'Very high entropy - likely encrypted or compressed';
            color = 'var(--danger)';
        } else if(entropy > 6.5){
            interpretation = 'High entropy - possibly compressed or binary data';
            color = 'var(--warning)';
        } else if(entropy > 4.5){
            interpretation = 'Medium entropy - likely binary or mixed data';
            color = 'var(--primary)';
        } else {
            interpretation = 'Low entropy - likely plain text or structured data';
            color = 'var(--success)';
        }

        // Find most common bytes
        const topBytes = freq
            .map((f,b) => ({b,f}))
            .filter(x => x.f > 0)
            .sort((a,b) => b.f - a.f)
            .slice(0,10);

        const barWidth = (entropy / 8 * 100).toFixed(1);

        setOutput('entropyOutput', `
        <div style="margin-bottom:20px;">
            <div style="font-size:28px; font-weight:700; color:${color}; margin-bottom:4px;">
                ${entropy.toFixed(4)} bits/byte
            </div>
            <div style="color:var(--muted); font-size:13px; margin-bottom:12px;">
                Max possible: 8.0 bits/byte
            </div>
            <div style="background:var(--border); border-radius:10px; height:12px; margin-bottom:8px;">
                <div style="background:${color}; width:${barWidth}%; height:100%; border-radius:10px;
                            transition:width 0.5s;"></div>
            </div>
            <div style="color:${color}; font-weight:600;">${interpretation}</div>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:16px;">
            ${[
                ['File',        file.name],
                ['Size',        `${file.size.toLocaleString()} bytes`],
                ['Unique Bytes',`${freq.filter(f=>f>0).length} / 256`],
                ['Null Bytes',  `${freq[0].toLocaleString()}`],
            ].map(([k,v]) => `
            <div style="padding:8px; background:var(--panel-light); border-radius:6px;">
                <div style="color:var(--muted); font-size:11px;">${k}</div>
                <div style="color:var(--text); font-weight:600; margin-top:2px;">${v}</div>
            </div>`).join('')}
        </div>
        <div>
            <div style="color:var(--muted); font-size:12px; margin-bottom:6px;">Top 10 Bytes</div>
            ${topBytes.map(({b,f}) => `
            <div style="display:flex; align-items:center; gap:10px; padding:6px;
                        background:var(--panel-light); border-radius:6px; margin-bottom:3px;">
                <span style="color:var(--primary); font-family:var(--font-mono); min-width:50px;">
                    0x${b.toString(16).padStart(2,'0')}
                </span>
                <div style="flex:1; background:var(--border); border-radius:4px; height:12px;">
                    <div style="background:var(--primary); opacity:0.6; height:100%; border-radius:4px;
                                width:${(f/topBytes[0].f*100).toFixed(0)}%;"></div>
                </div>
                <span style="color:var(--muted); font-size:12px; min-width:80px; text-align:right;">
                    ${f.toLocaleString()} (${(f/n*100).toFixed(1)}%)
                </span>
            </div>`).join('')}
        </div>
        `, true);
    };
    reader.readAsArrayBuffer(file);
}

function clearEntropy(){
    document.getElementById('entropyFile').value = '';
    const out = document.getElementById('entropyOutput');
    if(out) out.innerHTML = '<span style="color:var(--muted)">Result will appear here...</span>';
}

// =========================
// PNG CHUNK ANALYZER
// =========================

function buildPngAnalyzer(panel){
    panel.innerHTML = `
    ${toolHeader('', 'PNG Chunk Analyzer', 'Inspect and extract PNG file chunks')}
    <div class="tool-wrap">
        <div class="tool-title">PNG Chunk Analyzer</div>
        <div class="info-box">
            PNG files are composed of chunks. Hidden data is often stored in
            tEXt, zTXt, iTXt, or custom chunks.
        </div>
        <label>Upload PNG File</label>
        <input type="file" id="pngFile" accept="image/png,*">
        <div class="button-group">
            <button class="btn btn-run" onclick="runPngAnalyzer()">Analyze Chunks</button>
            <button class="btn btn-outline" onclick="clearPng()">Clear</button>
        </div>
        ${createOutput('pngOutput', 'PNG Chunks')}
    </div>`;
}

function runPngAnalyzer(){
    const file = document.getElementById('pngFile').files[0];
    if(!file){ showToast('Upload a PNG file', 'error'); return; }

    const reader = new FileReader();
    reader.onload = function(e){
        const bytes = new Uint8Array(e.target.result);

        // Verify PNG magic
        const magic = [0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a];
        const isValid = magic.every((b,i) => bytes[i] === b);

        if(!isValid){
            setOutput('pngOutput', 'Not a valid PNG file (invalid magic bytes)');
            return;
        }

        const chunks = [];
        let offset   = 8; // Skip PNG signature

        while(offset < bytes.length - 12){
            const length = (bytes[offset]<<24)|(bytes[offset+1]<<16)|(bytes[offset+2]<<8)|bytes[offset+3];
            const type   = String.fromCharCode(bytes[offset+4],bytes[offset+5],bytes[offset+6],bytes[offset+7]);
            const data   = bytes.slice(offset+8, offset+8+length);

            let dataPreview = '';
            if(type === 'tEXt' || type === 'iTXt'){
                dataPreview = new TextDecoder('utf-8', {fatal:false}).decode(data).replace(/\0/g, ' | ');
            } else {
                dataPreview = Array.from(data.slice(0,16)).map(b=>b.toString(16).padStart(2,'0')).join(' ');
                if(data.length > 16) dataPreview += '...';
            }

            const interesting = ['tEXt','zTXt','iTXt','pHYs','gAMA','cHRM','sRGB','iCCP']
                .includes(type);

            chunks.push({ type, length, dataPreview, interesting });
            offset += 12 + length;
            if(type === 'IEND') break;
        }

        const html = `
        <div style="margin-bottom:16px; color:var(--muted); font-size:13px;">
            Found ${chunks.length} chunks in ${file.name}
        </div>
        ${chunks.map(c => `
        <div style="padding:10px; background:var(--panel-light); border-radius:var(--radius-sm);
                    margin-bottom:6px; border-left:3px solid ${c.interesting?'var(--warning)':'var(--border)'};">
            <div style="display:flex; gap:16px; align-items:center; margin-bottom:6px;">
                <span style="color:var(--primary); font-family:var(--font-mono); font-weight:700;
                             min-width:60px;">${c.type}</span>
                <span style="color:var(--muted); font-size:12px;">${c.length.toLocaleString()} bytes</span>
                ${c.interesting ? '<span style="color:var(--warning); font-size:11px;"> May contain metadata</span>' : ''}
            </div>
            ${c.dataPreview ? `
            <div style="font-family:var(--font-mono); font-size:12px; color:var(--muted-light);
                        word-break:break-all;">${c.dataPreview}</div>` : ''}
        </div>`).join('')}`;

        setOutput('pngOutput', html, true);
    };
    reader.readAsArrayBuffer(file);
}

function clearPng(){
    document.getElementById('pngFile').value = '';
    const out = document.getElementById('pngOutput');
    if(out) out.innerHTML = '<span style="color:var(--muted)">Result will appear here...</span>';
}

// =========================
// FILE HASHER
// =========================

function buildFileHasher(panel){
    panel.innerHTML = `
    ${toolHeader('', 'File Hasher', 'Calculate MD5, SHA1, SHA256, SHA512 of uploaded files')}
    <div class="tool-wrap">
        <div class="tool-title">File Hasher</div>
        <label>Upload File</label>
        <input type="file" id="fileHashFile">
        <div class="button-group">
            <button class="btn btn-run" onclick="runFileHasher()">Hash File</button>
            <button class="btn btn-outline" onclick="clearFileHasher()">Clear</button>
        </div>
        ${createOutput('fileHashOutput', 'File Hashes')}
    </div>`;
}

function runFileHasher(){
    const file = document.getElementById('fileHashFile').files[0];
    if(!file){ showToast('Upload a file', 'error'); return; }

    const reader = new FileReader();
    reader.onload = function(e){
        const wordArray = CryptoJS.lib.WordArray.create(e.target.result);
        const hashes = [
            { type:'MD5',    hash: CryptoJS.MD5(wordArray).toString() },
            { type:'SHA1',   hash: CryptoJS.SHA1(wordArray).toString() },
            { type:'SHA256', hash: CryptoJS.SHA256(wordArray).toString() },
            { type:'SHA512', hash: CryptoJS.SHA512(wordArray).toString() },
        ];

        const html = `
        <div style="margin-bottom:16px; color:var(--muted); font-size:13px;">
            File: <strong style="color:var(--text);">${file.name}</strong>
            &nbsp;|&nbsp; Size: <strong style="color:var(--text);">
            ${file.size.toLocaleString()} bytes</strong>
        </div>
        ${hashes.map(h => `
        <div style="margin-bottom:12px; padding:12px; background:var(--panel-light);
                    border-radius:var(--radius-sm);">
            <div style="color:var(--primary); font-size:12px; margin-bottom:6px;">${h.type}</div>
            <div style="font-family:var(--font-mono); font-size:13px; word-break:break-all;
                        color:var(--text); margin-bottom:6px;">${h.hash}</div>
            <button class="output-action-btn" onclick="copyText('${h.hash}', this)">Copy</button>
        </div>`).join('')}`;

        setOutput('fileHashOutput', html, true);
        showToast('File hashed!');
    };
    reader.readAsArrayBuffer(file);
}

function clearFileHasher(){
    document.getElementById('fileHashFile').value = '';
    const out = document.getElementById('fileHashOutput');
    if(out) out.innerHTML = '<span style="color:var(--muted)">Result will appear here...</span>';
}

// =========================
// FORENSICS REFERENCE
// =========================

function buildBinwalkRef(panel){
    panel.innerHTML = `
    ${toolHeader('', 'Forensics Reference', 'Common forensics tools and commands')}
    <div class="tool-wrap">
        <div class="tool-title">Forensics Command Reference</div>
        ${[
            {
                title: ' File Analysis',
                cmds: [
                    ['file suspicious.bin',           'Identify file type'],
                    ['xxd suspicious.bin | head -20', 'View hex dump'],
                    ['strings suspicious.bin',        'Extract strings'],
                    ['binwalk suspicious.bin',        'Scan for embedded files'],
                    ['binwalk -e suspicious.bin',     'Extract embedded files'],
                    ['foremost -i suspicious.bin',    'File carving'],
                ]
            },
            {
                title: ' Image Steganography',
                cmds: [
                    ['steghide extract -sf image.jpg',  'Extract hidden data (steghide)'],
                    ['stegsolve image.png',              'Visual steg analysis (GUI)'],
                    ['zsteg image.png',                  'Detect LSB steg in PNG/BMP'],
                    ['exiftool image.jpg',               'View all EXIF metadata'],
                    ['identify -verbose image.png',      'ImageMagick file info'],
                    ['convert image.png -channel alpha -separate alpha.png', 'Extract alpha channel'],
                ]
            },
            {
                title: ' Archive Analysis',
                cmds: [
                    ['unzip -l archive.zip',    'List zip contents'],
                    ['7z l archive.7z',         'List 7zip contents'],
                    ['fcrackzip -u -D -p rockyou.txt archive.zip', 'Crack zip password'],
                    ['john --format=zip hash.txt', 'Crack zip with John'],
                ]
            },
            {
                title: ' Network/PCAP',
                cmds: [
                    ['tcpdump -r capture.pcap',                   'Read pcap file'],
                    ['tshark -r capture.pcap',                    'Detailed pcap analysis'],
                    ['tshark -r capture.pcap -Y "http"',          'Filter HTTP traffic'],
                    ['tshark -r capture.pcap -T fields -e data',  'Extract raw data'],
                    ['wireshark capture.pcap',                    'Open in Wireshark GUI'],
                ]
            },
        ].map(section => `
        <div style="margin-bottom:20px;">
            <div style="color:var(--primary); font-weight:700; margin-bottom:10px;">${section.title}</div>
            ${section.cmds.map(([cmd,desc]) => `
            <div style="display:flex; gap:12px; padding:8px; background:var(--panel-light);
                        border-radius:6px; margin-bottom:4px;">
                <code style="color:var(--primary); flex:1; word-break:break-all; font-size:13px;">${cmd}</code>
                <span style="color:var(--muted); font-size:12px; min-width:200px;">${desc}</span>
                <button class="output-action-btn" onclick="copyText('${cmd}', this)">Copy</button>
            </div>`).join('')}
        </div>`).join('')}
    </div>`;
}
