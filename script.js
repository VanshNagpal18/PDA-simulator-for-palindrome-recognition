document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("checkBtn").addEventListener("click", checkPalindrome);
});

function checkPalindrome() {
    let input = document.getElementById("inputString").value.trim();
    let resultContainer = document.getElementById("result");
    let stepsContainer = document.getElementById("steps");
    let stackContainer = document.getElementById("stackVisualization");

    if (!input) {
        resultContainer.innerHTML = "<span class='error-text'>⚠️ Please enter a string!</span>";
        return;
    }

    // Clear previous results
    resultContainer.innerHTML = "";
    stepsContainer.innerHTML = "";
    stackContainer.innerHTML = "";
    resetStackHistory();
    updateStateDiagram(input);
    

    let stack = [];
    let steps = [];
    let mid = Math.floor(input.length / 2);
    let isPalindrome = true;
    let index = 0;

    function animateStep() {
        if (index < mid) {
            // Pushing characters to stack
            stack.push(input[index]);
            steps.push(`<span class="push-step">⬇️ Pushed '${input[index]}', Stack: [${stack.join(", ")}]</span>`);
            animateStack(stackContainer, input[index], "push");
            // updateStack(stack);
            addStackSnapshot([...stack], currentStepNumber);
            currentStepNumber++;

            // Highlight current state
            let currentState = document.getElementById(`q${index}`);
            if (currentState) currentState.setAttribute("fill", "yellow");

            index++;
            setTimeout(animateStep, 1000);
        } else if (index < input.length) {
            // If the string has odd length, skip the middle character
            let startIndex = input.length % 2 === 0 ? mid : mid + 1;

            if (index >= startIndex) {
                let top = stack.pop();
                steps.push(`<span class="pop-step">⬆️ Popped '${top}', Stack: [${stack.join(", ")}] (Comparing with '${input[index]}')</span>`);
                animateStack(stackContainer, top, "pop");
                // updateStack(stack);
                addStackSnapshot([...stack], currentStepNumber);
                currentStepNumber++;

                if (top !== input[index]) {
                    isPalindrome = false;
                }

                // Highlight current state
                let currentState = document.getElementById(`q${index}`);
                if (currentState) currentState.setAttribute("fill", "lightgreen");
            }

            index++;
            setTimeout(animateStep, 1000);
        } else {
            // Ensure the final result is displayed
            setTimeout(() => {
                if (isPalindrome) {
                    resultContainer.innerHTML = "<span class='success-text'>✅ It's a palindrome!</span>";
                } else {
                    resultContainer.innerHTML = "<span class='error-text'>❌ NOT a palindrome!</span>";
                }

                // Highlight final state
                let finalState = document.getElementById(`qF`);
                if (finalState) finalState.setAttribute("fill", isPalindrome ? "green" : "red");
            }, 500);
        }
        stepsContainer.innerHTML = steps.join("<br>");
    }

    animateStep();
}

// Function to animate stack push/pop
function animateStack(container, char, action) {
    let div = document.createElement("div");
    div.className = "stack-element";
    div.innerText = char;

    let arrow = document.createElement("i"); // Font Awesome icon
    arrow.classList.add("arrow", "fas");

    if (action === "push") {
        div.classList.add("push-animation");
        arrow.classList.add("fa-arrow-down"); // Downward arrow for push
    } else {
        div.classList.add("pop-animation");
        arrow.classList.add("fa-arrow-up"); // Upward arrow for pop
        setTimeout(() => div.remove(), 1000);
    }

    container.appendChild(arrow);
    container.appendChild(div);
}

function updateStateDiagram(input) {
    let svg = document.getElementById("pdaSVG");
    svg.innerHTML = ""; // Clear previous content

    // Define arrow marker
    let defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    defs.innerHTML = `
        <marker id="arrow" markerWidth="10" markerHeight="10" refX="10" refY="5" orient="auto">
            <polygon points="0,0 10,5 0,10" fill="black"/>
        </marker>
    `;
    svg.appendChild(defs);

    let stateSpacing = 200;
    let states = [
        { id: "q0", cx: 70, label: "q0 (Start)", color: "lightgray" },
        { id: "q1", cx: 70 + stateSpacing, label: "q1 (Pushing)", color: "lightgray" },
        { id: "q2", cx: 70 + 2 * stateSpacing, label: "q2 (Popping)", color: "lightgray" },
        { id: "qF", cx: 70 + 3 * stateSpacing, label: "qF (Final)", color: "lightgray" }
    ];

    let transitions = [
        { from: "q0", to: "q1", label: "ε, ε → $" },
        { from: "q1", to: "q1", label: "a, ε → a" },  // Self-loop transition (stack push)
        { from: "q1", to: "q2", label: "b, a → ε" },  // Pop when 'b' read
        { from: "q2", to: "q2", label: "b, a → ε" },  // More pops
        { from: "q2", to: "qF", label: "ε, $ → ε" }   // Final check for empty stack
    ];

    // Draw states
    states.forEach(state => {
        let circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", state.cx);
        circle.setAttribute("cy", 75);
        circle.setAttribute("r", 30);
        circle.setAttribute("fill", state.color);
        circle.setAttribute("stroke", "black");
        circle.setAttribute("stroke-width", "2");
        circle.setAttribute("id", state.id);
        svg.appendChild(circle);

        let label = document.createElementNS("http://www.w3.org/2000/svg", "text");
        label.setAttribute("x", state.cx);
        label.setAttribute("y", 130);
        label.setAttribute("font-size", "14");
        label.setAttribute("fill", "black");
        label.setAttribute("font-weight", "bold");
        label.setAttribute("text-anchor", "middle");
        label.textContent = state.label;
        svg.appendChild(label);
    });

    // Draw transitions
    transitions.forEach(transition => {
        let fromState = states.find(s => s.id === transition.from);
        let toState = states.find(s => s.id === transition.to);

        if (transition.from === transition.to) {
            // Self-loop
            let path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute("d", `M ${fromState.cx - 15} 40 A 20 20 0 1 1 ${fromState.cx + 15} 40`);
            path.setAttribute("fill", "none");
            path.setAttribute("stroke", "black");
            path.setAttribute("stroke-width", "2");
            path.setAttribute("marker-end", "url(#arrow)");
            svg.appendChild(path);

            let text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x", fromState.cx);
            text.setAttribute("y", 8);
            text.setAttribute("font-size", "14");
            text.setAttribute("fill", "black");
            text.setAttribute("text-anchor", "middle");
            text.textContent = transition.label;
            svg.appendChild(text);
        } else {
            // Straight line transitions
            let line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", fromState.cx + 30);
            line.setAttribute("y1", 75);
            line.setAttribute("x2", toState.cx - 30);
            line.setAttribute("y2", 75);
            line.setAttribute("stroke", "black");
            line.setAttribute("stroke-width", "2");
            line.setAttribute("marker-end", "url(#arrow)");
            svg.appendChild(line);

            let text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x", (fromState.cx + toState.cx) / 2);
            text.setAttribute("y", 60);
            text.setAttribute("font-size", "14");
            text.setAttribute("fill", "black");
            text.setAttribute("text-anchor", "middle");
            text.textContent = transition.label;
            svg.appendChild(text);
            
        }
    });
    
    
}let currentStepNumber = 1;

function addStackSnapshot(stack, inputSymbol) {
    const container = document.getElementById("pdaStackHistory");

    const wrapper = document.createElement("div");
    wrapper.style.display = "inline-block";
    wrapper.style.margin = "10px";
    wrapper.style.textAlign = "center";

    const label = document.createElement("div");
    label.innerText = `Step ${currentStepNumber}: ${inputSymbol || 'ε-move'}`;
    label.style.marginBottom = "5px";
    label.style.fontWeight = "bold";
    wrapper.appendChild(label);

    const stackBox = document.createElement("div");
    stackBox.style.display = "flex";
    stackBox.style.flexDirection = "column-reverse";
    stackBox.style.alignItems = "center";
    stackBox.style.justifyContent = "flex-start";
    stackBox.style.border = "2px solid black";
    stackBox.style.width = "60px";
    stackBox.style.minHeight = "100px";
    stackBox.style.padding = "5px";
    stackBox.style.background = "linear-gradient(to bottom, #e0f7fa, #b2ebf2)";
    stackBox.style.borderRadius = "8px";

    if (stack.length === 0) {
        const empty = document.createElement("div");
        empty.innerText = "ε";
        empty.style.padding = "5px";
        empty.style.border = "1px dashed gray";
        empty.style.width = "30px";
        empty.style.textAlign = "center";
        empty.style.backgroundColor = "#1d1c20";
        empty.style.borderRadius = "4px";
        stackBox.appendChild(empty);
    } else {
        stack.forEach(symbol => {
            const box = document.createElement("div");
            box.innerText = symbol;
            box.style.padding = "5px";
            box.style.margin = "2px 0";
            box.style.border = "1px solid black";
            box.style.width = "30px";
            box.style.textAlign = "center";
            box.style.backgroundColor = "#14bd31";
            box.style.fontWeight = "bold";
            box.style.borderRadius = "4px";
            stackBox.appendChild(box);
        });
    }

    wrapper.appendChild(stackBox);
    container.appendChild(wrapper);
    currentStepNumber++;
}
function resetStackHistory() {
    const container = document.getElementById("pdaStackHistory");
    container.innerHTML = "";  // Clear old stack diagrams
    currentStepNumber = 1;     // Reset step count
}
