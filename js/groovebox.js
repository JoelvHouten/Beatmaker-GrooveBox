// vind elementen
const grid = document.getElementById("grid");
const clearBtn = document.getElementById("clear");

// clear knop om grid te legen
clearBtn.addEventListener("click", () => {
    document.querySelectorAll(".step").forEach(s => s.classList.remove("active"));
});

// BPM tekst behouden bij invullen
const bpmInput = document.getElementById("bpm");
function getBPM() {
    const value = bpmInput.value.replace("BPM:", "").trim();
    const num = parseInt(value, 10);
    return isNaN(num) ? 90 : num;
}
bpmInput.addEventListener("input", () => {
    if (!bpmInput.value.startsWith("BPM:")) {
        bpmInput.value = "BPM: " + bpmInput.value.replace(/[^0-9]/g, "");
    }
});
bpmInput.addEventListener("blur", () => {
    const bpm = getBPM();
    bpmInput.value = "BPM: " + bpm;
    updateTempo();
});

// kits met paden naar de samples
const kits = {
    rock: {
        "Hihat (foot)": "samples/rock/hihat_foot.mp3",
        "Hihat (open)": "samples/rock/hihat_open.mp3",
        "High tom ": "samples/rock/tom_high.mp3",
        "Medium tom": "samples/rock/tom_medium.mp3",
        "Floor tom": "samples/rock/floor_tom.mp3",
        "Ride cymbal": "samples/rock/ride.mp3",
        "Hihat": "samples/rock/hihat.mp3",
        "Snare drum": "samples/rock/snare.mp3",
        "Snare stick": "samples/rock/snare_stick.mp3",
        "Bass drum": "samples/rock/kick.mp3"
    },
    jazz: {
        "Brush": "samples/jazz/brush.wav",
        "Percussion 4": "samples/jazz/perc-4.wav",
        "Percussion 3": "samples/jazz/perc-3.wav",
        "Percussion 2": "samples/jazz/perc-2.wav",
        "Percussion 1": "samples/jazz/perc-1.wav",
        "Hihat": "samples/jazz/hihat.wav",
        "Snare": "samples/jazz/snare.wav",
        "Bass drum": "samples/jazz/bass-drum.wav"
    },
    house: {
        "Clap": "samples/house/clap.wav",
        "Percussion 2": "samples/house/perc-2.wav",
        "Percussion 1": "samples/house/perc-1.wav",
        "Tom 2": "samples/house/tom-2.wav",
        "Tom 1": "samples/house/tom-1.wav",
        "Hihat": "samples/house/hihat.wav",
        "Snare": "samples/house/snare.wav",
        "Bass drum": "samples/house/bass-drum.wav"
    },
    hiphop: {
        "Fx": "samples/hiphop/fx.wav",
        "Cowbell": "samples/hiphop/cow.wav",
        "Percussion 3": "samples/hiphop/perc-3.wav",
        "Percussion 2": "samples/hiphop/perc-2.wav",
        "Percussion 1": "samples/hiphop/perc-1.wav",
        "Hihat": "samples/hiphop/hihat.wav",
        "Snare": "samples/hiphop/snare.wav",
        "Bass drum": "samples/hiphop/bass-drum.wav"
    },
    latin: {
        "Ride": "samples/latin/ride.wav",
        "Timbale 1": "samples/latin/timbale-1.wav",
        "Timbale 2": "samples/latin/timbale-2.wav",
        "Rimshot": "samples/latin/rim-shot.wav",
        "Open hihat": "samples/latin/hihat-open.wav",
        "Closed hihat": "samples/latin/hihat-closed.wav",
        "Snare": "samples/latin/snare.wav",
        "Bass drum": "samples/latin/kick.wav"
    },
    rnb: {
        "Cymbal": "samples/rnb/cymbal.wav",
        "Clap": "samples/rnb/clap.wav",
        "Percussion 1": "samples/rnb/perc-1.wav",
        "Percussion 2": "samples/rnb/perc-2.wav",
        "Percussion 3": "samples/rnb/perc-3.wav",
        "Hihat": "samples/rnb/hihat.wav",
        "Snare": "samples/rnb/snare.wav",
        "Bass drum": "samples/rnb/bass-drum.wav"
    }
};

// audio initialisatie en buffer 
const buffers = {};
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const masterGain = audioCtx.createGain();
masterGain.gain.value = document.getElementById("masterVolume").value / 100;
masterGain.connect(audioCtx.destination);

// functie om sample te laden
async function loadSample(name, url) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    buffers[name] = audioBuffer;
}

// kit laden
let currentKit = "rock";
let instruments = Object.keys(kits[currentKit]);

async function loadKit(kitName) {
    currentKit = kitName;
    instruments = Object.keys(kits[kitName]);
    const kit = kits[kitName];

    // laad alle samples van deze kit
    for (const [name, url] of Object.entries(kit)) {
        await loadSample(name, url);
    }

    renderGrid();
}

// grid aanmaken
function renderGrid() {
    grid.innerHTML = "";

    // maak één rij voor de beatnummers (1 t/m 4)
    const beatRow = document.createElement("div");
    beatRow.className = "row beat-row";

    for (let i = 1; i <= 16; i++) {
        const beat = document.createElement("div");
        beat.className = "beat-marker";
        if (i % 4 === 1) beat.textContent = Math.ceil(i / 4);
        beatRow.appendChild(beat);
    }
    grid.appendChild(beatRow);

    // voeg instrumenten toe
    instruments.forEach(inst => {
        const row = document.createElement("div");
        row.className = "row sequence-row";
        const label = document.createElement("div");
        label.className = "label";
        label.textContent = inst;
        row.appendChild(label);

        for (let i = 0; i < 16; i++) {
            const step = document.createElement("div");
            step.className = "step";
            step.addEventListener("click", () => step.classList.toggle("active"));
            row.appendChild(step);
        }
        grid.appendChild(row);
    });
}

// geluid afspelen
function playSound(name, time = 0) {
    if (!buffers[name]) return;
    const source = audioCtx.createBufferSource();
    source.buffer = buffers[name];
    source.connect(masterGain);
    source.start(time);
}

// master volume slider
const volumeSlider = document.getElementById("masterVolume");
volumeSlider.addEventListener("input", () => {
    const volume = volumeSlider.value / 100;
    masterGain.gain.setValueAtTime(volume, audioCtx.currentTime);
});

// kits dropdown
const kitsBtn = document.getElementById("kits-btn");
const kitDropdown = document.getElementById("kit-dropdown-container");

kitsBtn.addEventListener("click", () => {
    kitDropdown.style.display = kitDropdown.style.display === "none" ? "flex" : "none";
});

document.querySelectorAll(".kit-option").forEach(btn => {
    btn.addEventListener("click", async () => {
        await loadKit(btn.dataset.kit);
        kitDropdown.style.display = "none";
    });
});

// kit rock standaard laden
loadKit("rock");

// variabelen voor playback
let isPlaying = false;
let currentStep = 0;
let intervalId = null;
let currentInterval = null;

// start/stop sequence functies
function startSequence() {
    if (isPlaying) return;
    isPlaying = true;
    currentStep = 0;
    scheduleNextStep(); // gebruik dynamisch tempo
}

function stopSequence() {
    isPlaying = false;
    clearTimeout(currentInterval);
    intervalId = null;

    // visuele highlight verwijderen
    document.querySelectorAll(".step").forEach(s => s.classList.remove("current"));
}

// één stap afspelen
function playStep() {
    const rows = document.querySelectorAll(".sequence-row");

    document.querySelectorAll(".step.current").forEach(s => s.classList.remove("current"));

    rows.forEach(row => {
        const label = row.querySelector(".label").textContent;
        const steps = row.querySelectorAll(".step");
        const step = steps[currentStep];

        step.classList.add("current");

        if (step.classList.contains("active")) {
            playSound(label);
        }
    });

    // ga naar volgende stap
    currentStep = (currentStep + 1) % 16;
    scheduleNextStep();
}


// tempo dynamisch bijwerken
function scheduleNextStep() {
    if (!isPlaying) return;
    const bpm = getBPM();
    const interval = (60 / bpm) / 4 * 1000;
    currentInterval = setTimeout(playStep, interval);
}

// wordt aangeroepen als BPM verandert
function updateTempo() {
    if (isPlaying) {
        clearTimeout(currentInterval);
        scheduleNextStep();
    }
}

// aparte play en pause knoppen
const playBtn = document.getElementById("play");
const pauseBtn = document.getElementById("pause");

playBtn.addEventListener("click", async () => {
    if (audioCtx.state === "suspended") {
        await audioCtx.resume();
    }
    startSequence();
    playBtn.style.backgroundColor = "#6a8ec3";
    pauseBtn.style.backgroundColor = "";
});

pauseBtn.addEventListener("click", () => {
    stopSequence();
    pauseBtn.style.backgroundColor = "#c04f4f";
    playBtn.style.backgroundColor = "";
});

// presets dropdown
const presetsBtn = document.getElementById("presets-btn");
const presetDropdown = document.getElementById("preset-dropdown-container");

presetsBtn.addEventListener("click", () => {
    presetDropdown.style.display = presetDropdown.style.display === "none" ? "flex" : "none";
});

// preset laden
async function loadPreset(presetName) {
    try {
        const response = await fetch(`presets/${presetName}.json`);
        if (!response.ok) throw new Error("Kon preset niet laden: " + presetName);
        const data = await response.json();

        // Stel kit en bpm in
        await loadKit(data.kit);
        bpmInput.value = "BPM: " + data.bpm;

        document.querySelectorAll(".sequence-row").forEach(row => {
            const label = row.querySelector(".label").textContent;
            const presetRow = data.rows.find(r => r.instrument === label);
            if (!presetRow) return;

            const steps = row.querySelectorAll(".step");
            steps.forEach((step, i) => {
                step.classList.toggle("active", presetRow.steps[i] === 1);
            });
        });

        console.log(`Preset "${presetName}" geladen`);
    } catch (err) {
        console.error(err);
        alert("Fout bij laden van preset: " + presetName);
    }
}

// preset selectieknoppen
document.querySelectorAll(".preset-option").forEach(btn => {
    btn.addEventListener("click", async () => {
        await loadPreset(btn.dataset.preset);
        presetDropdown.style.display = "none";
    });
});

// save als json
document.getElementById("save").addEventListener("click", async () => {
    const bpm = getBPM();
    const rows = [];

    document.querySelectorAll(".sequence-row").forEach(row => {
        const instrument = row.querySelector(".label").textContent;
        const steps = Array.from(row.querySelectorAll(".step")).map(s => s.classList.contains("active") ? 1 : 0);
        rows.push({ instrument, steps });
    });

    const data = { kit: currentKit, bpm, rows };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });

    if (window.showSaveFilePicker) {
        try {
            const handle = await window.showSaveFilePicker({
                suggestedName: "sequence.json",
                types: [{
                    description: "JSON bestand",
                    accept: { "application/json": [".json"] }
                }]
            });
            const writable = await handle.createWritable();
            await writable.write(json);
            await writable.close();
        } catch (err) {
            console.error("Opslaan geannuleerd of mislukt:", err);
        }
    } else {
        // als de browser geen file browser ondersteund
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "sequence.json";
        a.click();
        URL.revokeObjectURL(url);
    }
});

// load sequence
document.getElementById("load").addEventListener("click", () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";

    input.addEventListener("change", async e => {
        const file = e.target.files[0];
        if (!file) return;

        const text = await file.text();
        const data = JSON.parse(text);

        if (data.kit) await loadKit(data.kit);
        bpmInput.value = "BPM: " + (data.bpm || 90);

        data.rows.forEach(rowData => {
            const rowEl = Array.from(document.querySelectorAll(".sequence-row"))
                .find(r => r.querySelector(".label").textContent === rowData.instrument);
            if (!rowEl) return;
            rowData.steps.forEach((val, i) => {
                const step = rowEl.querySelectorAll(".step")[i];
                step.classList.toggle("active", !!val);
            });
        });
    });

    input.click();
});
