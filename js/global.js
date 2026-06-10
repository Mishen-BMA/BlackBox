const TOOL_PLACEHOLDER = '<span style="color:var(--muted)">Result will appear here...</span>';

function escapeHtml(value){
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function toolHeader(icon, title, description){
    return `
        <div class="tool-header">
            <div>
                <h3>${escapeHtml(title)}</h3>
                <p>${escapeHtml(description)}</p>
            </div>
        </div>
    `;
}

function createOutput(id, label){
    return `
        <label for="${id}">${escapeHtml(label)}</label>
        <div id="${id}" class="output-box">${TOOL_PLACEHOLDER}</div>
    `;
}

function setOutput(id, value, isHtml = false){
    const out = document.getElementById(id);
    if(!out) return;
    out.innerHTML = isHtml ? value : escapeHtml(value).replace(/\n/g, '<br>');
}

async function copyText(text, btn){
    try{
        await navigator.clipboard.writeText(String(text));
        if(btn){
            const old = btn.textContent;
            btn.textContent = 'Copied';
            setTimeout(() => { btn.textContent = old; }, 1000);
        }
        showToast('Copied to clipboard');
    } catch(e){
        showToast('Copy failed', 'error');
    }
}

function getOutputText(outputId){
    const out = document.getElementById(outputId);
    if(!out) return '';
    return out.innerText || out.textContent || '';
}

function copyOutput(outputId, btn){
    const text = getOutputText(outputId);
    if(!text.trim()){
        showToast('Nothing to copy', 'warning');
        return;
    }
    copyText(text, btn);
}

function exportOutput(outputId, filename = 'blackbox-output.txt'){
    const text = getOutputText(outputId);
    if(!text.trim()){
        showToast('Nothing to save', 'warning');
        return;
    }

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}

function showToast(message, type = 'success'){
    let toast = document.getElementById('toast');
    if(!toast){
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.style.cssText = `
            position:fixed; right:18px; bottom:18px; z-index:9999;
            padding:10px 14px; border-radius:8px; color:var(--text);
            background:var(--panel); border:1px solid var(--border);
            box-shadow:0 8px 24px rgba(0,0,0,.28); font-size:13px;
            opacity:0; transform:translateY(8px); transition:.18s ease;
        `;
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.borderColor = type === 'error' ? 'var(--danger)' : 'var(--primary)';
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
    clearTimeout(toast.hideTimer);
    toast.hideTimer = setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(8px)';
    }, 1800);
}

function autoSaveInput(inputId, key){
    const el = document.getElementById(inputId);
    if(!el) return;
    const storageKey = `blackbox:${key}:${inputId}`;
    const saved = localStorage.getItem(storageKey);
    if(saved !== null && !el.value) el.value = saved;
    el.addEventListener('input', () => localStorage.setItem(storageKey, el.value));
}

function clearToolPanels(scope = document){
    scope.querySelectorAll('.tool-panel').forEach(panel => {
        panel.style.display = 'none';
    });
}
