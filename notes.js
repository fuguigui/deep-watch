/**
 * ALL NOTES — standalone page
 *
 * A full-tab view of every saved note, grouped by video, for reading and
 * organizing study notes without the side panel's narrow width. Reads and
 * writes the same chrome.storage.local notes the side panel's Notes tab
 * uses (via the same background actions), so edits and deletes here are
 * reflected there next time it loads, and vice versa.
 */

const DEBUG = false;
const debugLog = (...args) => {
  if (DEBUG) console.log(...args);
};

let allNotes = [];

document.addEventListener("DOMContentLoaded", async () => {
  document.getElementById("exportNotesBtn")?.addEventListener("click", exportNotes);
  document.getElementById("notesSearchInput")?.addEventListener("input", (event) => {
    renderGroups(filterNotes(allNotes, event.target.value));
  });

  await loadNotes();
});

async function loadNotes() {
  try {
    const result = await chrome.runtime.sendMessage({
      action: "getNotes",
      videoId: null,
    });
    allNotes = result?.notes || [];
  } catch (error) {
    console.error("[DeepWatch Notes] Load error:", error);
    allNotes = [];
  }
  renderGroups(allNotes);
}

function filterNotes(notes, query) {
  const needle = query.trim().toLowerCase();
  if (!needle) return notes;
  return notes.filter((note) =>
    [note.videoTitle, note.channelName, note.text, note.userNote]
      .filter(Boolean)
      .some((field) => field.toLowerCase().includes(needle)),
  );
}

/**
 * Groups a flat notes list by video, preserving first-seen order (notes
 * arrive newest-saved-first from storage).
 */
function groupNotesByVideo(notes) {
  const groups = new Map();
  for (const note of notes || []) {
    if (!groups.has(note.videoId)) {
      groups.set(note.videoId, {
        videoId: note.videoId,
        videoTitle: note.videoTitle,
        channelName: note.channelName,
        notes: [],
      });
    }
    groups.get(note.videoId).notes.push(note);
  }
  return [...groups.values()];
}

function renderGroups(notes) {
  const container = document.getElementById("notesGroups");
  const intro = document.getElementById("notesIntro");
  if (!container) return;

  container.innerHTML = "";

  if (!notes.length) {
    intro.style.display = "block";
    intro.textContent = allNotes.length
      ? "No notes match your search."
      : "No notes saved yet. Hover over a video and click Note to save one.";
    return;
  }
  intro.style.display = "none";

  for (const group of groupNotesByVideo(notes)) {
    const groupEl = document.createElement("div");
    groupEl.className = "note-group";

    const videoUrl = `https://www.youtube.com/watch?v=${group.videoId}`;
    groupEl.innerHTML = `
      <div class="note-group-title-row">
        <div class="note-group-title">
          <a href="${escapeHtml(videoUrl)}" target="_blank" rel="noreferrer">${escapeHtml(group.videoTitle || "Untitled video")}</a>
        </div>
        <span class="note-group-count">${group.notes.length} note${group.notes.length === 1 ? "" : "s"}</span>
      </div>
    `;

    const sorted = [...group.notes].sort(
      (a, b) => (a.timestampSeconds || 0) - (b.timestampSeconds || 0),
    );
    sorted.forEach((note) => groupEl.appendChild(createNoteElement(note)));

    container.appendChild(groupEl);
  }
}

function createNoteElement(note) {
  const noteEl = document.createElement("div");
  noteEl.className = "note-item";
  noteEl.innerHTML = `
    <div class="note-header">
      <a class="note-timestamp" href="${escapeHtml(note.timestampedUrl)}" target="_blank" rel="noreferrer">${escapeHtml(note.timestamp)}</a>
    </div>
    <div class="note-original-text">${escapeHtml(note.text)}</div>
    <div class="note-user-text" ${note.userNote ? "" : 'style="display: none"'}>${escapeHtml(note.userNote || "")}</div>
    <div class="note-edit-area" style="display: none">
      <textarea class="note-edit-textarea" placeholder="Add your own notes here…">${escapeHtml(note.userNote || "")}</textarea>
      <div class="note-edit-actions">
        <button class="note-action-btn note-edit-save">Save</button>
        <button class="note-action-btn note-edit-cancel">Cancel</button>
      </div>
    </div>
    <div class="note-actions">
      <button class="note-action-btn note-edit">${note.userNote ? "Edit note" : "Add note"}</button>
      <button class="note-action-btn note-copy-text">Copy text</button>
      <button class="note-delete" data-id="${escapeHtml(note.id)}" type="button" aria-label="Delete note" title="Delete note">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 6h18"></path>
          <path d="M8 6V4h8v2"></path>
          <path d="m19 6-1 14H6L5 6"></path>
          <path d="M10 11v5"></path>
          <path d="M14 11v5"></path>
        </svg>
      </button>
    </div>
  `;

  noteEl.querySelector(".note-delete").addEventListener("click", async () => {
    try {
      await chrome.runtime.sendMessage({ action: "deleteNote", noteId: note.id });
    } catch (error) {
      console.error("[DeepWatch Notes] Delete error:", error);
    }
    await loadNotes();
  });

  noteEl.querySelector(".note-copy-text").addEventListener("click", async () => {
    try {
      const combined = note.userNote ? `${note.text}\n\n${note.userNote}` : note.text;
      await navigator.clipboard.writeText(combined);
      const btn = noteEl.querySelector(".note-copy-text");
      btn.textContent = "Copied";
      setTimeout(() => {
        btn.textContent = "Copy text";
      }, 2000);
    } catch (error) {
      console.error("[DeepWatch Notes] Copy error:", error);
    }
  });

  const editArea = noteEl.querySelector(".note-edit-area");
  const userTextEl = noteEl.querySelector(".note-user-text");
  const textarea = noteEl.querySelector(".note-edit-textarea");
  noteEl.querySelector(".note-edit").addEventListener("click", () => {
    editArea.style.display = "block";
    userTextEl.style.display = "none";
    textarea.focus();
  });
  noteEl.querySelector(".note-edit-cancel").addEventListener("click", () => {
    textarea.value = note.userNote || "";
    editArea.style.display = "none";
    userTextEl.style.display = note.userNote ? "block" : "none";
  });
  noteEl.querySelector(".note-edit-save").addEventListener("click", async () => {
    const saveBtn = noteEl.querySelector(".note-edit-save");
    saveBtn.disabled = true;
    saveBtn.textContent = "Saving…";
    try {
      const result = await chrome.runtime.sendMessage({
        action: "updateNote",
        noteId: note.id,
        userNote: textarea.value,
      });
      if (result?.success) {
        note.userNote = result.note?.userNote || "";
        userTextEl.textContent = note.userNote;
        userTextEl.style.display = note.userNote ? "block" : "none";
        editArea.style.display = "none";
        noteEl.querySelector(".note-edit").textContent = note.userNote
          ? "Edit note"
          : "Add note";
      }
    } catch (error) {
      console.error("[DeepWatch Notes] Update error:", error);
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = "Save";
    }
  });

  return noteEl;
}

function buildNotesMarkdown(notes) {
  const groups = groupNotesByVideo(notes);
  let markdown = `# DeepWatch Notes\n\nExported ${new Date().toLocaleString()}\n\n`;

  for (const group of groups) {
    markdown += `## ${group.videoTitle || "Untitled video"}\n\n`;
    if (group.channelName) markdown += `${group.channelName}\n\n`;
    markdown += `https://www.youtube.com/watch?v=${group.videoId}\n\n`;

    const sorted = [...group.notes].sort(
      (a, b) => (a.timestampSeconds || 0) - (b.timestampSeconds || 0),
    );
    for (const note of sorted) {
      markdown += `- **[${note.timestamp}](${note.timestampedUrl})** "${note.text}"\n`;
      if (note.userNote) {
        markdown += `\n  ${note.userNote.replace(/\n/g, "\n  ")}\n`;
      }
      markdown += `\n`;
    }
  }

  return markdown;
}

async function exportNotes() {
  if (!allNotes.length) {
    alert("No notes saved yet.");
    return;
  }
  const markdown = buildNotesMarkdown(allNotes);
  const blob = new Blob([markdown], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `deepwatch-notes-${Date.now()}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text || "";
  return div.innerHTML;
}
