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

// Function to update the PDA state diagram
function updateStateDiagram(input) {
    let svg = document.getElementById("pdaSVG");
    svg.innerHTML = ""; // Clear previous states

    let stateSpacing = 200; // Space between main states

    // Define states
    let states = [
        { id: "q0", cx: 50, label: "q0", color: "lightgray" },
        { id: "q1", cx: 50 + stateSpacing, label: "q1 (Pushing)", color: "lightgray" },
        { id: "q2", cx: 50 + 2 * stateSpacing, label: "q2 (Popping)", color: "lightgray" },
        { id: "qF", cx: 50 + 3 * stateSpacing, label: "qF (Final)", color: "lightgray" }
    ];

    // Create states
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
        label.setAttribute("x", state.cx - 20);
        label.setAttribute("y", 110); // Move text down to avoid overlap
        label.setAttribute("font-size", "14");
        label.setAttribute("fill", "black");
        label.setAttribute("font-weight", "bold"); // Make text bold
        label.textContent = state.label;
        svg.appendChild(label);
    });

    // Function to draw arrows and transition labels
    function drawArrow(x1, x2, labelText) {
        let arrow = document.createElementNS("http://www.w3.org/2000/svg", "line");
        arrow.setAttribute("x1", x1);
        arrow.setAttribute("y1", 75);
        arrow.setAttribute("x2", x2);
        arrow.setAttribute("y2", 75);
        arrow.setAttribute("stroke", "black");
        arrow.setAttribute("stroke-width", "2");
        arrow.setAttribute("marker-end", "url(#arrow)");
        svg.appendChild(arrow);

        let text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", (x1 + x2) / 2 - 20);
        text.setAttribute("y", 55); // Move text up to avoid overlap
        text.setAttribute("font-size", "12");
        text.setAttribute("fill", "black");
        text.setAttribute("font-weight", "bold"); // Make text bold
        text.textContent = labelText;
        svg.appendChild(text);
    }

    // Draw transitions
    drawArrow(states[0].cx + 30, states[1].cx - 30, "Push");
    drawArrow(states[1].cx + 30, states[2].cx - 30, "Pop");
    drawArrow(states[2].cx + 30, states[3].cx - 30, "Accept");

    // Self-loop on q1 (Pushing)
    let selfLoop = document.createElementNS("http://www.w3.org/2000/svg", "path");
    selfLoop.setAttribute("d", `M ${states[1].cx - 15} 40 A 20 20 0 1 1 ${states[1].cx + 15} 40`);
    selfLoop.setAttribute("fill", "none");
    selfLoop.setAttribute("stroke", "black");
    selfLoop.setAttribute("stroke-width", "2");
    svg.appendChild(selfLoop);

    let loopLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
    loopLabel.setAttribute("x", states[1].cx - 25);
    loopLabel.setAttribute("y", 25); // Move text higher to prevent overlap
    loopLabel.setAttribute("font-size", "12");
    loopLabel.setAttribute("fill", "black");
    loopLabel.setAttribute("font-weight", "bold"); // Make text bold
    loopLabel.textContent = "Push Loop";
    svg.appendChild(loopLabel);
}

