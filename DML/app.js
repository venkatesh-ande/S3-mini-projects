    "use strict";

    const network = {
      Server: ["Library", "Classroom"],
      Library: ["Server", "Hostel", "Classroom"],
      Hostel: ["Library", "Classroom"],
      Classroom: ["Server", "Library", "Hostel"]
    };

    const startSelect = document.getElementById("start-node");
    const endSelect = document.getElementById("end-node");
    const facilityNames = Object.keys(network);

    facilityNames.forEach((name) => {
      startSelect.add(new Option(name, name));
      endSelect.add(new Option(name, name));
    });
    endSelect.value = "Hostel";

    function findPath(start, end) {
      const visited = new Set();
      const parent = new Map();
      const stack = [start];
      visited.add(start);

      while (stack.length > 0) {
        const current = stack.pop();
        if (current === end) {
          const path = [];
          let node = end;
          while (node !== undefined) {
            path.unshift(node);
            node = parent.get(node);
          }
          return path;
        }

        network[current].forEach((neighbor) => {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            parent.set(neighbor, current);
            stack.push(neighbor);
          }
        });
      }

      return null;
    }

    document.getElementById("path-form").addEventListener("submit", (event) => {
      event.preventDefault();
      const start = startSelect.value;
      const end = endSelect.value;
      const result = document.getElementById("path-result");

      if (start === end) {
        result.className = "result-box success";
        result.innerHTML = '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="10" cy="10" r="7" stroke="currentColor" stroke-width="1.5"/><path d="m6.5 10 2.2 2.2 4.8-5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg><div><span class="result-title">You are already there</span><span class="result-detail"></span></div>';
        result.querySelector(".result-detail").textContent = `Start and end are both ${start}.`;
        return;
      }

      const path = findPath(start, end);
      if (path) {
        result.className = "result-box success";
        result.innerHTML = '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="10" cy="10" r="7" stroke="currentColor" stroke-width="1.5"/><path d="m6.5 10 2.2 2.2 4.8-5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg><div><span class="result-title">Path found</span><span class="result-detail"></span></div>';
        result.querySelector(".result-detail").textContent = path.join(" → ");
      } else {
        result.className = "result-box failure";
        result.innerHTML = '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="10" cy="10" r="7" stroke="currentColor" stroke-width="1.5"/><path d="m7.5 7.5 5 5m0-5-5 5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg><div><span class="result-title">No path found</span><span class="result-detail"></span></div>';
        result.querySelector(".result-detail").textContent = `No route connects ${start} and ${end}.`;
      }
    });

    const logicInputs = {
      hostelOnline: document.getElementById("hostel-online"),
      libraryOverloaded: document.getElementById("library-overloaded"),
      routerAOnline: document.getElementById("router-a-online"),
      routerBOnline: document.getElementById("router-b-online")
    };

    function updateLogicStatus() {
      const hostelOffline = !logicInputs.hostelOnline.checked;
      const libraryOverloaded = logicInputs.libraryOverloaded.checked;
      const routerAOnline = logicInputs.routerAOnline.checked;
      const routerBOnline = logicInputs.routerBOnline.checked;
      const facilityAlert = hostelOffline && libraryOverloaded;
      const routerAlert = !routerAOnline && routerBOnline;
      const alert = facilityAlert || routerAlert;

      document.getElementById("hostel-state").textContent = hostelOffline ? "Currently offline" : "Currently online";
      document.getElementById("library-state").textContent = libraryOverloaded ? "Currently overloaded" : "Currently normal";
      document.getElementById("router-a-state").textContent = routerAOnline ? "Currently online" : "Currently offline";
      document.getElementById("router-b-state").textContent = routerBOnline ? "Currently online" : "Currently offline";

      const status = document.getElementById("logic-result");
      status.className = `logic-result ${alert ? "alert" : "clear"}`;
      document.getElementById("logic-message").textContent = alert ? "Network alert triggered" : "Network operating normally";
      document.getElementById("logic-evaluation").textContent =
        `Facility condition: ${hostelOffline ? "TRUE" : "FALSE"} AND ${libraryOverloaded ? "TRUE" : "FALSE"} = ${facilityAlert ? "TRUE" : "FALSE"} · Router condition: NOT ${routerAOnline ? "TRUE" : "FALSE"} AND ${routerBOnline ? "TRUE" : "FALSE"} = ${routerAlert ? "TRUE" : "FALSE"}`;
    }

    Object.values(logicInputs).forEach((input) => input.addEventListener("change", updateLogicStatus));
    updateLogicStatus();
