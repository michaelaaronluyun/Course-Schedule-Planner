// main logic
class ScheduleMaker {
    constructor() {
        // standard time slots
        this.standardSlots = [
            { start: "07:30", end: "09:00", label: "Slot 1", period: "morning" },
            { start: "09:15", end: "10:45", label: "Slot 2", period: "morning" },
            { start: "11:00", end: "12:30", label: "Slot 3", period: "morning" },
            { start: "12:45", end: "14:15", label: "Slot 4", period: "afternoon" },
            { start: "14:30", end: "16:00", label: "Slot 5", period: "afternoon" },
            { start: "16:15", end: "17:45", label: "Slot 6", period: "afternoon" },
            { start: "18:00", end: "19:30", label: "Slot 7", period: "evening" },
            { start: "19:45", end: "21:15", label: "Slot 8", period: "evening" }
        ];
        
        // Predefined color palette (10 colors)
        this.colorPalette = [
            '#3498db', // Blue
            '#2ecc71', // Green
            '#e74c3c', // Red
            '#f39c12', // Orange
            '#9b59b6', // Purple
            '#ff8a9d', // Pink
            '#34495e', // Dark Blue
            '#e67e22', // Dark Orange
            '#2c3e50', // Very Dark Blue
            '#00643c'  // Dark Green
        ];
        
        this.courses = [];
        this.currentSettings = {
            showWeekends: true,
            showWednesday: true,
            timeFormat: '12',
            highlightIrregular: true,
            hideEmptyRows: false
        };
        
        this.days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        this.daysShort = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        this.activeTimeFilter = 'all';
        
        this.selectedColor = this.colorPalette[0]; // Default to first color
        this.editSelectedColor = this.colorPalette[0];
        
        this.initialize();
    }
    
    initialize() {
        this.courseForm = document.getElementById('courseForm');
        this.courseNameInput = document.getElementById('courseName');
        this.courseDescriptionInput = document.getElementById('courseDescription');
        this.courseDescriptionCounter = document.getElementById('courseDescriptionCounter');
        this.startTimeInput = document.getElementById('startTime');
        this.endTimeInput = document.getElementById('endTime');
        this.colorPaletteElement = document.getElementById('colorPalette');
        this.editColorPaletteElement = document.getElementById('editColorPalette');
        this.colorPreview = document.getElementById('colorPreview');
        this.colorText = document.getElementById('colorText');
        this.editColorPreview = document.getElementById('editColorPreview');
        this.editColorText = document.getElementById('editColorText');
        this.timeSlotSelect = document.getElementById('timeSlotSelect');
        this.coursesContainer = document.getElementById('coursesContainer');
        this.emptyCourses = document.getElementById('emptyCourses');
        this.scheduleHeader = document.getElementById('scheduleHeader');
        this.scheduleBody = document.getElementById('scheduleBody');
        this.timeFormatSelect = document.getElementById('timeFormat');
        this.showWeekendsCheckbox = document.getElementById('showWeekends');
        this.showWednesdayCheckbox = document.getElementById('showWednesday');
        this.highlightIrregularCheckbox = document.getElementById('highlightIrregular');
        this.hideEmptyRowsCheckbox = document.getElementById('hideEmptyRows');
        this.clearAllBtn = document.getElementById('clearAllBtn');
        this.exportBtn = document.getElementById('exportBtn');
        this.printBtn = document.getElementById('printBtn');
        this.scheduleTable = document.getElementById('scheduleTable');
        
        this.addCourseBtn = document.getElementById('addCourseBtn');
        this.settingsBtn = document.getElementById('settingsBtn');
        this.viewCoursesBtn = document.getElementById('viewCoursesBtn');
        this.addCourseDialog = document.getElementById('addCourseDialog');
        this.settingsDialog = document.getElementById('settingsDialog');
        this.closeAddCourseDialog = document.getElementById('closeAddCourseDialog');
        this.closeSettingsDialog = document.getElementById('closeSettingsDialog');
        this.cancelAddCourse = document.getElementById('cancelAddCourse');
        this.cancelSettings = document.getElementById('cancelSettings');
        this.saveSettings = document.getElementById('saveSettings');

        this.editCourseDialog = document.getElementById('editCourseDialog');
        this.editCourseForm = document.getElementById('editCourseForm');
        this.editCourseNameInput = document.getElementById('editCourseName');
        this.editCourseDescriptionInput = document.getElementById('editCourseDescription');
        this.editCourseDescriptionCounter = document.getElementById('editCourseDescriptionCounter');
        this.editStartTimeInput = document.getElementById('editStartTime');
        this.editEndTimeInput = document.getElementById('editEndTime');
        this.editTimeSlotSelect = document.getElementById('editTimeSlotSelect');
        this.closeEditCourseDialog = document.getElementById('closeEditCourseDialog');
        this.saveEditedCourseBtn = document.getElementById('saveEditedCourse');
        this.deleteEditedCourseBtn = document.getElementById('deleteEditedCourse');
        this.cancelEditCourseBtn = document.getElementById('cancelEditCourse');

        this.currentlyEditedCourse = null;
        
        // Initialize color palettes
        this.initializeColorPalettes();
        
        this.setupEventListeners();
        this.generateSchedule();
    }
    
    initializeColorPalettes() {
        // Create color palette for add course dialog
        this.colorPaletteElement.innerHTML = '';
        this.colorPalette.forEach((color, index) => {
            const colorOption = document.createElement('div');
            colorOption.className = 'color-option';
            if (index === 0) colorOption.classList.add('selected');
            colorOption.style.backgroundColor = color;
            colorOption.dataset.color = color;
            colorOption.title = color;
            colorOption.addEventListener('click', () => {
                this.selectColor(color, 'add');
            });
            this.colorPaletteElement.appendChild(colorOption);
        });
        
        // Create color palette for edit course dialog
        this.editColorPaletteElement.innerHTML = '';
        this.colorPalette.forEach((color, index) => {
            const colorOption = document.createElement('div');
            colorOption.className = 'color-option';
            if (index === 0) colorOption.classList.add('selected');
            colorOption.style.backgroundColor = color;
            colorOption.dataset.color = color;
            colorOption.title = color;
            colorOption.addEventListener('click', () => {
                this.selectColor(color, 'edit');
            });
            this.editColorPaletteElement.appendChild(colorOption);
        });
        
        // Set initial preview
        this.colorPreview.style.backgroundColor = this.selectedColor;
        this.colorText.textContent = this.selectedColor;
        this.editColorPreview.style.backgroundColor = this.editSelectedColor;
        this.editColorText.textContent = this.editSelectedColor;
    }
    
    selectColor(color, dialogType) {
        if (dialogType === 'add') {
            this.selectedColor = color;
            this.colorPreview.style.backgroundColor = color;
            this.colorText.textContent = color;
            
            // Update selected state in palette
            this.colorPaletteElement.querySelectorAll('.color-option').forEach(option => {
                option.classList.remove('selected');
                if (option.dataset.color === color) {
                    option.classList.add('selected');
                }
            });
        } else if (dialogType === 'edit') {
            this.editSelectedColor = color;
            this.editColorPreview.style.backgroundColor = color;
            this.editColorText.textContent = color;
            
            // Update selected state in edit palette
            this.editColorPaletteElement.querySelectorAll('.color-option').forEach(option => {
                option.classList.remove('selected');
                if (option.dataset.color === color) {
                    option.classList.add('selected');
                }
            });
        }
    }
    
    setupEventListeners() {
        this.timeSlotSelect.addEventListener('change', (e) => {
            if (e.target.value) {
                const [start, end] = e.target.value.split('-');
                this.startTimeInput.value = start;
                this.endTimeInput.value = end;
            }
        });
        
        // Character counter for description
        this.courseDescriptionInput.addEventListener('input', () => {
            const count = this.courseDescriptionInput.value.length;
            this.courseDescriptionCounter.textContent = `${count}/30`;
            this.courseDescriptionCounter.classList.toggle('warning', count >= 30);
        });

        this.editCourseDescriptionInput.addEventListener('input', () => {
            const count = this.editCourseDescriptionInput.value.length;
            this.editCourseDescriptionCounter.textContent = `${count}/30`;
            this.editCourseDescriptionCounter.classList.toggle('warning', count >= 30);
        });
        
        this.courseForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addCourse();
            this.closeDialog(this.addCourseDialog);
        });
        
        this.clearAllBtn.addEventListener('click', () => {
            if (this.courses.length > 0 && confirm('Are you sure you want to remove all courses?')) {
                this.courses = [];
                this.updateCoursesList();
                this.generateSchedule();
            }
        });
        
        this.addCourseBtn.addEventListener('click', () => {
            this.openDialog(this.addCourseDialog);
        });
        
        this.settingsBtn.addEventListener('click', () => {
            this.openDialog(this.settingsDialog);
            this.timeFormatSelect.value = this.currentSettings.timeFormat;
            this.showWeekendsCheckbox.checked = this.currentSettings.showWeekends;
            this.showWednesdayCheckbox.checked = this.currentSettings.showWednesday;
            this.highlightIrregularCheckbox.checked = this.currentSettings.highlightIrregular;
            this.hideEmptyRowsCheckbox.checked = this.currentSettings.hideEmptyRows;
        });
        
        this.viewCoursesBtn.addEventListener('click', () => {
            document.querySelector('.courses-sidebar').scrollIntoView({ behavior: 'smooth' });
        });
        
        this.closeAddCourseDialog.addEventListener('click', () => {
            this.closeDialog(this.addCourseDialog);
        });
        
        this.closeSettingsDialog.addEventListener('click', () => {
            this.closeDialog(this.settingsDialog);
        });
        
        this.cancelAddCourse.addEventListener('click', () => {
            this.closeDialog(this.addCourseDialog);
        });
        
        this.cancelSettings.addEventListener('click', () => {
            this.closeDialog(this.settingsDialog);
        });
        
        this.saveSettings.addEventListener('click', () => {
            this.currentSettings.timeFormat = this.timeFormatSelect.value;
            this.currentSettings.showWeekends = this.showWeekendsCheckbox.checked;
            this.currentSettings.showWednesday = this.showWednesdayCheckbox.checked;
            this.currentSettings.highlightIrregular = this.highlightIrregularCheckbox.checked;
            this.currentSettings.hideEmptyRows = this.hideEmptyRowsCheckbox.checked;
            
            this.generateSchedule();
            
            this.closeDialog(this.settingsDialog);
        });
        
        this.exportBtn.addEventListener('click', () => {
            this.exportSchedule();
        });
        
        this.printBtn.addEventListener('click', () => {
            window.print();
        });
        
        document.querySelectorAll('.time-slot-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.time-slot-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.activeTimeFilter = e.target.dataset.slot;
                this.generateSchedule();
            });
        });
        
        [this.addCourseDialog, this.settingsDialog].forEach(dialog => {
            dialog.addEventListener('click', (e) => {
                if (e.target === dialog) {
                    this.closeDialog(dialog);
                }
            });
        });

        this.editTimeSlotSelect.addEventListener('change', (e) => {
            if (e.target.value) {
                const [start, end] = e.target.value.split('-');
                this.editStartTimeInput.value = start;
                this.editEndTimeInput.value = end;
            }
        });

        this.closeEditCourseDialog.addEventListener('click', () => {
            this.closeDialog(this.editCourseDialog);
        });

        this.cancelEditCourseBtn.addEventListener('click', () => {
            this.closeDialog(this.editCourseDialog);
        });

        this.saveEditedCourseBtn.addEventListener('click', () => {
            this.saveEditedCourse();
        });

        this.deleteEditedCourseBtn.addEventListener('click', () => {
            this.deleteCourse(this.currentlyEditedCourse.id);
            this.closeDialog(this.editCourseDialog);
        });

        this.editCourseDialog.addEventListener('click', (e) => {
            if (e.target === this.editCourseDialog) {
                this.closeDialog(this.editCourseDialog);
            }
        });
    }
    
    openDialog(dialog) {
        dialog.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    closeDialog(dialog) {
        dialog.classList.remove('active');
        document.body.style.overflow = 'auto';

        if (dialog === this.addCourseDialog) {
            this.courseForm.reset();
            this.startTimeInput.value = "07:30";
            this.endTimeInput.value = "09:00";
            this.timeSlotSelect.value = "";
            this.courseDescriptionCounter.textContent = "0/30";
            this.courseDescriptionCounter.classList.remove('warning');
            
            // Reset to default color
            this.selectedColor = this.colorPalette[0];
            this.colorPreview.style.backgroundColor = this.selectedColor;
            this.colorText.textContent = this.selectedColor;
            
            // Update selected state in palette
            this.colorPaletteElement.querySelectorAll('.color-option').forEach((option, index) => {
                option.classList.toggle('selected', index === 0);
            });
        }
        
        if (dialog === this.editCourseDialog) {
            this.editCourseDescriptionCounter.textContent = "0/30";
            this.editCourseDescriptionCounter.classList.remove('warning');
        }
    }

    openEditDialog(course) {
        this.currentlyEditedCourse = course;
        
        this.editCourseNameInput.value = course.name;
        this.editCourseDescriptionInput.value = course.description || '';
        
        // Update character counter
        const descCount = course.description ? course.description.length : 0;
        this.editCourseDescriptionCounter.textContent = `${descCount}/30`;
        this.editCourseDescriptionCounter.classList.toggle('warning', descCount >= 30);
        
        this.editStartTimeInput.value = course.startTime;
        this.editEndTimeInput.value = course.endTime;
        
        // Set selected color
        this.editSelectedColor = course.color;
        this.editColorPreview.style.backgroundColor = course.color;
        this.editColorText.textContent = course.color;
        
        // Update selected state in edit palette
        this.editColorPaletteElement.querySelectorAll('.color-option').forEach(option => {
            option.classList.remove('selected');
            if (option.dataset.color === course.color) {
                option.classList.add('selected');
            }
        });
        
        document.querySelectorAll('input[name="editDay"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        course.days.forEach(day => {
            const dayCheckbox = document.querySelector(`input[name="editDay"][value="${day}"]`);
            if (dayCheckbox) {
                dayCheckbox.checked = true;
            }
        });
        
        const timeSlotValue = `${course.startTime}-${course.endTime}`;
        const timeSlotOption = Array.from(this.editTimeSlotSelect.options).find(option => 
            option.value === timeSlotValue
        );
        
        if (timeSlotOption) {
            this.editTimeSlotSelect.value = timeSlotValue;
        } else {
            this.editTimeSlotSelect.value = "";
        }
        
        this.openDialog(this.editCourseDialog);
    }

    saveEditedCourse() {
        if (!this.currentlyEditedCourse) return;
        
        const dayCheckboxes = document.querySelectorAll('input[name="editDay"]:checked');
        const selectedDays = Array.from(dayCheckboxes).map(cb => cb.value);
        
        if (selectedDays.length === 0) {
            alert('Please select at least one day for the course');
            return;
        }

        const courseName = this.editCourseNameInput.value.trim();
        if (courseName.length === 0) {
            alert('Please enter a course name');
            return;
        }
        
        if (courseName.length > 10) {
            alert('Course name must be 10 characters or less');
            return;
        }
        
        if (this.editStartTimeInput.value >= this.editEndTimeInput.value) {
            alert('End time must be after start time');
            return;
        }
        
        const matchedSlot = this.findClosestTimeSlot(this.editStartTimeInput.value, this.editEndTimeInput.value);
        const isStandard = matchedSlot && 
            this.editStartTimeInput.value === matchedSlot.start && 
            this.editEndTimeInput.value === matchedSlot.end;
        
        this.currentlyEditedCourse.name = courseName;
        this.currentlyEditedCourse.description = this.editCourseDescriptionInput.value.trim() || '';
        this.currentlyEditedCourse.startTime = this.editStartTimeInput.value;
        this.currentlyEditedCourse.endTime = this.editEndTimeInput.value;
        this.currentlyEditedCourse.days = selectedDays;
        this.currentlyEditedCourse.color = this.editSelectedColor;
        this.currentlyEditedCourse.isStandard = isStandard;
        this.currentlyEditedCourse.matchedSlot = matchedSlot ? matchedSlot.label : null;
        
        this.updateCoursesList();
        this.generateSchedule();
        
        this.closeDialog(this.editCourseDialog);
        this.currentlyEditedCourse = null;
    }
    
    addCourse() {
        const dayCheckboxes = document.querySelectorAll('input[name="day"]:checked');
        const selectedDays = Array.from(dayCheckboxes).map(cb => cb.value);
        
        if (selectedDays.length === 0) {
            alert('Please select at least one day for the course');
            return;
        }

        const courseName = this.courseNameInput.value.trim();
        if (courseName.length === 0) {
            alert('Please enter a course name');
            return;
        }
        
        if (courseName.length > 10) {
            alert('Course name must be 10 characters or less');
            return;
        }
        
        if (this.startTimeInput.value >= this.endTimeInput.value) {
            alert('End time must be after start time');
            return;
        }

        const newCourseStart = this.timeToMinutes(this.startTimeInput.value);
        const newCourseEnd = this.timeToMinutes(this.endTimeInput.value);
        
        let hasOverlap = false;
        let overlappingCourse = null;
        
        for (const existingCourse of this.courses) {
            const sharedDays = selectedDays.filter(day => existingCourse.days.includes(day));
            if (sharedDays.length === 0) continue;
            
            const existingStart = this.timeToMinutes(existingCourse.startTime);
            const existingEnd = this.timeToMinutes(existingCourse.endTime);
            
            if (newCourseStart < existingEnd && newCourseEnd > existingStart) {
                hasOverlap = true;
                overlappingCourse = existingCourse;
                break;
            }
        }
        
        if (hasOverlap) {
            alert(`Cannot add course: "${courseName}" overlaps with "${overlappingCourse.name}" on ${selectedDays.join(', ')}`);
            return;
        }
        
        const matchedSlot = this.findClosestTimeSlot(this.startTimeInput.value, this.endTimeInput.value);
        const isStandard = matchedSlot && 
            this.startTimeInput.value === matchedSlot.start && 
            this.endTimeInput.value === matchedSlot.end;
        
        const course = {
            id: Date.now(),
            name: this.courseNameInput.value,
            description: this.courseDescriptionInput.value.trim() || '',
            startTime: this.startTimeInput.value,
            endTime: this.endTimeInput.value,
            days: selectedDays,
            color: this.selectedColor,
            isStandard: isStandard,
            matchedSlot: matchedSlot ? matchedSlot.label : null
        };
        
        this.courses.push(course);
        
        this.updateCoursesList();
        this.generateSchedule();
        
        this.courseForm.reset();
        this.startTimeInput.value = "07:30";
        this.endTimeInput.value = "09:00";
        this.timeSlotSelect.value = "";
        this.courseDescriptionCounter.textContent = "0/30";
        this.courseDescriptionCounter.classList.remove('warning');
        
        // Reset to default color
        this.selectedColor = this.colorPalette[0];
        this.colorPreview.style.backgroundColor = this.selectedColor;
        this.colorText.textContent = this.selectedColor;
        
        // Update selected state in palette
        this.colorPaletteElement.querySelectorAll('.color-option').forEach((option, index) => {
            option.classList.toggle('selected', index === 0);
        });
    }
    
    findClosestTimeSlot(startTime, endTime) {
        let closestSlot = null;
        let minDiff = Infinity;
        
        const startMinutes = this.timeToMinutes(startTime);
        const endMinutes = this.timeToMinutes(endTime);
        const duration = endMinutes - startMinutes;
        
        this.standardSlots.forEach(slot => {
            const slotStart = this.timeToMinutes(slot.start);
            const slotEnd = this.timeToMinutes(slot.end);
            const slotDuration = slotEnd - slotStart;
            
            const startDiff = Math.abs(startMinutes - slotStart);
            const endDiff = Math.abs(endMinutes - slotEnd);
            const totalDiff = startDiff + endDiff;
            
            if (Math.abs(duration - slotDuration) <= 45 && totalDiff < minDiff) {
                minDiff = totalDiff;
                closestSlot = slot;
            }
        });
        
        return closestSlot;
    }
    
    timeToMinutes(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    }
    
    deleteCourse(id) {
        this.courses = this.courses.filter(course => course.id !== id);
        
        if (this.currentlyEditedCourse && this.currentlyEditedCourse.id === id) {
            this.currentlyEditedCourse = null;
            this.closeDialog(this.editCourseDialog);
        }
        
        this.updateCoursesList();
        this.generateSchedule();
    }
    
    updateCoursesList() {
        this.coursesContainer.innerHTML = '';
        
        if (this.courses.length === 0) {
            this.coursesContainer.appendChild(this.emptyCourses.cloneNode(true));
            return;
        }
        
        this.courses.forEach(course => {
            const courseElement = document.createElement('div');
            courseElement.className = 'course-item';
            courseElement.style.backgroundColor = course.color;
            courseElement.dataset.id = course.id;
            
            if (!course.isStandard && this.currentSettings.highlightIrregular) {
                courseElement.classList.add('irregular-time');
            }
            
            const courseInfo = document.createElement('div');
            courseInfo.className = 'course-info';
            
            const courseName = document.createElement('div');
            courseName.className = 'course-name';
            courseName.textContent = course.name;
            
            const courseDetails = document.createElement('div');
            courseDetails.className = 'course-details';
            const timeDisplay = this.formatTimeForDisplay(course.startTime) + ' - ' + this.formatTimeForDisplay(course.endTime);
            courseDetails.innerHTML = `
                <div><i class="fas fa-clock"></i> ${timeDisplay}</div>
                ${course.description ? `<div><i class="fas fa-align-left"></i> ${course.description}</div>` : ''}
                <div><i class="fas fa-calendar"></i> ${course.days.map(d => d.substring(0, 3)).join(', ')}</div>
                ${!course.isStandard ? '<div><i class="fas fa-exclamation-triangle"></i> Irregular time</div>' : ''}
            `;
            
            courseInfo.appendChild(courseName);
            courseInfo.appendChild(courseDetails);
            
            const courseActions = document.createElement('div');
            courseActions.className = 'course-actions';
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn-icon';
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            deleteBtn.title = 'Delete course';
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteCourse(course.id);
            });

            const editBtn = document.createElement('button');
            editBtn.className = 'btn-icon';
            editBtn.innerHTML = '<i class="fas fa-edit"></i>';
            editBtn.title = 'Edit course';
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.openEditDialog(course);
            });
            
            courseActions.appendChild(editBtn);
            courseActions.appendChild(deleteBtn);
            
            courseElement.appendChild(courseInfo);
            courseElement.appendChild(courseActions);
            
            this.coursesContainer.appendChild(courseElement);
        });
    }
    
    generateSchedule() {
        this.scheduleHeader.innerHTML = '';
        this.scheduleBody.innerHTML = '';
        
        document.querySelectorAll('.schedule-event').forEach(event => event.remove());
        
        let daysToShow = [];
        let daysShortToShow = [];

        if (!this.currentSettings.showWednesday) {
            daysToShow = this.days.filter(day => day !== 'Wednesday');
            daysShortToShow = this.daysShort.filter(day => day !== 'Wed');
            
            if (!this.currentSettings.showWeekends) {
                daysToShow = daysToShow.filter(day => day !== 'Saturday');
                daysShortToShow = daysShortToShow.filter(day => day !== 'Sat');
            }
        } else {
            daysToShow = this.currentSettings.showWeekends 
                ? this.days 
                : this.days.slice(0, 5);
            
            daysShortToShow = this.currentSettings.showWeekends
                ? this.daysShort
                : this.daysShort.slice(0, 5);
        }

        const headerRow = document.createElement('tr');
        
        const timeHeader = document.createElement('th');
        timeHeader.className = 'time-slot-header';
        timeHeader.textContent = 'Time Slot';
        headerRow.appendChild(timeHeader);
        
        daysToShow.forEach((day, index) => {
            const dayHeader = document.createElement('th');
            dayHeader.className = 'day-header';
            dayHeader.innerHTML = `
                <div>${daysShortToShow[index]}</div>
            `;
            headerRow.appendChild(dayHeader);
        });
        
        this.scheduleHeader.appendChild(headerRow);
        
        let slotsToShow = this.standardSlots;
        if (this.activeTimeFilter !== 'all') {
            slotsToShow = this.standardSlots.filter(slot => slot.period === this.activeTimeFilter);
        }
        
        // Check if we should hide empty rows
        if (this.currentSettings.hideEmptyRows) {
            // Filter slots to only show those that have courses
            slotsToShow = this.getSlotsWithCourses(slotsToShow, daysToShow);
        }
        
        slotsToShow.forEach((slot, slotIndex) => {
            const row = document.createElement('tr');
            row.dataset.slot = slot.label;
            row.dataset.period = slot.period;
            
            const timeCell = document.createElement('td');
            timeCell.className = 'time-slot-header';
            
            const timeDiv = document.createElement('div');
            timeDiv.className = 'time-slot';
            
            const timeRange = document.createElement('div');
            timeRange.className = 'time-range';
            timeRange.textContent = `${this.formatTimeForDisplay(slot.start)} - ${this.formatTimeForDisplay(slot.end)}`;
            
            const slotLabel = document.createElement('div');
            slotLabel.className = 'slot-label';
            
            timeDiv.appendChild(timeRange);
            timeDiv.appendChild(slotLabel);
            timeCell.appendChild(timeDiv);
            row.appendChild(timeCell);
            
            daysToShow.forEach(day => {
                const cell = document.createElement('td');
                cell.className = 'schedule-cell';
                cell.dataset.day = day;
                cell.dataset.slot = slot.label;
                cell.dataset.start = slot.start;
                cell.dataset.end = slot.end;
                
                const dropzone = document.createElement('div');
                dropzone.className = 'cell-dropzone';
                dropzone.addEventListener('click', () => this.handleCellClick(day, slot));
                cell.appendChild(dropzone);
                
                row.appendChild(cell);
            });
            
            this.scheduleBody.appendChild(row);
        });
        
        this.renderCoursesOnSchedule();
    }
    
    // Get slots that have courses
    getSlotsWithCourses(slotsToCheck, daysToShow) {
        const slotsWithCourses = new Set();
        
        // Check each course and mark which slots it appears in
        this.courses.forEach(course => {
            const slotIndex = this.standardSlots.findIndex(slot => 
                slot.start === course.matchedSlot?.replace('Slot ', '') || 
                (this.timeToMinutes(course.startTime) >= this.timeToMinutes(slot.start) - 15 &&
                this.timeToMinutes(course.endTime) <= this.timeToMinutes(slot.end) + 15)
            );
            
            if (slotIndex !== -1) {
                const slot = this.standardSlots[slotIndex];
                // Check if this slot should be shown based on active filter
                if (this.activeTimeFilter === 'all' || slot.period === this.activeTimeFilter) {
                    slotsWithCourses.add(slotIndex);
                }
            } else {
                // For courses that don't match exactly, find nearest slot
                const courseStartMinutes = this.timeToMinutes(course.startTime);
                let nearestSlotIndex = 0;
                let minDiff = Infinity;
                
                this.standardSlots.forEach((slot, index) => {
                    const slotStartMinutes = this.timeToMinutes(slot.start);
                    const diff = Math.abs(courseStartMinutes - slotStartMinutes);
                    if (diff < minDiff) {
                        minDiff = diff;
                        nearestSlotIndex = index;
                    }
                });
                
                const slot = this.standardSlots[nearestSlotIndex];
                if (this.activeTimeFilter === 'all' || slot.period === this.activeTimeFilter) {
                    slotsWithCourses.add(nearestSlotIndex);
                }
            }
        });
        
        // Convert set back to slots array
        return slotsToCheck.filter(slot => {
            const slotIndex = this.standardSlots.findIndex(s => 
                s.start === slot.start && s.end === slot.end
            );
            return slotsWithCourses.has(slotIndex);
        });
    }
    
    renderCoursesOnSchedule() {
        this.courses.forEach(course => {
            const start = this.parseTime(course.startTime);
            const end = this.parseTime(course.endTime);
            
            const slotIndex = this.standardSlots.findIndex(slot => 
                slot.start === course.matchedSlot?.replace('Slot ', '') || 
                (this.timeToMinutes(course.startTime) >= this.timeToMinutes(slot.start) - 15 &&
                this.timeToMinutes(course.endTime) <= this.timeToMinutes(slot.end) + 15)
            );
            
            if (slotIndex === -1) {
                const courseStartMinutes = this.timeToMinutes(course.startTime);
                let nearestSlotIndex = 0;
                let minDiff = Infinity;
                
                this.standardSlots.forEach((slot, index) => {
                    const slotStartMinutes = this.timeToMinutes(slot.start);
                    const diff = Math.abs(courseStartMinutes - slotStartMinutes);
                    if (diff < minDiff) {
                        minDiff = diff;
                        nearestSlotIndex = index;
                    }
                });
                
                const slot = this.standardSlots[nearestSlotIndex];
                
                // Check if slot is visible (might be hidden if hideEmptyRows is on)
                const isSlotVisible = this.isSlotVisible(slot);
                if (!isSlotVisible) return;
                
                if (this.activeTimeFilter !== 'all' && slot.period !== this.activeTimeFilter) {
                    return;
                }
                
                course.days.forEach(dayName => {
                    const daysToShow = this.getDaysToShow();
                    
                    if (!daysToShow.includes(dayName)) return;
                    
                    const dayIndex = daysToShow.indexOf(dayName);
                    
                    const slotRow = this.scheduleBody.querySelector(`tr[data-slot="${slot.label}"]`);
                    if (!slotRow) return;
                    
                    const targetCell = slotRow.children[dayIndex + 1];
                    if (!targetCell) return;
                    
                    const eventElement = this.createScheduleEventElement(course, slot);
                    
                    const dropzone = targetCell.querySelector('.cell-dropzone');
                    if (dropzone) {
                        dropzone.style.position = 'relative';
                        dropzone.appendChild(eventElement);
                    }
                });
                
                return;
            }
            
            const slot = this.standardSlots[slotIndex];
            
            // Check if slot is visible (might be hidden if hideEmptyRows is on)
            const isSlotVisible = this.isSlotVisible(slot);
            if (!isSlotVisible) return;
            
            if (this.activeTimeFilter !== 'all' && slot.period !== this.activeTimeFilter) {
                return;
            }
            
            course.days.forEach(dayName => {
                const daysToShow = this.getDaysToShow();
                
                if (!daysToShow.includes(dayName)) return;
                
                const dayIndex = daysToShow.indexOf(dayName);
                
                const slotRow = this.scheduleBody.querySelector(`tr[data-slot="${slot.label}"]`);
                if (!slotRow) return;
                
                const targetCell = slotRow.children[dayIndex + 1];
                if (!targetCell) return;
                
                const eventElement = this.createScheduleEventElement(course, slot);
                
                const dropzone = targetCell.querySelector('.cell-dropzone');
                if (dropzone) {
                    dropzone.style.position = 'relative';
                    dropzone.appendChild(eventElement);
                }
            });
        });
    }
    
    // Check if a slot is currently visible in the table
    isSlotVisible(slot) {
        if (!this.currentSettings.hideEmptyRows) return true;
        
        // Check if there's a row for this slot in the schedule body
        const slotRow = this.scheduleBody.querySelector(`tr[data-slot="${slot.label}"]`);
        return slotRow !== null;
    }

    getDaysToShow() {
        let daysToShow = [...this.days];
        
        if (!this.currentSettings.showWednesday) {
            const wedIndex = daysToShow.indexOf('Wednesday');
            if (wedIndex !== -1) {
                daysToShow.splice(wedIndex, 1);
            }
        }
        
        if (!this.currentSettings.showWeekends) {
            const satIndex = daysToShow.indexOf('Saturday');
            if (satIndex !== -1) {
                daysToShow.splice(satIndex, 1);
            }
        }
        
        return daysToShow;
    }

    getDaysShortToShow() {
        let daysShortToShow = [...this.daysShort];
        
        if (!this.currentSettings.showWednesday) {
            const wedIndex = daysShortToShow.indexOf('Wed');
            if (wedIndex !== -1) {
                daysShortToShow.splice(wedIndex, 1);
            }
        }
        
        if (!this.currentSettings.showWeekends) {
            const satIndex = daysShortToShow.indexOf('Sat');
            if (satIndex !== -1) {
                daysShortToShow.splice(satIndex, 1);
            }
        }
        
        return daysShortToShow;
    }

    createScheduleEventElement(course, slot) {
        const eventElement = document.createElement('div');
        eventElement.className = 'schedule-event';
        eventElement.style.backgroundColor = course.color;
        eventElement.dataset.courseId = course.id;
        
        if (!course.isStandard && this.currentSettings.highlightIrregular) {
            eventElement.classList.add('irregular-time');
            eventElement.style.border = '2px dashed rgba(255, 255, 255, 0.5)';
        }
        
        if (course.isStandard) {
            eventElement.style.top = '0';
            eventElement.style.height = '100%';
        } else {
            const slotStartMinutes = this.timeToMinutes(slot.start);
            const courseStartMinutes = this.timeToMinutes(course.startTime);
            const slotEndMinutes = this.timeToMinutes(slot.end);
            const courseEndMinutes = this.timeToMinutes(course.endTime);
            const slotDuration = slotEndMinutes - slotStartMinutes;
            
            const startOffset = Math.max(0, courseStartMinutes - slotStartMinutes);
            const endOffset = Math.max(0, slotEndMinutes - courseEndMinutes);
            
            const startPercent = (startOffset / slotDuration) * 100;
            const endPercent = (endOffset / slotDuration) * 100;
            const heightPercent = 100 - startPercent - endPercent;
            
            eventElement.style.top = `${startPercent}%`;
            eventElement.style.height = `${heightPercent}%`;
            
            if (heightPercent < 30) {
                eventElement.style.zIndex = '10';
                eventElement.style.boxShadow = '0 0 0 2px rgba(231, 76, 60, 0.3)';
            }
        }
        
        const displayStart = this.formatTimeForDisplay(course.startTime);
        const displayEnd = this.formatTimeForDisplay(course.endTime);
        eventElement.innerHTML = `
            <div class="event-title">${course.name}</div>
            ${course.description ? `<div class="event-description">${course.description}</div>` : ''}
            <div class="event-time">${displayStart} - ${displayEnd}</div>
        `;
        
        eventElement.addEventListener('click', (e) => {
            e.stopPropagation();
            this.openEditDialog(course);
        });
        
        return eventElement;
    }
    
    handleCellClick(day, slot) {
        this.openDialog(this.addCourseDialog);

        document.querySelectorAll('input[name="day"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        const dayCheckbox = document.querySelector(`input[name="day"][value="${day}"]`);
        if (dayCheckbox) {
            dayCheckbox.checked = true;
        }
        
        this.startTimeInput.value = slot.start;
        this.endTimeInput.value = slot.end;
        
        const timeSlotValue = `${slot.start}-${slot.end}`;
        const timeSlotOption = Array.from(this.timeSlotSelect.options).find(option => 
            option.value === timeSlotValue
        );
        
        if (timeSlotOption) {
            this.timeSlotSelect.value = timeSlotValue;
        } else {
            this.timeSlotSelect.value = "";
        }
        
        this.courseNameInput.value = `${day.substring(0, 3)} ${slot.label}`;
        
        setTimeout(() => {
            this.courseNameInput.focus();
            this.courseNameInput.select();
        }, 100);
    }
    
    exportSchedule() {
        const originalText = this.exportBtn.innerHTML;
        this.exportBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Exporting...';
        this.exportBtn.disabled = true;
        
        const scheduleContainer = document.querySelector('.schedule-table-container');
        
        setTimeout(() => {
            html2canvas(scheduleContainer, {
                scale: 2,
                backgroundColor: '#ffffff',
                useCORS: true,
                logging: false,
                allowTaint: true,
                scrollX: 0,
                scrollY: -window.scrollY
            }).then(canvas => {
                const image = canvas.toDataURL('image/png', 1.0);
                
                const link = document.createElement('a');
                const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
                link.download = `my-schedule.png`;
                link.href = image;
                
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                this.exportBtn.innerHTML = originalText;
                this.exportBtn.disabled = false;
                
            }).catch(error => {
                console.error('Error exporting schedule:', error);
                
                this.exportBtn.innerHTML = originalText;
                this.exportBtn.disabled = false;
                
                alert('Error exporting schedule. Please make sure the schedule is fully loaded and try again.');
            });
        }, 100);
    }
    
    parseTime(timeString) {
        const [hour, minute] = timeString.split(':').map(Number);
        return { hour, minute };
    }
    
    formatTimeForDisplay(timeString) {
        const [hour, minute] = timeString.split(':');
        const hourNum = parseInt(hour);
        
        if (this.currentSettings.timeFormat === '12') {
            const ampm = hourNum >= 12 ? 'PM' : 'AM';
            const displayHour = hourNum % 12 || 12;
            return `${displayHour}:${minute.padStart(2, '0')} ${ampm}`;
        } else {
            return `${hour}:${minute.padStart(2, '0')}`;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.scheduleMaker = new ScheduleMaker();
});