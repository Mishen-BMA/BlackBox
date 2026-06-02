// =========================
// HASH GENERATOR
// =========================

function generateHash(type){

    const text =
    document.getElementById(
        "hashText"
    ).value;

    if(!text){

        document.getElementById(
            "hashOutput"
        ).innerHTML =
        "Enter text first.";

        return;
    }

    let hash = "";

    switch(type){

        case "md5":
            hash =
            CryptoJS.MD5(text)
            .toString();
            break;

        case "sha1":
            hash =
            CryptoJS.SHA1(text)
            .toString();
            break;

        case "sha256":
            hash =
            CryptoJS.SHA256(text)
            .toString();
            break;

        case "sha512":
            hash =
            CryptoJS.SHA512(text)
            .toString();
            break;
    }

    document.getElementById(
        "hashOutput"
    ).innerHTML =
    hash;
}

// =========================
// WORDLIST LOADER
// =========================

async function loadWordlist(path){

    try{

        const response =
        await fetch(path);

        if(!response.ok){

            throw new Error(
                "Failed to load " + path
            );

        }

        const text =
        await response.text();

        return text
            .split("\n")
            .map(word => word.trim())
            .filter(word => word);

    }

    catch(error){

        console.error(error);

        return [];
    }
}

// =========================
// HASH CRACKER
// =========================

async function crackHash(){

    const hash =
    document.getElementById(
        "crackInput"
    )
    .value
    .trim()
    .toLowerCase();

    if(!hash){

        document.getElementById(
            "crackOutput"
        ).innerHTML =
        "Paste a hash.";

        return;
    }

    const status =
    document.getElementById(
        "crackStatus"
    );

    const output =
    document.getElementById(
        "crackOutput"
    );

    status.innerHTML =
    "Loading wordlists...";

    let words = [];

    const selected =
    document.getElementById(
        "wordlistSelect"
    ).value;

    if(selected === "all" || selected === "common"){

        words.push(
            ...(await loadWordlist(
                "assets/wordlists/common-passwords.txt"
            ))
        );
    }

    if(selected === "all" || selected === "rockyou"){

        words.push(
            ...(await loadWordlist(
                "assets/wordlists/rockyou-mini.txt"
            ))
        );
    }

    if(selected === "all" || selected === "ctf"){

        words.push(
            ...(await loadWordlist(
                "assets/wordlists/ctf-common.txt"
            ))
        );
    }

    const customWords =
    document
    .getElementById(
        "wordlistInput"
    )
    .value
    .split("\n")
    .map(word => word.trim())
    .filter(word => word);

    words.push(...customWords);

    const fileInput =
    document.getElementById(
        "wordlistFile"
    );

    if(fileInput.files.length > 0){

        const file =
        fileInput.files[0];

        const fileText =
        await file.text();

        const uploadedWords =
        fileText
        .split("\n")
        .map(word => word.trim())
        .filter(word => word);

        words.push(
            ...uploadedWords
        );
    }

    words =
    [...new Set(words)];

    status.innerHTML =
    `Checking ${words.length} words...`;

    const startTime =
    performance.now();

    for(const word of words){

        const hashes = {

            md5:
            CryptoJS.MD5(word)
            .toString(),

            sha1:
            CryptoJS.SHA1(word)
            .toString(),

            sha256:
            CryptoJS.SHA256(word)
            .toString(),

            sha512:
            CryptoJS.SHA512(word)
            .toString()
        };

        let type = null;

        if(hash === hashes.md5){
            type = "MD5";
        }

        else if(hash === hashes.sha1){
            type = "SHA1";
        }

        else if(hash === hashes.sha256){
            type = "SHA256";
        }

        else if(hash === hashes.sha512){
            type = "SHA512";
        }

        if(type){

            const endTime =
            performance.now();

            const duration =
            (
                (endTime-startTime)
                /1000
            ).toFixed(2);

            output.innerHTML = `
                <h3>Match Found</h3>

                <br>

                Plaintext:
                <strong>${word}</strong>

                <br>

                Type:
                <strong>${type}</strong>
            `;
            
            status.innerHTML = `
<h3>Analysis</h3>

<br>

<p><strong>Wordlist:</strong> ${selected}</p>

<p><strong>Words Checked:</strong> ${words.length}</p>

<p><strong>Time:</strong> ${duration}s</p>
`;

            return;
        }
    }

    const endTime =
    performance.now();

    const duration =
    (
        (endTime-startTime)
        /1000
    ).toFixed(2);

    status.innerHTML = `
<h3>Analysis</h3>

<p><strong>Wordlist:</strong> ${selected}</p>

<p><strong>Words Checked:</strong> ${words.length}</p>

<p><strong>Time:</strong> ${duration}s</p>
`;

    status.innerHTML = `
        <h3>Analysis</h3>

        <br>

        Wordlist:
        ${selected}

        <br>

        Words Checked:
        ${words.length}

        <br>

        Time:
        ${duration}s

        <br>

        Result:
        No Match Found
    `;
}

// =========================
// ENCODING
// =========================

function encodeBase64(){

    document.getElementById(
        "encodeOutput"
    ).innerHTML =
    btoa(
        document.getElementById(
            "encodeInput"
        ).value
    );
}

function encodeURL(){

    document.getElementById(
        "encodeOutput"
    ).innerHTML =
    encodeURIComponent(
        document.getElementById(
            "encodeInput"
        ).value
    );
}

function encodeHex(){

    const text =
    document.getElementById(
        "encodeInput"
    ).value;

    let result = "";

    for(let i=0;i<text.length;i++){

        result +=
        text.charCodeAt(i)
        .toString(16);
    }

    document.getElementById(
        "encodeOutput"
    ).innerHTML =
    result;
}

function encodeBinary(){

    const text =
    document.getElementById(
        "encodeInput"
    ).value;

    let result = "";

    for(let i=0;i<text.length;i++){

        result +=
        text.charCodeAt(i)
        .toString(2)
        .padStart(8,"0")
        + " ";
    }

    document.getElementById(
        "encodeOutput"
    ).innerHTML =
    result.trim();
}


// =========================
// DECODING
// =========================

function decodeBase64(){

    try{

        document.getElementById(
            "decodeOutput"
        ).innerHTML =
        atob(
            document.getElementById(
                "decodeInput"
            ).value
        );

    }

    catch{

        document.getElementById(
            "decodeOutput"
        ).innerHTML =
        "Invalid Base64";
    }
}

function decodeURL(){

    try{

        document.getElementById(
            "decodeOutput"
        ).innerHTML =

        decodeURIComponent(

            document.getElementById(
                "decodeInput"
            ).value

        );

    }

    catch{

        document.getElementById(
            "decodeOutput"
        ).innerHTML =
        "Invalid URL";
    }
}

function decodeHex(){

    try{

        const hex =

        document.getElementById(
            "decodeInput"
        ).value
        .replace(/\s/g,'');

        let result = "";

        for(let i=0;i<hex.length;i+=2){

            result +=
            String.fromCharCode(

                parseInt(
                    hex.substr(i,2),
                    16
                )

            );
        }

        document.getElementById(
            "decodeOutput"
        ).innerHTML =
        result;
    }

    catch{

        document.getElementById(
            "decodeOutput"
        ).innerHTML =
        "Invalid Hex";
    }
}

function decodeBinary(){

    try{

        const binary =

        document.getElementById(
            "decodeInput"
        ).value
        .trim()
        .split(" ");

        let result = "";

        binary.forEach(bit => {

            result +=

            String.fromCharCode(

                parseInt(
                    bit,
                    2
                )

            );

        });

        document.getElementById(
            "decodeOutput"
        ).innerHTML =
        result;
    }

    catch{

        document.getElementById(
            "decodeOutput"
        ).innerHTML =
        "Invalid Binary";
    }
}

// =========================
// IDENTIFIER
// =========================

function analyzeInput(){

    const input =
    document.getElementById(
        "analysisInput"
    ).value.trim();

    let result =
    "Unknown";

    if(input.length === 32){

        result =
        "Possible MD5 Hash";
    }

    else if(input.length === 40){

        result =
        "Possible SHA1 Hash";
    }

    else if(input.length === 64){

        result =
        "Possible SHA256 Hash";
    }

    else if(input.length === 128){

        result =
        "Possible SHA512 Hash";
    }

    else if(
    /^[A-Za-z0-9+/=]+$/
    .test(input)
    &&
    input.length % 4 === 0
){
    result =
    "Possible Base64";
}

else if(
    /^[0-9A-Fa-f]+$/
    .test(input)
){
    result =
    "Possible Hex";
}

else if(
    /^[01\s]+$/
    .test(input)
){
    result =
    "Possible Binary";
}

else if(
    input.includes("%")
){
    result =
    "Possible URL Encoding";
}

    document.getElementById(
        "analysisOutput"
    ).innerHTML =
    result;
}
