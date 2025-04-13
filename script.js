document.addEventListener('DOMContentLoaded', () => {
    const notesGrid = document.getElementById('notes-grid');
    const addNoteBtn = document.getElementById('add-note-btn');
    const searchInput = document.getElementById('search-input');
    const noteModal = document.getElementById('note-modal');
    const noteInput = document.getElementById('note-input');
    const saveNoteBtn = document.getElementById('save-note-btn');
    const cancelNoteBtn = document.getElementById('cancel-note-btn');
    const modalContent = noteModal.querySelector('.modal-content'); // Get modal content

    let currentEditingId = null; // Variable to store the ID of the note being edited

    // Load notes from localStorage on page load
    loadNotes();

    // --- Event Listeners ---

    // Show modal for NEW note when Add Note button is clicked
    addNoteBtn.addEventListener('click', () => {
        currentEditingId = null; // Ensure we are adding, not editing
        noteInput.value = ''; // Clear previous input
        saveNoteBtn.textContent = 'Save Note'; // Set button text for adding
        noteModal.style.display = 'block'; // Show the modal
        noteInput.focus();
    });

    // Hide modal on Cancel
    cancelNoteBtn.addEventListener('click', () => {
        noteModal.style.display = 'none';
    });

    // Hide modal if clicked outside the content area
    window.addEventListener('click', (event) => {
        if (event.target == noteModal) {
            noteModal.style.display = 'none';
        }
    });

    // Save or Update note when Save button is clicked
    saveNoteBtn.addEventListener('click', () => {
        const noteText = noteInput.value.trim();
        if (noteText) {
            if (currentEditingId !== null) {
                // If editing, update the existing note
                updateNote(currentEditingId, noteText);
            } else {
                // If not editing, add a new note
                addNote(noteText);
            }
            noteInput.value = ''; // Clear input
            noteModal.style.display = 'none'; // Hide modal
            currentEditingId = null; // Reset editing ID
        } else {
            alert("Note cannot be empty!");
        }
    });

    // Filter notes on search input
    searchInput.addEventListener('input', filterNotes);

    // --- Functions ---

    // Function to get notes from localStorage
    function getNotes() {
        const notes = localStorage.getItem('notesApp');
        return notes ? JSON.parse(notes) : []; // Return array or empty array
    }

    // Function to save notes to localStorage
    function saveNotes(notes) {
        localStorage.setItem('notesApp', JSON.stringify(notes));
    }

    // Function to create and display a single note card
    function createNoteElement(note) {
        const noteCard = document.createElement('div');
        noteCard.classList.add('note-card');
        noteCard.dataset.id = note.id; // Store note id

        const noteContent = document.createElement('div');
        noteContent.classList.add('note-content');
        noteContent.innerHTML = note.text.replace(/\n/g, '<br>'); // Display newlines correctly

        const noteFooter = document.createElement('div');
        noteFooter.classList.add('note-footer');

        const noteDate = document.createElement('span');
        noteDate.classList.add('note-date');
        // Check if timestamp exists before formatting
        noteDate.textContent = note.timestamp ? formatDate(note.timestamp) : 'No date';

        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('delete-btn');
        deleteBtn.textContent = 'Delete';
        // IMPORTANT: Stop propagation so clicking delete doesn't trigger edit
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            // Confirm before deleting
            if (confirm('Are you sure you want to delete this note?')) {
                deleteNote(note.id);
            }
        });

        noteFooter.appendChild(noteDate);
        noteFooter.appendChild(deleteBtn);

        noteCard.appendChild(noteContent);
        noteCard.appendChild(noteFooter);

        // Add click listener to the whole card for editing
        noteCard.addEventListener('click', () => {
             editNote(note.id);
        });


        return noteCard;
    }

    // Function to display all notes
    function displayNotes(notesToDisplay) {
        notesGrid.innerHTML = ''; // Clear existing notes
        // Sort notes by timestamp descending (newest first)
        const sortedNotes = notesToDisplay.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        sortedNotes.forEach(note => {
            const noteElement = createNoteElement(note);
            notesGrid.appendChild(noteElement);
        });
    }

    // Function to load and display notes initially
    function loadNotes() {
        const notes = getNotes();
        displayNotes(notes);
    }

    // Function to add a new note
    function addNote(text) {
        const notes = getNotes();
        const newNote = {
            id: Date.now(), // Unique ID based on timestamp
            text: text,
            timestamp: new Date().toISOString() // Store creation/update time
        };
        notes.unshift(newNote); // Add to beginning
        saveNotes(notes);
        loadNotes(); // Reload notes to display the new one
    }

     // Function to prepare the modal for editing an existing note
    function editNote(id) {
        const notes = getNotes();
        const noteToEdit = notes.find(note => note.id === id);
        if (!noteToEdit) return; // Exit if note not found

        currentEditingId = id; // Set the ID of the note being edited
        noteInput.value = noteToEdit.text; // Fill textarea with existing text
        saveNoteBtn.textContent = 'Update Note'; // Change button text
        noteModal.style.display = 'block'; // Show the modal
        noteInput.focus(); // Focus on the textarea
    }

    // Function to update an existing note
    function updateNote(id, newText) {
        let notes = getNotes();
        // Find the index of the note to update
        const noteIndex = notes.findIndex(note => note.id === id);
        if (noteIndex > -1) {
            notes[noteIndex].text = newText;
            notes[noteIndex].timestamp = new Date().toISOString(); // Update timestamp
            saveNotes(notes);
            loadNotes(); // Reload notes to show changes
        }
    }


    // Function to delete a note
    function deleteNote(id) {
        let notes = getNotes();
        notes = notes.filter(note => note.id !== id);
        saveNotes(notes);
        loadNotes(); // Reload notes after deletion
    }

    // Function to filter notes based on search input
    function filterNotes() {
        const searchTerm = searchInput.value.toLowerCase();
        const notes = getNotes();
        const filteredNotes = notes.filter(note =>
            note.text.toLowerCase().includes(searchTerm)
        );
        displayNotes(filteredNotes);
    }

    // Function to format date (simple version)
    function formatDate(isoString) {
         if (!isoString) return ''; // Handle cases where timestamp might be missing
        const date = new Date(isoString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' });
        // Example: "Apr 3, 9:15 PM"
    }

}); // End of DOMContentLoaded