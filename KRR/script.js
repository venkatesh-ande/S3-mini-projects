const cases = [
  {id:"TS-101", title:"Laptop running slowly", keywords:["slow","laptop","computer","performance","lag","freeze"], symptoms:"Applications take a long time to open and the system freezes occasionally.", cause:"Too many startup applications and low available memory.", solution:"Disable unnecessary startup programs, close unused applications, clear temporary files, and restart the computer.", outcome:"Resolved"},
  {id:"TS-102", title:"Printer not printing", keywords:["printer","printing","print","paper","queue","document"], symptoms:"Print jobs remain in the queue and no page is produced.", cause:"Stuck print queue or printer service issue.", solution:"Check printer connection, clear the print queue, restart the Print Spooler service, and retry the document.", outcome:"Resolved"},
  {id:"TS-103", title:"Computer overheating", keywords:["overheat","hot","heating","fan","temperature","shutdown"], symptoms:"Laptop becomes very hot and may shut down unexpectedly.", cause:"Blocked ventilation or dust around the cooling system.", solution:"Place the laptop on a hard surface, clean the air vents, ensure the fan is unobstructed, and monitor temperature.", outcome:"Resolved"},
  {id:"TS-104", title:"Wi-Fi not connecting", keywords:["wifi","wi-fi","wireless","internet","network","connect","connection"], symptoms:"The computer cannot connect to a wireless network.", cause:"Disabled network adapter or incorrect network configuration.", solution:"Check that Wi-Fi is enabled, restart the network adapter, forget and reconnect to the network, then restart the router if needed.", outcome:"Resolved"},
  {id:"TS-105", title:"No internet after connecting to Wi-Fi", keywords:["wifi","internet","connected","no internet","dns","browser"], symptoms:"Device shows connected to Wi-Fi but websites do not load.", cause:"DNS or router connectivity problem.", solution:"Restart the router, renew the network connection, and test with another device. If needed, change DNS settings.", outcome:"Resolved"},
  {id:"TS-106", title:"Keyboard not responding", keywords:["keyboard","keys","typing","usb","wireless"], symptoms:"Some or all keyboard keys do not respond.", cause:"Loose connection, driver issue, or wireless battery problem.", solution:"Reconnect the keyboard, replace batteries if wireless, try another USB port, and update/reinstall the keyboard driver.", outcome:"Resolved"},
  {id:"TS-107", title:"Application keeps crashing", keywords:["crash","app","application","software","error","close"], symptoms:"An application closes unexpectedly when opened or during use.", cause:"Corrupted application files or outdated software.", solution:"Restart the application, update it, clear its cache if available, and reinstall if the problem continues.", outcome:"Resolved"},
  {id:"TS-108", title:"Computer has no sound", keywords:["sound","audio","speaker","volume","mute","headphone"], symptoms:"No audio is heard from the computer.", cause:"Muted output, wrong playback device, or audio driver issue.", solution:"Check volume and mute settings, select the correct playback device, reconnect speakers/headphones, and update the audio driver.", outcome:"Resolved"}
];

const normalize = s => s.toLowerCase().replace(/[^a-z0-9\s-]/g," ").replace(/\s+/g," ").trim();

function scoreCase(problem, c){
  const text = normalize(problem);
  const words = text.split(" ").filter(w => w.length > 2);
  let score = 0;
  const keywordSet = c.keywords.map(normalize);
  words.forEach(w => {
    if(keywordSet.some(k => k === w)) score += 10;
    else if(keywordSet.some(k => k.includes(w) || w.includes(k))) score += 5;
  });
  const titleWords = normalize(c.title).split(" ");
  words.forEach(w => { if(titleWords.includes(w)) score += 6; });
  const phrases = keywordSet.filter(k => k.includes(" "));
  phrases.forEach(p => { if(text.includes(p)) score += 14; });
  return Math.min(99, Math.round(30 + score * 1.8));
}

function renderCases(){
  const box = document.getElementById("cases");
  document.getElementById("caseCount").textContent = `(${cases.length} stored cases)`;
  box.innerHTML = cases.map(c => `<div class="case-item"><span>${c.id}</span><strong>${c.title}</strong><p>${c.symptoms}</p></div>`).join("");
}

function solve(){
  const problem = document.getElementById("problem").value.trim();
  const result = document.getElementById("result");
  if(!problem){
    result.innerHTML = `<div class="empty-state"><div class="big-icon">⚠️</div><h3>Enter a problem first</h3><p>Describe the symptoms so the CBR engine can retrieve a similar case.</p></div>`;
    return;
  }
  const ranked = cases.map(c => ({...c, score:scoreCase(problem,c)})).sort((a,b)=>b.score-a.score);
  const best = ranked[0];
  result.innerHTML = `
    <div class="result-header">
      <div><span class="case-id">RETRIEVED CASE · ${best.id}</span><h3>${best.title}</h3></div>
      <span class="match">${best.score}% match</span>
    </div>
    <div class="scorebar"><div style="width:${best.score}%"></div></div>
    <p><strong>Previous symptoms:</strong> ${best.symptoms}</p>
    <p style="margin-top:8px"><strong>Known cause:</strong> ${best.cause}</p>
    <div class="solution"><strong>♻️ Reused & adapted solution</strong><br>${best.solution}</div>
    <p style="font-size:12px;color:#748095;margin-top:15px"><strong>Revise:</strong> Verify the recommended steps on the current system. <strong>Retain:</strong> If successful, save this experience as a new case.</p>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  renderCases();
  document.getElementById("solveBtn").addEventListener("click", solve);
  document.getElementById("problem").addEventListener("keydown", e => {
    if(e.ctrlKey && e.key === "Enter") solve();
  });
  document.querySelectorAll(".quick-tags button").forEach(btn => {
    btn.addEventListener("click", () => {
      document.getElementById("problem").value = btn.dataset.problem;
      solve();
    });
  });
  document.querySelector(".menu-btn").addEventListener("click", () => {
    document.querySelector(".nav nav").classList.toggle("open");
  });
  document.querySelectorAll(".nav a").forEach(a => a.addEventListener("click", () => document.querySelector(".nav nav").classList.remove("open")));
});
