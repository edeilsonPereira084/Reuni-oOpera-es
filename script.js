document.addEventListener('DOMContentLoaded', function () {
    const meetingForm = document.getElementById('meetingForm');
    const meetingList = document.getElementById('meetingItems');
    const removeAttachmentContainer = document.getElementById('removeAttachmentContainer');
    const removeAttachment = document.getElementById('removeAttachment');
    const toggleModeButton = document.getElementById('toggleModeButton');
    const themeIcon = document.getElementById('theme-icon');

    let editMode = false;
    let editId = null;

    function addMeeting(event) {
        event.preventDefault();

        const sector = document.getElementById('sector').value;
        const name = document.getElementById('name').value;
        const subject = document.getElementById('subject').value;
        const summary = document.getElementById('summary').value;
        const duration = document.getElementById('duration').value;
        const fileInput = document.getElementById('file');
        const file = fileInput.files[0];

        const reader = new FileReader();

        reader.onload = function (event) {
            const meetingItem = {
                sector,
                name,
                subject,
                summary,
                duration,
                fileName: file ? file.name : '',
                fileData: file ? event.target.result : '',
                id: editMode ? editId : Date.now()
            };

            if (editMode) {
                if (removeAttachment.checked) {
                    meetingItem.fileName = '';
                    meetingItem.fileData = '';
                }
                updateMeetingItem(meetingItem);
                editMode = false;
                editId = null;
                removeAttachment.checked = false;
                removeAttachmentContainer.style.display = 'none';
            } else {
                saveMeetingItem(meetingItem);
                addMeetingItemToDOM(meetingItem);
            }
            meetingForm.reset();
        };

        if (file) {
            reader.readAsDataURL(file);
        } else {
            reader.onload();
        }
    }

    meetingForm.addEventListener('submit', addMeeting);

    function loadMeetings() {
        const meetings = JSON.parse(localStorage.getItem('meetings')) || [];
        meetings.forEach(addMeetingItemToDOM);
    }

    function saveMeetingItem(meetingItem) {
        const meetings = JSON.parse(localStorage.getItem('meetings')) || [];
        meetings.push(meetingItem);
        localStorage.setItem('meetings', JSON.stringify(meetings));
    }

    function updateMeetingItem(updatedMeetingItem) {
        let meetings = JSON.parse(localStorage.getItem('meetings')) || [];
        meetings = meetings.map(meetingItem => meetingItem.id === updatedMeetingItem.id ? updatedMeetingItem : meetingItem);
        localStorage.setItem('meetings', JSON.stringify(meetings));
        reloadMeetings();
    }

    function deleteMeetingItem(id) {
        let meetings = JSON.parse(localStorage.getItem('meetings')) || [];
        meetings = meetings.filter(meetingItem => meetingItem.id !== id);
        localStorage.setItem('meetings', JSON.stringify(meetings));
        reloadMeetings();
    }

    function addMeetingItemToDOM(meetingItem) {
        const meetingItemElement = document.createElement('li');
        meetingItemElement.setAttribute('data-id', meetingItem.id);
        meetingItemElement.innerHTML = `
            <div>
                <strong>Setor:</strong> ${meetingItem.sector}<br>
                <strong>Nome:</strong> ${meetingItem.name}<br>
                <strong>Assunto:</strong> ${meetingItem.subject}<br>
                <strong>Resumo:</strong> ${meetingItem.summary}<br>
                <strong>Duração sugerida:</strong> ${meetingItem.duration} minutos<br>
                ${meetingItem.fileName ? `<strong>Anexo:</strong> <a href="${meetingItem.fileData}" download="${meetingItem.fileName}">${meetingItem.fileName}</a>` : ''}
            </div>
            <div class="actions">
                <button class="edit">Editar</button>
                <button class="delete">Excluir</button>
            </div>
        `;

        const editButton = meetingItemElement.querySelector('.edit');
        const deleteButton = meetingItemElement.querySelector('.delete');

        editButton.addEventListener('click', () => {
            const sector = document.getElementById('sector');
            const name = document.getElementById('name');
            const subject = document.getElementById('subject');
            const summary = document.getElementById('summary');
            const duration = document.getElementById('duration');
            const fileInput = document.getElementById('file');

            sector.value = meetingItem.sector;
            name.value = meetingItem.name;
            subject.value = meetingItem.subject;
            summary.value = meetingItem.summary;
            duration.value = meetingItem.duration;

            editMode = true;
            editId = meetingItem.id;
            removeAttachmentContainer.style.display = 'block';
        });

        deleteButton.addEventListener('click', () => {
            const id = meetingItem.id;
            deleteMeetingItem(id);
        });

        meetingList.appendChild(meetingItemElement);
    }

    function reloadMeetings() {
        meetingList.innerHTML = '';
        loadMeetings();
    }

    loadMeetings();

    function toggleDarkMode() {
        const body = document.body;
        body.classList.toggle('dark-mode');
        if (body.classList.contains('dark-mode')) {
            themeIcon.textContent = '☀️';
        } else {
            themeIcon.textContent = '🌙';
        }
    }

    toggleModeButton.addEventListener('click', toggleDarkMode);
});
