 
const TOOL_BUILDERS = {
    challengeAdvisor: buildChallengeAdvisor,
    flagDetector: buildFlagDetector,
    autoDecoder: buildAutoDecoder,
    ctfNotepad: buildCtfNotepad,
    toolChainer: buildToolChainer,
    jwtDecoder: buildJwtDecoder,
    jwtForger: buildJwtForger,
    cookieParser: buildCookieParser,
    urlParser: buildUrlParser,
    headerParser: buildHeaderParser,
    htmlEncoderDecoder: buildHtmlEncoderDecoder,
    payloadLibrary: buildPayloadLibrary,
    curlBuilder: buildCurlBuilder,
    corsGenerator: buildCorsGenerator,
    sqliTamper: buildSqliTamper,
    hashGenerator: buildHashGenerator,
    hashCracker: buildHashCracker,
    hashIdentifier: buildHashIdentifier,
    encoder: buildEncoder,
    decoder: buildDecoder,
    caesarCipher: buildCaesarCipher,
    vigenereCipher: buildVigenereCipher,
    xorTool: buildXorTool,
    atbashCipher: buildAtbashCipher,
    frequencyAnalyzer: buildFrequencyAnalyzer,
    rsaTool: buildRsaTool,
    aesTool: buildAesTool,
    baseConverter: buildBaseConverter,
    hmacGenerator: buildHmacGenerator,
    asciiConverter: buildAsciiConverter,
    playfairCipher: buildPlayfairCipher,
    affineCipher: buildAffineCipher,
    baconCipher: buildBaconCipher,
    polybiusSquare: buildPolybiusSquare,
    numberTheory: buildNumberTheory,
    patternGen: buildPatternGen,
    shellcodeEncoder: buildShellcodeEncoder,
    stringHexConverter: buildStringHexConverter,
    elfParser: buildElfParser,
    ropReference: buildRopReference,
    asmConverter: buildAsmConverter,
    hexViewer: buildHexViewer,
    stringsExtractor: buildStringsExtractor,
    magicBytes: buildMagicBytes,
    regexTester: buildRegexTester,
    deobfuscator: buildDeobfuscator,
    disasmRef: buildDisasmRef,
    hexDump: buildHexDump,
    metadataExtractor: buildMetadataExtractor,
    lsbDetector: buildLsbDetector,
    entropyAnalyzer: buildEntropyAnalyzer,
    pngAnalyzer: buildPngAnalyzer,
    fileHasher: buildFileHasher,
    binwalkRef: buildBinwalkRef,
    dorkBuilder: buildDorkBuilder,
    subnetCalc: buildSubnetCalc,
    ipConverter: buildIpConverter,
    usernameGen: buildUsernameGen,
    shodanBuilder: buildShodanBuilder,
    emailGuesser: buildEmailGuesser,
    diffChecker: buildDiffChecker,
    timestampConverter: buildTimestampConverter,
    qrTool: buildQrTool,
    morseTool: buildMorseTool,
    passwordGen: buildPasswordGen,
    wordlistGen: buildWordlistGen,
    uuidTool: buildUuidTool,
};

const TOOL_NAMES = {
    challengeAdvisor: 'Challenge Flow Advisor',
    flagDetector: 'Flag Auto-Detector',
    autoDecoder: 'Auto Decoder',
    ctfNotepad: 'CTF Notepad',
    toolChainer: 'Tool Chainer',
    jwtDecoder: 'JWT Decoder',
    jwtForger: 'JWT Forger',
    cookieParser: 'Cookie Parser',
    urlParser: 'URL Parser',
    headerParser: 'Header Parser',
    htmlEncoderDecoder: 'HTML Encoder/Decoder',
    payloadLibrary: 'Payload Library',
    curlBuilder: 'cURL Builder',
    corsGenerator: 'CORS Bypass Generator',
    sqliTamper: 'SQLi WAF Tamper',
    hashGenerator: 'Hash Generator',
    hashCracker: 'Hash Cracker',
    hashIdentifier: 'Hash Identifier',
    encoder: 'Encoder',
    decoder: 'Decoder',
    caesarCipher: 'Caesar / ROT',
    vigenereCipher: 'Vigenere Cipher',
    xorTool: 'XOR Tool',
    atbashCipher: 'Atbash / Rail Fence',
    frequencyAnalyzer: 'Frequency Analyzer',
    rsaTool: 'RSA Tool',
    aesTool: 'AES Tool',
    baseConverter: 'Base Converter',
    hmacGenerator: 'HMAC Generator',
    asciiConverter: 'ASCII Converter',
    playfairCipher: 'Playfair Cipher',
    affineCipher: 'Affine Cipher',
    baconCipher: 'Bacon Cipher',
    polybiusSquare: 'Polybius Square',
    numberTheory: 'Number Theory',
    patternGen: 'Pattern Generator',
    shellcodeEncoder: 'Shellcode Encoder',
    stringHexConverter: 'String / Hex',
    elfParser: 'ELF Header Parser',
    ropReference: 'ROP Reference',
    asmConverter: 'Assembly Reference',
    hexViewer: 'Hex Viewer',
    stringsExtractor: 'Strings Extractor',
    magicBytes: 'Magic Bytes ID',
    regexTester: 'Regex Tester',
    deobfuscator: 'JS Deobfuscator',
    disasmRef: 'Disasm Reference',
    hexDump: 'Hex Dump',
    metadataExtractor: 'Metadata Extractor',
    lsbDetector: 'LSB Stego Detector',
    entropyAnalyzer: 'Entropy Analyzer',
    pngAnalyzer: 'PNG Chunk Analyzer',
    fileHasher: 'File Hasher',
    binwalkRef: 'Forensics Reference',
    dorkBuilder: 'Google Dork Builder',
    subnetCalc: 'Subnet Calculator',
    ipConverter: 'IP Converter',
    usernameGen: 'Username Generator',
    shodanBuilder: 'Shodan Query Builder',
    emailGuesser: 'Email Format Guesser',
    diffChecker: 'Diff Checker',
    timestampConverter: 'Timestamp Converter',
    qrTool: 'QR Code Tool',
    morseTool: 'Morse Code',
    passwordGen: 'Password Generator',
    wordlistGen: 'Wordlist Generator',
    uuidTool: 'UUID Tool',
};

const THEMES = ['cyber', 'hacker', 'midnight', 'pink', 'yellow'];
let appState = { viewId: 'dashboard', toolId: null };
let appHistoryDepth = 0;

function setTheme(theme){
    const nextTheme = THEMES.includes(theme) ? theme : 'cyber';

    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem('blackbox:theme', nextTheme);

    document.querySelectorAll('.theme-dot').forEach(dot => {
        dot.classList.toggle('active', dot.classList.contains(nextTheme));
    });
}

function statesEqual(a, b){
    return a?.viewId === b?.viewId && (a?.toolId || null) === (b?.toolId || null);
}

function getStateUrl(state){
    return state.toolId ? `#${state.viewId}/${state.toolId}` : `#${state.viewId}`;
}

function parseHashState(){
    const hash = window.location.hash.replace(/^#/, '');
    if(!hash) return null;

    const [viewId, toolId] = hash.split('/');
    if(!document.getElementById(viewId)) return null;
    if(toolId && !document.getElementById(toolId)) return { viewId, toolId: null };
    return { viewId, toolId: toolId || null };
}

function setActiveNav(viewId){
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('onclick') === `showView('${viewId}')`);
    });
}

function applyState(state, options = {}){
    const nextState = {
        viewId: state?.viewId || 'dashboard',
        toolId: state?.toolId || null,
    };

    document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));
    const view = document.getElementById(nextState.viewId);
    if(!view) return;

    view.classList.add('active');
    setActiveNav(nextState.viewId);

    if(nextState.toolId){
        const panel = document.getElementById(nextState.toolId);
        const builder = TOOL_BUILDERS[nextState.toolId];

        if(!panel || !builder){
            resetToolPreview(view, false);
            appState = { viewId: nextState.viewId, toolId: null };
            return;
        }

        if(!panel.dataset.built){
            builder(panel);
            panel.dataset.built = 'true';
        }

        addToolBackButton(panel);
        addToolTab(view, nextState.toolId);
        clearToolPanels(view);
        panel.style.display = 'block';
        setActiveToolTab(view, nextState.toolId);

        if(options.scroll !== false){
            panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    } else {
        resetToolPreview(view, false);
        if(options.scroll){
            (view.querySelector('.card-grid') || view).scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    appState = nextState;
}

function navigateToState(state, options = {}){
    const nextState = {
        viewId: state?.viewId || 'dashboard',
        toolId: state?.toolId || null,
    };

    if(statesEqual(appState, nextState) && !options.force){
        applyState(nextState, options);
        return;
    }

    if(options.replace){
        window.history.replaceState(nextState, '', getStateUrl(nextState));
    } else if(options.push !== false){
        window.history.pushState(nextState, '', getStateUrl(nextState));
        appHistoryDepth++;
    }

    applyState(nextState, options);
}

function goBack(){
    if(appHistoryDepth > 0){
        window.history.back();
        return;
    }

    if(appState.toolId){
        navigateToState({ viewId: appState.viewId, toolId: null }, { replace: true, scroll: true });
        return;
    }

    if(appState.viewId !== 'dashboard'){
        navigateToState({ viewId: 'dashboard', toolId: null }, { replace: true, scroll: true });
    }
}

function showView(viewId, options = {}){
    navigateToState(
        { viewId, toolId: null },
        { push: options.push !== false, replace: options.replace, scroll: options.scroll !== false }
    );
}

function resetToolPreview(view, shouldScroll = true){
    if(!view) return;
    clearToolPanels(view);
    view.querySelectorAll('.tool-tab').forEach(tab => tab.remove());
    view.querySelectorAll('.tool-tabs').forEach(tabs => {
        if(!tabs.children.length) tabs.remove();
    });

    if(shouldScroll){
        (view.querySelector('.card-grid') || view).scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function showToolPreview(viewOrId){
    const view = typeof viewOrId === 'string' ? document.getElementById(viewOrId) : viewOrId;
    if(!view) return;
    navigateToState({ viewId: view.id, toolId: null }, { scroll: true });
}

function addToolBackButton(panel){
    if(!panel || panel.querySelector('.back-btn')) return;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'back-btn';
    button.textContent = 'Back';
    button.addEventListener('click', goBack);
    panel.prepend(button);
}

function ensureToolTabs(parentView){
    if(!parentView) return null;
    let tabs = parentView.querySelector(':scope > .tool-tabs');
    if(tabs) return tabs;

    tabs = document.createElement('div');
    tabs.className = 'tool-tabs';

    const firstPanel = parentView.querySelector('.tool-panel');
    parentView.insertBefore(tabs, firstPanel);
    return tabs;
}

function setActiveToolTab(parentView, toolId){
    parentView.querySelectorAll('.tool-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.toolId === toolId);
    });
}

function addToolTab(parentView, toolId){
    const tabs = ensureToolTabs(parentView);
    if(!tabs) return;

    const existing = tabs.querySelector(`[data-tool-id="${toolId}"]`);
    if(existing){
        setActiveToolTab(parentView, toolId);
        return;
    }

    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'tool-tab';
    tab.dataset.toolId = toolId;
    tab.innerHTML = `
        <span>${TOOL_NAMES[toolId] || toolId}</span>
        <span class="tool-tab-close" aria-label="Close tab">x</span>
    `;
    tab.addEventListener('click', (event) => {
        if(event.target.classList.contains('tool-tab-close')){
            closeToolTab(parentView, toolId);
            event.stopPropagation();
            return;
        }
        activateToolTab(parentView, toolId);
    });
    tabs.appendChild(tab);
    setActiveToolTab(parentView, toolId);
}

function activateToolTab(parentView, toolId){
    if(!parentView || !toolId) return;
    navigateToState({ viewId: parentView.id, toolId }, { scroll: true });
}

function closeToolTab(parentView, toolId){
    const tabs = ensureToolTabs(parentView);
    const tab = tabs?.querySelector(`[data-tool-id="${toolId}"]`);
    const panel = document.getElementById(toolId);
    const wasActive = tab?.classList.contains('active');

    if(tab) tab.remove();
    if(panel) panel.style.display = 'none';

    if(wasActive){
        const nextTab = tabs?.querySelector('.tool-tab:last-child');
        if(nextTab) navigateToState({ viewId: parentView.id, toolId: nextTab.dataset.toolId }, { replace: true, scroll: true });
        else navigateToState({ viewId: parentView.id, toolId: null }, { replace: true, scroll: true });
    }
}

function showTool(toolId){
    const panel = document.getElementById(toolId);
    if(!panel){
        showToast('Tool panel not found', 'error');
        return;
    }

    const parentView = panel.closest('.view');
    if(!parentView) return;
    navigateToState({ viewId: parentView.id, toolId }, { scroll: true });
}

function normalizeSearch(value){
    return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function getToolCards(){
    return [...document.querySelectorAll('.card[onclick^="showTool"]')];
}

function getToolIdFromCard(card){
    const action = card.getAttribute('onclick') || '';
    const match = action.match(/showTool\('([^']+)'\)/);
    return match ? match[1] : null;
}

function getToolSearchItems(){
    return getToolCards().map(card => {
        const title = card.querySelector('.card-title')?.textContent.trim() || '';
        const desc = card.querySelector('.card-desc')?.textContent.trim() || '';
        const view = card.closest('.view');
        const section = view?.querySelector('.view-header h2')?.textContent.trim() || '';
        return {
            id: getToolIdFromCard(card),
            title,
            desc,
            section,
            titleKey: normalizeSearch(title),
            descKey: normalizeSearch(desc),
            card,
        };
    }).filter(item => item.id && item.title);
}

function getToolMatches(query){
    const q = normalizeSearch(query);
    if(!q) return [];

    return getToolSearchItems()
        .map(item => {
            let score = 0;
            if(item.titleKey === q) score = 100;
            else if(item.titleKey.startsWith(q)) score = 80;
            else if(item.titleKey.includes(q)) score = 60;
            else if(item.descKey.includes(q)) score = 30;
            return { ...item, score };
        })
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
}

function setupSidebarSearch(){
    const input = document.getElementById('sidebarSearch');
    if(!input) return;
    input.addEventListener('input', () => {
        const matches = new Set(getToolMatches(input.value).map(item => item.id));
        const hasQuery = normalizeSearch(input.value).length > 0;

        document.querySelectorAll('.card').forEach(card => {
            const toolId = getToolIdFromCard(card);
            if(!hasQuery){
                card.style.display = '';
                return;
            }
            card.style.display = toolId && matches.has(toolId) ? '' : 'none';
        });
    });
}

function setupGlobalSearch(){
    const input = document.getElementById('globalSearch');
    const results = document.getElementById('searchResults');
    if(!input || !results) return;

    const closeResults = () => {
        results.classList.remove('open');
        results.innerHTML = '';
    };

    const openResult = (item) => {
        if(!item) return;
        input.value = '';
        closeResults();
        showTool(item.id);
    };

    const render = () => {
        const matches = getToolMatches(input.value);
        if(!normalizeSearch(input.value)){
            closeResults();
            return;
        }

        if(!matches.length){
            results.innerHTML = '<div class="search-no-results">No matching tool</div>';
            results.classList.add('open');
            return;
        }

        results.innerHTML = matches.slice(0, 8).map((item, index) => `
            <div class="search-result-item${index === 0 ? ' active' : ''}" data-tool-id="${item.id}">
                <div>
                    <div class="result-name">${item.title}</div>
                    <div class="result-section">${item.section}</div>
                </div>
            </div>
        `).join('');
        results.classList.add('open');

        results.querySelectorAll('.search-result-item').forEach(row => {
            row.addEventListener('click', () => {
                openResult(matches.find(item => item.id === row.dataset.toolId));
            });
        });
    };

    input.addEventListener('input', render);
    input.addEventListener('keydown', (e) => {
        if(e.key === 'Enter'){
            const first = getToolMatches(input.value)[0];
            if(first){
                e.preventDefault();
                openResult(first);
            }
        }
        if(e.key === 'Escape') closeResults();
    });

    document.addEventListener('click', (e) => {
        if(!e.target.closest('.topbar-search')) closeResults();
    });
}

document.addEventListener('DOMContentLoaded', () => {
    setTheme(localStorage.getItem('blackbox:theme') || document.documentElement.dataset.theme);
    setupSidebarSearch();
    setupGlobalSearch();

    const initialState = parseHashState() || { viewId: 'dashboard', toolId: null };
    navigateToState(initialState, { replace: true, scroll: false, force: true });

    window.addEventListener('popstate', (event) => {
        if(appHistoryDepth > 0) appHistoryDepth--;
        applyState(event.state || parseHashState() || { viewId: 'dashboard', toolId: null }, { scroll: true });
    });

    document.addEventListener('keydown', (e) => {
        if(e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)){
            e.preventDefault();
            document.getElementById('globalSearch')?.focus();
        }
        if(e.key === 'Escape'){
            goBack();
        }
    });
});
