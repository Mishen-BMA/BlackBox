// =========================
// GOOGLE DORK BUILDER
// =========================

function buildDorkBuilder(panel){
    panel.innerHTML = `
    ${toolHeader('', 'Google Dork Builder', 'Build powerful Google dork queries')}
    <div class="tool-wrap">
        <div class="tool-title">Google Dork Builder</div>

        <div class="tabs">
            <button class="tab-btn active" onclick="switchTab(this,'dorkBuilder')">Builder</button>
            <button class="tab-btn"        onclick="switchTab(this,'dorkTemplates')">Templates</button>
        </div>

        <div class="tab-content active" id="dorkBuilder">
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                <div>
                    <label>site:</label>
                    <input type="text" id="dorkSite" placeholder="example.com">
                </div>
                <div>
                    <label>inurl:</label>
                    <input type="text" id="dorkInurl" placeholder="admin">
                </div>
                <div>
                    <label>intitle:</label>
                    <input type="text" id="dorkIntitle" placeholder="login">
                </div>
                <div>
                    <label>intext:</label>
                    <input type="text" id="dorkIntext" placeholder="password">
                </div>
                <div>
                    <label>filetype:</label>
                    <input type="text" id="dorkFiletype" placeholder="pdf, sql, env">
                </div>
                <div>
                    <label>ext:</label>
                    <input type="text" id="dorkExt" placeholder="php, asp, xml">
                </div>
                <div>
                    <label>cache:</label>
                    <input type="text" id="dorkCache" placeholder="example.com">
                </div>
                <div>
                    <label>link:</label>
                    <input type="text" id="dorkLink" placeholder="example.com">
                </div>
            </div>
            <label style="margin-top:8px;">Extra Terms</label>
            <input type="text" id="dorkExtra" placeholder='"index of" OR "admin panel"'>
            <div class="button-group" style="margin-top:12px;">
                <button class="btn btn-run" onclick="runDorkBuilder()">Build Dork</button>
                <button class="btn btn-outline" onclick="clearDork()">Clear</button>
            </div>
            ${createOutput('dorkOutput', 'Google Dork')}
            <div id="dorkSearchBtn" style="display:none; margin-top:10px;">
                <button class="btn btn-outline" onclick="searchDork()"> Open in Google</button>
            </div>
        </div>

        <div class="tab-content" id="dorkTemplates">
            <div class="info-box">Click any template to load it into the builder.</div>
            ${[
                ['Admin Panels',    'intitle:"admin" OR intitle:"login" OR inurl:admin'],
                ['Exposed .env',    'filetype:env "DB_PASSWORD" OR "APP_KEY"'],
                ['SQL Backups',     'filetype:sql intext:"INSERT INTO"'],
                ['Open Directories','intitle:"index of /" -html -htm'],
                ['Exposed Config',  'filetype:xml intext:"password" OR filetype:conf intext:"password"'],
                ['Camera Feeds',    'inurl:/view/index.shtml OR inurl:axis-cgi/mjpg'],
                ['Exposed Git',     'inurl:"/.git" "index of"'],
                ['Password Files',  'filetype:txt intext:"username" intext:"password"'],
                ['FTP Servers',     'intitle:"FTP root" inurl:ftp'],
                ['phpMyAdmin',      'inurl:phpmyadmin intext:"Welcome to phpMyAdmin"'],
                ['WordPress Login', 'inurl:wp-login.php site:target.com'],
                ['Cloud Buckets',   'site:s3.amazonaws.com "confidential" OR "internal"'],
            ].map(([name, dork]) => `
            <div style="display:flex; align-items:center; gap:12px; padding:10px;
                        background:var(--panel-light); border-radius:var(--radius-sm);
                        margin-bottom:6px; cursor:pointer;" onclick="loadDorkTemplate('${dork.replace(/'/g,"\\'")}')">
                <div style="flex:1;">
                    <div style="color:var(--text); font-weight:600; font-size:14px;">${name}</div>
                    <div style="color:var(--muted); font-size:12px; font-family:var(--font-mono);
                                margin-top:3px;">${dork}</div>
                </div>
                <button class="output-action-btn" onclick="event.stopPropagation(); copyText('${dork.replace(/'/g,"\\'")}', this)">Copy
                </button>
            </div>`).join('')}
        </div>
    </div>`;
}

let lastDork = '';

function runDorkBuilder(){
    const parts = [];
    const fields = {
        site: document.getElementById('dorkSite').value.trim(),
        inurl: document.getElementById('dorkInurl').value.trim(),
        intitle: document.getElementById('dorkIntitle').value.trim(),
        intext: document.getElementById('dorkIntext').value.trim(),
        filetype: document.getElementById('dorkFiletype').value.trim(),
        ext: document.getElementById('dorkExt').value.trim(),
        cache: document.getElementById('dorkCache').value.trim(),
        link: document.getElementById('dorkLink').value.trim(),
    };
    const extra = document.getElementById('dorkExtra').value.trim();

    Object.entries(fields).forEach(([k,v]) => { if(v) parts.push(`${k}:${v}`); });
    if(extra) parts.push(extra);

    if(!parts.length){ showToast('Fill at least one field', 'error'); return; }

    lastDork = parts.join(' ');
    setOutput('dorkOutput', lastDork);
    document.getElementById('dorkSearchBtn').style.display = 'block';
}

function searchDork(){
    if(lastDork) window.open('https://www.google.com/search?q='+encodeURIComponent(lastDork), '_blank');
}

function loadDorkTemplate(dork){
    document.getElementById('dorkExtra').value = dork;
    document.querySelector('[onclick*="dorkBuilder"]').click();
    setOutput('dorkOutput', dork);
    lastDork = dork;
    document.getElementById('dorkSearchBtn').style.display = 'block';
    showToast('Template loaded!');
}

function clearDork(){
    ['dorkSite','dorkInurl','dorkIntitle','dorkIntext','dorkFiletype','dorkExt','dorkCache','dorkLink','dorkExtra']
        .forEach(id => { const el = document.getElementById(id); if(el) el.value = ''; });
    const out = document.getElementById('dorkOutput');
    if(out) out.innerHTML = '<span style="color:var(--muted)">Result will appear here...</span>';
    document.getElementById('dorkSearchBtn').style.display = 'none';
}

// =========================
// SUBNET CALCULATOR
// =========================

function buildSubnetCalc(panel){
    panel.innerHTML = `
    ${toolHeader('', 'Subnet Calculator', 'CIDR and subnet calculations')}
    <div class="tool-wrap">
        <div class="tool-title">Subnet Calculator</div>
        <label>IP Address / CIDR Notation</label>
        <input type="text" id="subnetInput" placeholder="e.g. 192.168.1.0/24" oninput="runSubnetCalc()">
        ${createOutput('subnetOutput', 'Subnet Info')}
    </div>`;
}

function runSubnetCalc(){
    const input = document.getElementById('subnetInput').value.trim();
    if(!input) return;

    try{
        const [ipStr, cidrStr] = input.split('/');
        const cidr  = parseInt(cidrStr) || 24;
        const parts = ipStr.split('.').map(Number);
        if(parts.length !== 4 || parts.some(p => isNaN(p) || p<0 || p>255)) return;

        const ipInt  = (parts[0]<<24)|(parts[1]<<16)|(parts[2]<<8)|parts[3];
        const mask   = cidr === 0 ? 0 : (0xffffffff << (32-cidr)) >>> 0;
        const netInt = ipInt & mask;
        const bcast  = (netInt | (~mask >>> 0)) >>> 0;
        const first  = netInt + 1;
        const last   = bcast - 1;
        const hosts  = Math.max(0, bcast - netInt - 1);

        const toIP = n => [(n>>>24)&0xff,(n>>>16)&0xff,(n>>>8)&0xff,n&0xff].join('.');
        const toBin = n => [(n>>>24)&0xff,(n>>>16)&0xff,(n>>>8)&0xff,n&0xff]
            .map(b=>b.toString(2).padStart(8,'0')).join('.');

        const fields = [
            ['Network Address',  toIP(netInt)],
            ['Broadcast',        toIP(bcast)],
            ['Subnet Mask',      toIP(mask)],
            ['Wildcard Mask',    toIP(~mask>>>0)],
            ['First Host',       toIP(first)],
            ['Last Host',        toIP(last)],
            ['Usable Hosts',     hosts.toLocaleString()],
            ['CIDR',             `/${cidr}`],
            ['IP Binary',        toBin(ipInt)],
            ['Mask Binary',      toBin(mask)],
        ];

        const html = fields.map(([k,v]) => `
        <div style="display:flex; gap:12px; padding:8px; background:var(--panel-light);
                    border-radius:6px; margin-bottom:3px;">
            <span style="color:var(--primary); min-width:160px; font-size:13px;">${k}</span>
            <span style="color:var(--text); font-family:var(--font-mono); font-size:13px;">${v}</span>
        </div>`).join('');

        setOutput('subnetOutput', html, true);
    } catch(e){}
}

// =========================
// IP CONVERTER
// =========================

function buildIpConverter(panel){
    panel.innerHTML = `
    ${toolHeader('', 'IP Converter', 'Convert IP addresses between formats')}
    <div class="tool-wrap">
        <div class="tool-title">IP Converter</div>
        <label>Input (IP, integer, hex or binary)</label>
        <input type="text" id="ipConvInput" placeholder="e.g. 192.168.1.1 or 3232235777"
            oninput="runIpConverter()">
        ${createOutput('ipConvOutput', 'Conversions')}
    </div>`;
}

function runIpConverter(){
    const input = document.getElementById('ipConvInput').value.trim();
    if(!input) return;

    let ipInt;

    if(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(input)){
        const parts = input.split('.').map(Number);
        ipInt = ((parts[0]<<24)|(parts[1]<<16)|(parts[2]<<8)|parts[3]) >>> 0;
    } else if(/^\d+$/.test(input)){
        ipInt = parseInt(input) >>> 0;
    } else if(/^0x[0-9a-fA-F]+$/.test(input)){
        ipInt = parseInt(input, 16) >>> 0;
    } else if(/^[01]{32}$/.test(input.replace(/\s/g,''))){
        ipInt = parseInt(input.replace(/\s/g,''), 2) >>> 0;
    } else { return; }

    const toIP = n => [(n>>>24)&0xff,(n>>>16)&0xff,(n>>>8)&0xff,n&0xff].join('.');
    const ip   = toIP(ipInt);

    const fields = [
        ['Dotted Decimal', ip],
        ['Integer',        ipInt.toString()],
        ['Hexadecimal',    '0x' + ipInt.toString(16).padStart(8,'0').toUpperCase()],
        ['Binary',         [(ipInt>>>24)&0xff,(ipInt>>>16)&0xff,(ipInt>>>8)&0xff,ipInt&0xff]
            .map(b=>b.toString(2).padStart(8,'0')).join('.')],
        ['Octal',          [(ipInt>>>24)&0xff,(ipInt>>>16)&0xff,(ipInt>>>8)&0xff,ipInt&0xff]
            .map(b=>b.toString(8)).join('.')],
        ['Reverse DNS Format', ip.split('.').reverse().join('.')+'.in-addr.arpa'],
        ['PTR Record',     ip.split('.').reverse().join('.')+'.in-addr.arpa'],
    ];

    const html = fields.map(([k,v]) => `
    <div style="display:flex; gap:12px; padding:8px; background:var(--panel-light);
                border-radius:6px; margin-bottom:3px;">
        <span style="color:var(--primary); min-width:180px; font-size:13px;">${k}</span>
        <span style="color:var(--text); font-family:var(--font-mono); font-size:13px;">${v}</span>
    </div>`).join('');

    setOutput('ipConvOutput', html, true);
}

// =========================
// USERNAME GENERATOR
// =========================

function buildUsernameGen(panel){
    panel.innerHTML = `
    ${toolHeader('', 'Username Generator', 'Generate username variations for OSINT reconnaissance')}
    <div class="tool-wrap">
        <div class="tool-title">Username Generator</div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            <div>
                <label>First Name</label>
                <input type="text" id="unFirst" placeholder="John">
            </div>
            <div>
                <label>Last Name</label>
                <input type="text" id="unLast" placeholder="Doe">
            </div>
        </div>
        <label>Extra word (optional)</label>
        <input type="text" id="unExtra" placeholder="e.g. hacker, 1337, dev">
        <div class="button-group">
            <button class="btn btn-run" onclick="runUsernameGen()">Generate</button>
            <button class="btn btn-outline" onclick="clearUsernameGen()">Clear</button>
        </div>
        ${createOutput('unOutput', 'Username Variations')}
    </div>`;
}

function runUsernameGen(){
    const first = document.getElementById('unFirst').value.trim().toLowerCase();
    const last  = document.getElementById('unLast').value.trim().toLowerCase();
    const extra = document.getElementById('unExtra').value.trim().toLowerCase();
    if(!first && !last){ showToast('Enter a name', 'error'); return; }

    const f = first, l = last, e = extra;
    const fi = f[0] || '', li = l[0] || '';

    const variants = new Set([
        f, l, `${f}${l}`, `${l}${f}`, `${f}.${l}`, `${l}.${f}`,
        `${f}_${l}`, `${l}_${f}`, `${fi}${l}`, `${f}${li}`,
        `${f}${l}1`, `${f}${l}123`, `${f}${l}!`,
        `${f}${l}_`, `_${f}${l}`, `${fi}.${l}`,
        `${f}-${l}`, `${l}-${f}`, `${f}${l}2024`, `${f}${l}2025`,
        `real${f}${l}`, `the${f}${l}`, `${f}the${l}`,
        `x${f}${l}x`, `${f}x${l}`, `0x${fi}${l}`,
        ...(e ? [`${f}${e}`, `${e}${l}`, `${f}${l}${e}`, `${e}${f}${l}`] : [])
    ].filter(Boolean));

    const html = `
    <div style="margin-bottom:12px; color:var(--muted); font-size:13px;">
        Generated ${variants.size} variations
    </div>
    <div style="display:flex; flex-wrap:wrap; gap:6px;">
        ${[...variants].map(u => `
        <div style="background:var(--panel-light); padding:6px 12px; border-radius:20px;
                    font-family:var(--font-mono); font-size:13px; cursor:pointer; color:var(--text);"
             onclick="copyText('${u}', this)" title="Click to copy">
            ${u}
        </div>`).join('')}
    </div>
    <div style="margin-top:12px;">
        <button class="btn btn-outline btn-sm" onclick="copyAllUsernames()">Copy All</button>
    </div>`;

    setOutput('unOutput', html, true);
    window._lastUsernames = [...variants];
}

function copyAllUsernames(){
    if(window._lastUsernames) copyText(window._lastUsernames.join('\n'));
}

function clearUsernameGen(){
    ['unFirst','unLast','unExtra'].forEach(id => {
        const el = document.getElementById(id); if(el) el.value = '';
    });
    const out = document.getElementById('unOutput');
    if(out) out.innerHTML = '<span style="color:var(--muted)">Result will appear here...</span>';
}

// =========================
// SHODAN QUERY BUILDER
// =========================

function buildShodanBuilder(panel){
    panel.innerHTML = `
    ${toolHeader('', 'Shodan Query Builder', 'Build Shodan search queries')}
    <div class="tool-wrap">
        <div class="tool-title">Shodan Query Builder</div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            <div>
                <label>port:</label>
                <input type="text" id="shodPort" placeholder="22, 80, 443">
            </div>
            <div>
                <label>country:</label>
                <input type="text" id="shodCountry" placeholder="US, GB, DE">
            </div>
            <div>
                <label>org:</label>
                <input type="text" id="shodOrg" placeholder="Amazon, Microsoft">
            </div>
            <div>
                <label>hostname:</label>
                <input type="text" id="shodHost" placeholder="example.com">
            </div>
            <div>
                <label>os:</label>
                <input type="text" id="shodOs" placeholder="Windows, Linux">
            </div>
            <div>
                <label>product:</label>
                <input type="text" id="shodProduct" placeholder="Apache, nginx">
            </div>
        </div>
        <label style="margin-top:8px;">Banner text</label>
        <input type="text" id="shodBanner" placeholder='"220" OR "SSH"'>
        <div class="button-group" style="margin-top:12px;">
            <button class="btn btn-run" onclick="runShodanBuilder()">Build Query</button>
            <button class="btn btn-outline" onclick="clearShodan()">Clear</button>
        </div>
        ${createOutput('shodanOutput', 'Shodan Query')}

        <div style="margin-top:16px;">
            <div style="color:var(--muted); font-size:12px; margin-bottom:8px;">QUICK TEMPLATES</div>
            ${[
                ['Open RDP',       'port:3389 country:US'],
                ['Open SSH',       'port:22 product:OpenSSH'],
                ['MongoDB',        'product:MongoDB port:27017'],
                ['Elasticsearch',  'port:9200 product:Elastic'],
                ['VNC No Auth',    'port:5900 authentication disabled'],
                ['Default Creds',  '"default password" port:80'],
                ['ICS/SCADA',      'port:102 product:Siemens'],
                ['Webcams',        'product:"webcam" has_screenshot:true'],
            ].map(([name,q]) => `
            <div style="display:flex; align-items:center; gap:10px; padding:7px;
                        background:var(--panel-light); border-radius:6px; margin-bottom:3px;">
                <span style="color:var(--text); min-width:140px; font-size:13px;">${name}</span>
                <code style="color:var(--primary); flex:1; font-size:12px;">${q}</code>
                <button class="output-action-btn" onclick="copyText('${q}', this)">Copy</button>
            </div>`).join('')}
        </div>
    </div>`;
}

function runShodanBuilder(){
    const parts = [];
    const fields = {
        port:    document.getElementById('shodPort').value.trim(),
        country: document.getElementById('shodCountry').value.trim(),
        org:     document.getElementById('shodOrg').value.trim(),
        hostname:document.getElementById('shodHost').value.trim(),
        os:      document.getElementById('shodOs').value.trim(),
        product: document.getElementById('shodProduct').value.trim(),
    };
    const banner = document.getElementById('shodBanner').value.trim();
    Object.entries(fields).forEach(([k,v]) => { if(v) parts.push(`${k}:${v}`); });
    if(banner) parts.push(banner);
    if(!parts.length){ showToast('Fill at least one field', 'error'); return; }
    setOutput('shodanOutput', parts.join(' '));
}

function clearShodan(){
    ['shodPort','shodCountry','shodOrg','shodHost','shodOs','shodProduct','shodBanner']
        .forEach(id => { const el = document.getElementById(id); if(el) el.value = ''; });
    const out = document.getElementById('shodanOutput');
    if(out) out.innerHTML = '<span style="color:var(--muted)">Result will appear here...</span>';
}

// =========================
// EMAIL FORMAT GUESSER
// =========================

function buildEmailGuesser(panel){
    panel.innerHTML = `
    ${toolHeader('', 'Email Format Guesser', 'Guess corporate email formats for OSINT')}
    <div class="tool-wrap">
        <div class="tool-title">Email Format Guesser</div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            <div>
                <label>First Name</label>
                <input type="text" id="emailFirst" placeholder="John">
            </div>
            <div>
                <label>Last Name</label>
                <input type="text" id="emailLast" placeholder="Doe">
            </div>
        </div>
        <label>Company Domain</label>
        <input type="text" id="emailDomain" placeholder="company.com">
        <div class="button-group">
            <button class="btn btn-run" onclick="runEmailGuesser()">Generate Formats</button>
            <button class="btn btn-outline" onclick="clearEmailGuesser()">Clear</button>
        </div>
        ${createOutput('emailOutput', 'Email Variations')}
    </div>`;
}

function runEmailGuesser(){
    const first  = document.getElementById('emailFirst').value.trim().toLowerCase();
    const last   = document.getElementById('emailLast').value.trim().toLowerCase();
    const domain = document.getElementById('emailDomain').value.trim().toLowerCase();
    if(!first || !last || !domain){ showToast('Fill all fields', 'error'); return; }

    const fi = first[0], li = last[0];
    const formats = [
        { format: 'first.last@domain',    email: `${first}.${last}@${domain}` },
        { format: 'firstlast@domain',     email: `${first}${last}@${domain}` },
        { format: 'f.last@domain',        email: `${fi}.${last}@${domain}` },
        { format: 'flast@domain',         email: `${fi}${last}@${domain}` },
        { format: 'first@domain',         email: `${first}@${domain}` },
        { format: 'last@domain',          email: `${last}@${domain}` },
        { format: 'last.first@domain',    email: `${last}.${first}@${domain}` },
        { format: 'lastfirst@domain',     email: `${last}${first}@${domain}` },
        { format: 'first_last@domain',    email: `${first}_${last}@${domain}` },
        { format: 'first-last@domain',    email: `${first}-${last}@${domain}` },
        { format: 'firstl@domain',        email: `${first}${li}@${domain}` },
        { format: 'l.first@domain',       email: `${li}.${first}@${domain}` },
    ];

    const html = `
    <div style="margin-bottom:12px; color:var(--muted); font-size:13px;">
        ${formats.length} common corporate email formats
    </div>
    ${formats.map(({format,email}) => `
    <div style="display:flex; gap:12px; padding:8px; background:var(--panel-light);
                border-radius:6px; margin-bottom:4px; align-items:center;">
        <span style="color:var(--muted); min-width:160px; font-size:12px;">${format}</span>
        <span style="color:var(--primary); font-family:var(--font-mono); flex:1; font-size:13px;">${email}</span>
        <button class="output-action-btn" onclick="copyText('${email}', this)">Copy</button>
    </div>`).join('')}
    <div style="margin-top:10px;">
        <button class="btn btn-outline btn-sm"
            onclick="copyText('${formats.map(f=>f.email).join('\\n')}')">Copy All
        </button>
    </div>`;

    setOutput('emailOutput', html, true);
}

function clearEmailGuesser(){
    ['emailFirst','emailLast','emailDomain'].forEach(id => {
        const el = document.getElementById(id); if(el) el.value = '';
    });
    const out = document.getElementById('emailOutput');
    if(out) out.innerHTML = '<span style="color:var(--muted)">Result will appear here...</span>';
}