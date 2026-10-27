// EDIT HERE: title, passcodes, music, book sounds and secrets.
window.store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch (e) { return d } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)) } catch (e) {} }
};
window.CONFIG = {
    title: "Our Story",
    subtitle: "A diary you can open",
    cover: "images/cover.jpg", // optional round photo on the cover; if missing, a tiny live scene is shown
    chapters: { 1: "Before", 2: "Static", 3: "Signal", 4: "Homeward" },
    chapterLocks: { 2: "k1", 4: "k2" }, // chapters not listed are open
    locks: {
        k1: { pass: "midnight", hint: "Read the sticky notes on the first three pages." },
        k2: { pass: "hubby and wifey", hint: "Our call sign: the two names we call each other, joined by a small word." }
    },
    // MUSIC: one song for the whole book
    music: { file: "audio/music/song.mp3", name: "Our Song" },
    // BOOK AUDIO: optional files. If a file is missing, the book makes the sound itself.
    sounds: {
        flip: "audio/book/flip.mp3",
        rain: "audio/book/rain.mp3", storm: "audio/book/storm.mp3", thunder: "audio/book/thunder.mp3",
        snow: "audio/book/snow.mp3", night: "audio/book/night.mp3", day: "audio/book/day.mp3"
    },
    // HIDDEN SECRETS: click these things in the pixel scene (moon, sun, windows, door, the two figures)
    secrets: {
        moon: "The moon is the one thing we both look at every night.",
        sun: "When it is your sunrise, it is already my afternoon, and I still think of you first.",
        windowL: "Someone left the light on for you.",
        windowR: "Two windows, one home. Someday soon.",
        door: "The door is never locked. It is always open for you.",
        him: "The one in red never lets go.",
        her: "The one in gold shines even when it rains."
    },
    allFound: "You found every secret. I would have hidden a hundred more."
};