# Banker's Algorithm Simulator

An interactive, client-side web application that provides a dynamic, visual simulation of the Banker's Algorithm for operating system deadlock avoidance.

This project uses pure HTML, CSS, and JavaScript to create a responsive, aesthetic, and educational tool for understanding core OS concepts.

## Features

* **Complete Algorithm Implementation:** All logic for the safety algorithm and resource-request algorithm is implemented in client-side JavaScript.

* **Interactive Simulation:** Dynamically request resources for any process and observe the system's response in real-time.

* **Visual State Tables:** Clean, card-based tables clearly display the current state of the system, including:

  * Available Resources

  * Maximum Resource Claims

  * Current Allocation

  * Calculated Need (Max - Allocation)

* **Real-Time Logging:** A "Simulation Log" provides a step-by-step, color-coded feed of all system actions:

  * **INFO:** System initialization and new requests.

  * **SUCCESS:** Granted requests and safe states.

  * **ERROR:** Denied requests due to exceeding max claim or leading to an unsafe state.

  * **WARN:** Denied requests due to insufficient available resources (process must wait).

* **Aesthetic UI/UX:** A clean, minimalist, and responsive design for an intuitive user experience.

* **Light/Dark Mode Toggle:** A sleek toggle switch allows users to change themes, with the preference saved in `localStorage`.

## Technology Stack

This project is built with 100% vanilla web technologies, requiring no frameworks or libraries.

* **HTML5:** For the semantic structure of the application.

* **CSS3:** For all styling, layout (flexbox), and the light/dark mode theme.

* **JavaScript (ES6+):** For all application logic, including:

  * DOM manipulation

  * Banker's Algorithm (Safety & Request) logic

  * Event handling

  * State management

## Algorithm Logic

The simulation logic is self-contained in `script.js`:

1. **Initialization:**

   * The application loads with a predefined set of `Available`, `Max`, and `Allocation` matrices.

   * It immediately calculates the `Need` matrix (`Need = Max - Allocation`).

   * It runs the **Safety Algorithm** to verify that the initial state is safe and reports this to the log.

2. **Handling a Resource Request:**

   * A user selects a process and inputs a resource request vector.

   * **Step 1 (Validate):** The request is checked against `Need`. If `Request > Need`, it's an error and is denied.

   * **Step 2 (Wait):** The request is checked against `Available`. If `Request > Available`, the process must wait, and the request is denied.

   * **Step 3 (Safety Check):** If the first two checks pass, the application "pretends" to grant the request by *temporarily* updating the `Available`, `Allocation`, and `Need` states in memory.

   * It then runs the **Safety Algorithm** on this *hypothetical* new state.

   * **Step 4 (Commit or Rollback):**

     * **If the new state is SAFE:** The request is permanently granted. The log is updated with a success message, and the UI tables are re-rendered with the new data.

     * **If the new state is UNSAFE:** The request is denied. The "pretend" changes are rolled back, and the log is updated with an error, explaining that the request would lead to a deadlock.
