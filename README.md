# PDA-simulator-for-palindrome-recognition

A Pushdown Automaton (PDA) simulator for palindrome recognition can be built to recognize strings that are palindromes over a given alphabet, typically something like {a, b}.

Palindromes are strings that read the same forwards and backwards, like abba, aa, or baab.

Because PDAs are typically non-deterministic when recognizing palindromes, the PDA will "guess" the middle of the string and start comparing symbols by popping from the stack.

🧠 PDA for Palindromes (even-length over {a, b})
Language:
L = { w ∈ {a,b}* | w = wᵣ }
(i.e., all palindromes over {a, b})

🧱 PDA Concept:
Start pushing the first half of the input symbols onto the stack.

Non-deterministically guess the middle of the string (for odd or even length).

Start popping and matching the second half of the string with the stack content.

🛠️ Example PDA Description (Non-Deterministic)
States: q0 (start), q1 (pushing), q2 (matching), q_accept
Stack symbols: Z (initial), a, b

Transitions:
(q0, ε, Z) → (q1, Z)

(q1, a, _) → (q1, push a)
(q1, b, _) → (q1, push b)

(Guess middle point)
(q1, ε, _) → (q2, no change)

(q2, a, a) → (q2, pop)
(q2, b, b) → (q2, pop)

(q2, ε, Z) → (q_accept, Z)

This PDA non-deterministically guesses when the middle of the palindrome is reached, and starts comparing the rest of the string to the stack.
