// ADD PAGES HERE: copy any block, change the text and file names, keep the comma.
// right: "scene" (animated canvas) | "code" (live code panel) | "clip" (short looping video) | "film" (long video with controls)
// right can also be: "letter" (envelope with a typed letter) | "diary" (write your own entries)
// optional: ink (handwritten margin note), letter, photo, caption, voice, notes:[{x,y,label,text}], time:"day"|"night", weather:"none"|"rain"|"snow"|"fireflies", clip, film, code
const C1 = 'setTime("night");\nsetWeather("fireflies");';
const C2 = 'setTime("night");\nsetWeather("rain");';
const C4 = 'setTime("night");\nsetWeather("storm");';
const C3 = 'setTime("day");\nsetWeather("snow");';
window.PAGES = [
    {ch:1,title:"The First Page",ink:"remember this day",text:["Some stories start loud. Ours started with a quiet message at the end of a long day.","I am writing it down so the distance never gets to keep it."],right:"scene",time:"day",notes:[{x:62,y:74,label:"note",text:"We never say goodnight until the clock reaches the last hour of the day."}]},
    {ch:1,title:"Hello, Stranger",text:["Run the code on the right. Change \"night\" to \"day\", or try rain, storm, snow, fireflies and leaves."],right:"code",code:C1},
    {ch:1,title:"Long Distance",text:["Two screens, two time zones, one very stubborn heart."],right:"scene",time:"night",weather:"rain",notes:[{x:60,y:70,label:"note",text:"It is the hour when today turns into tomorrow."}]},
    {ch:1,title:"Photo Booth",ink:"my favourite picture",text:["Our first picture together, even if we were miles apart."],right:"clip",clip:"video/clip01.mp4",photo:"images/memory01.jpg",caption:"memory 01"},
    {ch:1,title:"The Rules We Made",text:["Rule one: never go to bed angry. Rule two: always say it first."],right:"code",code:C2},
    {ch:2,title:"Static",ink:"I counted every minute",text:["Some nights the call dropped and I just stared at the ceiling."],right:"scene",time:"night",weather:"rain"},
    {ch:2,title:"Missed Calls",text:["Try changing the weather to snow and running it again."],right:"code",code:C2},
    {ch:2,title:"The Song",text:["Press the voice note and listen. This one is for you."],right:"scene",time:"night",weather:"fireflies",voice:"audio/voice01.mp3",notes:[{x:64,y:76,label:"note",text:"What do we call each other when nobody else is listening? That is our call sign."}]},
    {ch:2,title:"Time Zones",text:["When it is morning for me, it is already your afternoon."],right:"scene",time:"day"},
    {ch:2,title:"Little Windows",text:["Tiny moments, caught on video."],right:"clip",clip:"video/clip02.mp4"},
    {ch:2,title:"What I Did Not Say",text:["Some words are easier to type into code than to say out loud."],right:"code",code:C3},
    {ch:3,title:"Good Morning",ink:"first thing, always you",text:["The first thing I do is look for your name on my screen."],right:"scene",time:"day"},
    {ch:3,title:"Postcards",text:["If we could mail the feeling, this is what it would look like."],right:"scene",time:"day",weather:"snow",photo:"images/memory02.jpg",caption:"memory 02",notes:[{x:66,y:80,label:"note",text:"One name for him, one name for her, and a small word joining the two."}]},
    {ch:3,title:"Storm Season",text:["We argued once. The sky agreed with us. Try the word storm."],right:"code",code:C4},
    {ch:3,title:"Our Film",text:["The long one. Press play and sit with it."],right:"film",film:"video/film01.mp4"},
    {ch:3,title:"Holding On",text:["Every snowflake counts down to the day we meet."],right:"scene",time:"night",weather:"snow"},
    {ch:4,title:"The Countdown",text:["Each night the number gets a little smaller."],right:"scene",time:"night",weather:"fireflies"},
    {ch:4,title:"Packed Bags",text:["Write your own scene. Set the time and weather you want for our reunion."],right:"code",code:C1},
    {ch:4,title:"Arrivals",text:["The moment the doors opened."],right:"clip",clip:"video/clip03.mp4"},
    {ch:4,title:"Golden Hour",ink:"worth every mile",text:["Everything looked warmer with you in it."],right:"scene",time:"day",weather:"leaves",photo:"images/memory03.jpg",caption:"memory 03"},
    {ch:4,title:"A Letter For You",text:["Tap the envelope on the right. Someone wrote this for you."],right:"letter",letter:"Dear Ms.R, thank you for every late night, every missed call that turned into a longer one, and every promise you kept. Count the days with me. Wherever you are tonight, you are my home."},
    {ch:4,title:"Our Own Pages",text:["This part is yours to write. Add an entry on the right and it is kept here in the book."],right:"diary"},
    {ch:4,title:"Every Page After",text:["This book is never finished. Add a new page in js/pages.js whenever there is more to tell."],right:"scene",time:"night",weather:"fireflies"},
    {ch:4,title:"The Last Page (For Now)",text:["To be continued."],right:"scene",time:"night",weather:"fireflies"}
];