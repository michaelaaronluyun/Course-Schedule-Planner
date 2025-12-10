// Schedule Maker Logic with University Time Slots
class ScheduleMaker {
    constructor() {
        // Standard university time slots
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
        
        this.courses = [];
        this.currentSettings = {
            showWeekends: true,
            showWednesday: true,
            timeFormat: '12',
            highlightIrregular: true
        };
        
        this.days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        this.daysShort = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        this.activeTimeFilter = 'all';
        
        this.initialize();
    }
    
    initialize() {
        // Initialize DOM elements
        this.courseForm = document.getElementById('courseForm');
        this.courseNameInput = document.getElementById('courseName');
        this.startTimeInput = document.getElementById('startTime');
        this.endTimeInput = document.getElementById('endTime');
        this.colorInput = document.getElementById('colorInput');
        this.colorPreview = document.getElementById('colorPreview');
        this.colorText = document.getElementById('colorText');
        this.timeSlotSelect = document.getElementById('timeSlotSelect');
        this.coursesContainer = document.getElementById('coursesContainer');
        this.emptyCourses = document.getElementById('emptyCourses');
        this.scheduleHeader = document.getElementById('scheduleHeader');
        this.scheduleBody = document.getElementById('scheduleBody');
        this.timeFormatSelect = document.getElementById('timeFormat');
        this.showWeekendsCheckbox = document.getElementById('showWeekends');
        this.showWednesdayCheckbox = document.getElementById('showWednesday');
        this.highlightIrregularCheckbox = document.getElementById('highlightIrregular');
        this.clearAllBtn = document.getElementById('clearAllBtn');
        this.exportBtn = document.getElementById('exportBtn');
        this.printBtn = document.getElementById('printBtn');
        this.scheduleTable = document.getElementById('scheduleTable');
        
        // Dialog elements
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

        // Add these to the initialize() method after other dialog elements:
        this.editCourseDialog = document.getElementById('editCourseDialog');
        this.editCourseForm = document.getElementById('editCourseForm');
        this.editCourseNameInput = document.getElementById('editCourseName');
        this.editStartTimeInput = document.getElementById('editStartTime');
        this.editEndTimeInput = document.getElementById('editEndTime');
        this.editColorInput = document.getElementById('editColorInput');
        this.editColorPreview = document.getElementById('editColorPreview');
        this.editColorText = document.getElementById('editColorText');
        this.editTimeSlotSelect = document.getElementById('editTimeSlotSelect');
        this.closeEditCourseDialog = document.getElementById('closeEditCourseDialog');
        this.saveEditedCourseBtn = document.getElementById('saveEditedCourse');
        this.deleteEditedCourseBtn = document.getElementById('deleteEditedCourse');
        this.cancelEditCourseBtn = document.getElementById('cancelEditCourse');

        // Store the currently edited course
        this.currentlyEditedCourse = null;
        
        // Initialize color preview
        this.colorPreview.style.backgroundColor = this.colorInput.value;
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Generate initial schedule
        this.generateSchedule();
    }
    
    setupEventListeners() {
        // Color input change
        this.colorInput.addEventListener('input', () => {
            this.colorPreview.style.backgroundColor = this.colorInput.value;
            this.colorText.textContent = this.colorInput.value;
        });
        
        // Time slot select change
        this.timeSlotSelect.addEventListener('change', (e) => {
            if (e.target.value) {
                const [start, end] = e.target.value.split('-');
                this.startTimeInput.value = start;
                this.endTimeInput.value = end;
            }
        });
        
        // Form submission
        this.courseForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addCourse();
            this.closeDialog(this.addCourseDialog);
        });
        
        // Clear all courses
        this.clearAllBtn.addEventListener('click', () => {
            if (this.courses.length > 0 && confirm('Are you sure you want to remove all courses?')) {
                this.courses = [];
                this.updateCoursesList();
                this.generateSchedule();
            }
        });
        
        // Dialog controls
        this.addCourseBtn.addEventListener('click', () => {
            this.openDialog(this.addCourseDialog);
        });
        
        this.settingsBtn.addEventListener('click', () => {
            this.openDialog(this.settingsDialog);
            // Load current settings into dialog
            this.timeFormatSelect.value = this.currentSettings.timeFormat;
            this.showWeekendsCheckbox.checked = this.currentSettings.showWeekends;
            this.showWednesdayCheckbox.checked = this.currentSettings.showWednesday;
            this.highlightIrregularCheckbox.checked = this.currentSettings.highlightIrregular;
        });
        
        this.viewCoursesBtn.addEventListener('click', () => {
            // Scroll to courses list
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
            
            this.generateSchedule();
            
            this.closeDialog(this.settingsDialog);
        });
        
        // Export and print
        this.exportBtn.addEventListener('click', () => {
            this.exportSchedule();
        });
        
        this.printBtn.addEventListener('click', () => {
            window.print();
        });
        
        // Time slot navigation
        document.querySelectorAll('.time-slot-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.time-slot-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.activeTimeFilter = e.target.dataset.slot;
                this.generateSchedule();
            });
        });
        
        // Close dialog when clicking outside
        [this.addCourseDialog, this.settingsDialog].forEach(dialog => {
            dialog.addEventListener('click', (e) => {
                if (e.target === dialog) {
                    this.closeDialog(dialog);
                }
            });
        });

        // Edit dialog color input
        this.editColorInput.addEventListener('input', () => {
            this.editColorPreview.style.backgroundColor = this.editColorInput.value;
            this.editColorText.textContent = this.editColorInput.value;
        });

        // Edit time slot select change
        this.editTimeSlotSelect.addEventListener('change', (e) => {
            if (e.target.value) {
                const [start, end] = e.target.value.split('-');
                this.editStartTimeInput.value = start;
                this.editEndTimeInput.value = end;
            }
        });

        // Edit dialog controls
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

        // Close edit dialog when clicking outside
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
        // Reset form if it's the add course dialog
        if (dialog === this.addCourseDialog) {
            this.courseForm.reset();
            this.colorInput.value = "#3498db";
            this.colorPreview.style.backgroundColor = "#3498db";
            this.colorText.textContent = "#3498db";
            this.startTimeInput.value = "07:30";
            this.endTimeInput.value = "09:00";
            this.timeSlotSelect.value = "";
        }
    }

    openEditDialog(course) {
        this.currentlyEditedCourse = course;
        
        // Fill the edit form with course data
        this.editCourseNameInput.value = course.name;
        this.editStartTimeInput.value = course.startTime;
        this.editEndTimeInput.value = course.endTime;
        this.editColorInput.value = course.color;
        this.editColorPreview.style.backgroundColor = course.color;
        this.editColorText.textContent = course.color;
        
        // Uncheck all days
        document.querySelectorAll('input[name="editDay"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Check the course days
        course.days.forEach(day => {
            const dayCheckbox = document.querySelector(`input[name="editDay"][value="${day}"]`);
            if (dayCheckbox) {
                dayCheckbox.checked = true;
            }
        });
        
        // Set time slot select
        const timeSlotValue = `${course.startTime}-${course.endTime}`;
        const timeSlotOption = Array.from(this.editTimeSlotSelect.options).find(option => 
            option.value === timeSlotValue
        );
        
        if (timeSlotOption) {
            this.editTimeSlotSelect.value = timeSlotValue;
        } else {
            this.editTimeSlotSelect.value = "";
        }
        
        // Open the dialog
        this.openDialog(this.editCourseDialog);
    }

    saveEditedCourse() {
        if (!this.currentlyEditedCourse) return;
        
        // Get selected days
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
        
        // Validate time
        if (this.editStartTimeInput.value >= this.editEndTimeInput.value) {
            alert('End time must be after start time');
            return;
        }
        
        // Check if time is within standard slots
        const matchedSlot = this.findClosestTimeSlot(this.editStartTimeInput.value, this.editEndTimeInput.value);
        const isStandard = matchedSlot && 
            this.editStartTimeInput.value === matchedSlot.start && 
            this.editEndTimeInput.value === matchedSlot.end;
        
        // Update the course
        this.currentlyEditedCourse.name = courseName;
        this.currentlyEditedCourse.startTime = this.editStartTimeInput.value;
        this.currentlyEditedCourse.endTime = this.editEndTimeInput.value;
        this.currentlyEditedCourse.days = selectedDays;
        this.currentlyEditedCourse.color = this.editColorInput.value;
        this.currentlyEditedCourse.isStandard = isStandard;
        this.currentlyEditedCourse.matchedSlot = matchedSlot ? matchedSlot.label : null;
        
        // Update UI
        this.updateCoursesList();
        this.generateSchedule();
        
        // Close dialog
        this.closeDialog(this.editCourseDialog);
        this.currentlyEditedCourse = null;
    }
    
    addCourse() {
        // Get selected days
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
        
        // Validate time
        if (this.startTimeInput.value >= this.endTimeInput.value) {
            alert('End time must be after start time');
            return;
        }

        const newCourseStart = this.timeToMinutes(this.startTimeInput.value);
        const newCourseEnd = this.timeToMinutes(this.endTimeInput.value);
        
        // Check if the new course overlaps with any existing course on the same days
        let hasOverlap = false;
        let overlappingCourse = null;
        
        for (const existingCourse of this.courses) {
            // Check if courses share any days
            const sharedDays = selectedDays.filter(day => existingCourse.days.includes(day));
            if (sharedDays.length === 0) continue;
            
            // Check if courses overlap in time
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
        
        // Check if time is within standard slots
        const matchedSlot = this.findClosestTimeSlot(this.startTimeInput.value, this.endTimeInput.value);
        const isStandard = matchedSlot && 
            this.startTimeInput.value === matchedSlot.start && 
            this.endTimeInput.value === matchedSlot.end;
        
        // Create course object
        const course = {
            id: Date.now(),
            name: this.courseNameInput.value,
            startTime: this.startTimeInput.value,
            endTime: this.endTimeInput.value,
            days: selectedDays,
            color: this.colorInput.value,
            isStandard: isStandard,
            matchedSlot: matchedSlot ? matchedSlot.label : null
        };
        
        // Add to courses array
        this.courses.push(course);
        
        // Update UI
        this.updateCoursesList();
        this.generateSchedule();
        
        // Reset form
        this.courseForm.reset();
        this.colorInput.value = "#3498db";
        this.colorPreview.style.backgroundColor = "#3498db";
        this.colorText.textContent = "#3498db";
        this.startTimeInput.value = "07:30";
        this.endTimeInput.value = "09:00";
        this.timeSlotSelect.value = "";
    }
    
    findClosestTimeSlot(startTime, endTime) {
        let closestSlot = null;
        let minDiff = Infinity;
        
        // Convert time to minutes for comparison
        const startMinutes = this.timeToMinutes(startTime);
        const endMinutes = this.timeToMinutes(endTime);
        const duration = endMinutes - startMinutes;
        
        this.standardSlots.forEach(slot => {
            const slotStart = this.timeToMinutes(slot.start);
            const slotEnd = this.timeToMinutes(slot.end);
            const slotDuration = slotEnd - slotStart;
            
            // Check if times are close (within 15 minutes)
            const startDiff = Math.abs(startMinutes - slotStart);
            const endDiff = Math.abs(endMinutes - slotEnd);
            const totalDiff = startDiff + endDiff;
            
            // If duration is similar and times are close
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
        
        // If we're deleting the currently edited course, clear it
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
        // Clear schedule
        this.scheduleHeader.innerHTML = '';
        this.scheduleBody.innerHTML = '';
        
        // Remove any existing event elements
        document.querySelectorAll('.schedule-event').forEach(event => event.remove());
        
        // Determine which days to show
        let daysToShow = [];
        let daysShortToShow = [];

        if (!this.currentSettings.showWednesday) {
            // If Wednesday is hidden, show all days except Wednesday
            daysToShow = this.days.filter(day => day !== 'Wednesday');
            daysShortToShow = this.daysShort.filter(day => day !== 'Wed');
            
            // If showWeekends is false, also remove weekends
            if (!this.currentSettings.showWeekends) {
                daysToShow = daysToShow.filter(day => day !== 'Saturday');
                daysShortToShow = daysShortToShow.filter(day => day !== 'Sat');
            }
        } else {
            // Wednesday is shown
            daysToShow = this.currentSettings.showWeekends 
                ? this.days 
                : this.days.slice(0, 5);
            
            daysShortToShow = this.currentSettings.showWeekends
                ? this.daysShort
                : this.daysShort.slice(0, 5);
        }

        // Create header row
        const headerRow = document.createElement('tr');
        
        // Time column header
        const timeHeader = document.createElement('th');
        timeHeader.className = 'time-slot-header';
        timeHeader.textContent = 'Time Slot';
        headerRow.appendChild(timeHeader);
        
        // Day headers
        daysToShow.forEach((day, index) => {
            const dayHeader = document.createElement('th');
            dayHeader.className = 'day-header';
            dayHeader.innerHTML = `
                <div>${daysShortToShow[index]}</div>
            `;
            headerRow.appendChild(dayHeader);
        });
        
        this.scheduleHeader.appendChild(headerRow);
        
        // Filter time slots based on active filter
        let slotsToShow = this.standardSlots;
        if (this.activeTimeFilter !== 'all') {
            slotsToShow = this.standardSlots.filter(slot => slot.period === this.activeTimeFilter);
        }
        
        // Create time slot rows
        slotsToShow.forEach((slot, slotIndex) => {
            const row = document.createElement('tr');
            row.dataset.slot = slot.label;
            row.dataset.period = slot.period;
            
            // Time slot cell
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
            
            // Day cells for this time slot
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
        
        // Add courses to schedule
        this.renderCoursesOnSchedule();
    }
    
    renderCoursesOnSchedule() {
        this.courses.forEach(course => {
            const start = this.parseTime(course.startTime);
            const end = this.parseTime(course.endTime);
            
            // Find which standard slot this course belongs to
            const slotIndex = this.standardSlots.findIndex(slot => 
                slot.start === course.matchedSlot?.replace('Slot ', '') || 
                (this.timeToMinutes(course.startTime) >= this.timeToMinutes(slot.start) - 15 &&
                this.timeToMinutes(course.endTime) <= this.timeToMinutes(slot.end) + 15)
            );
            
            if (slotIndex === -1) {
                // If no matching slot found, find the nearest slot
                const courseStartMinutes = this.timeToMinutes(course.startTime);
                let nearestSlotIndex = 0;
                let minDiff = Infinity;
                
                // Find the slot with the closest start time
                this.standardSlots.forEach((slot, index) => {
                    const slotStartMinutes = this.timeToMinutes(slot.start);
                    const diff = Math.abs(courseStartMinutes - slotStartMinutes);
                    if (diff < minDiff) {
                        minDiff = diff;
                        nearestSlotIndex = index;
                    }
                });
                
                // Use the nearest slot
                const slot = this.standardSlots[nearestSlotIndex];
                
                // Check if this slot should be shown based on filter
                if (this.activeTimeFilter !== 'all' && slot.period !== this.activeTimeFilter) {
                    return;
                }
                
                course.days.forEach(dayName => {
                    // Check if this day should be shown
                    const daysToShow = this.getDaysToShow();
                    
                    if (!daysToShow.includes(dayName)) return;
                    
                    // Find the column for this day
                    const dayIndex = daysToShow.indexOf(dayName);
                    
                    // Find the table row for this time slot
                    const slotRow = this.scheduleBody.querySelector(`tr[data-slot="${slot.label}"]`);
                    if (!slotRow) return;
                    
                    const targetCell = slotRow.children[dayIndex + 1]; // +1 for time column
                    if (!targetCell) return;
                    
                    // Create event element
                    const eventElement = this.createScheduleEventElement(course, slot);
                    
                    // Append to the cell's dropzone
                    const dropzone = targetCell.querySelector('.cell-dropzone');
                    if (dropzone) {
                        dropzone.style.position = 'relative';
                        dropzone.appendChild(eventElement);
                    }
                });
                
                return; // Skip the regular processing for this course
            }
            
            const slot = this.standardSlots[slotIndex];
            
            // Check if this slot should be shown based on filter
            if (this.activeTimeFilter !== 'all' && slot.period !== this.activeTimeFilter) {
                return;
            }
            
            course.days.forEach(dayName => {
                // Check if this day should be shown
                const daysToShow = this.getDaysToShow();
                
                if (!daysToShow.includes(dayName)) return;
                
                // Find the column for this day
                const dayIndex = daysToShow.indexOf(dayName);
                
                // Find the table row for this time slot
                const slotRow = this.scheduleBody.querySelector(`tr[data-slot="${slot.label}"]`);
                if (!slotRow) return;
                
                const targetCell = slotRow.children[dayIndex + 1]; // +1 for time column
                if (!targetCell) return;
                
                // Create event element
                const eventElement = this.createScheduleEventElement(course, slot);
                
                // Append to the cell's dropzone
                const dropzone = targetCell.querySelector('.cell-dropzone');
                if (dropzone) {
                    dropzone.style.position = 'relative';
                    dropzone.appendChild(eventElement);
                }
            });
        });
    }

    // Helper method to get which days to show
    getDaysToShow() {
        let daysToShow = [...this.days];
        
        // Remove Wednesday if not shown
        if (!this.currentSettings.showWednesday) {
            const wedIndex = daysToShow.indexOf('Wednesday');
            if (wedIndex !== -1) {
                daysToShow.splice(wedIndex, 1);
            }
        }
        
        // Remove Saturday if weekends not shown
        if (!this.currentSettings.showWeekends) {
            const satIndex = daysToShow.indexOf('Saturday');
            if (satIndex !== -1) {
                daysToShow.splice(satIndex, 1);
            }
        }
        
        return daysToShow;
    }

    // Helper method to get short day names
    getDaysShortToShow() {
        let daysShortToShow = [...this.daysShort];
        
        // Remove Wed if Wednesday not shown
        if (!this.currentSettings.showWednesday) {
            const wedIndex = daysShortToShow.indexOf('Wed');
            if (wedIndex !== -1) {
                daysShortToShow.splice(wedIndex, 1);
            }
        }
        
        // Remove Sat if weekends not shown
        if (!this.currentSettings.showWeekends) {
            const satIndex = daysShortToShow.indexOf('Sat');
            if (satIndex !== -1) {
                daysShortToShow.splice(satIndex, 1);
            }
        }
        
        return daysShortToShow;
    }

    // Add this helper method to create schedule event elements
    createScheduleEventElement(course, slot) {
        const eventElement = document.createElement('div');
        eventElement.className = 'schedule-event';
        eventElement.style.backgroundColor = course.color;
        eventElement.dataset.courseId = course.id;
        
        // Add irregular time class if needed
        if (!course.isStandard && this.currentSettings.highlightIrregular) {
            eventElement.classList.add('irregular-time');
            // Add a border to highlight irregular courses
            eventElement.style.border = '2px dashed rgba(255, 255, 255, 0.5)';
        }
        
        // For standard slots: fill the entire cell
        if (course.isStandard) {
            // Standard course - fill entire cell
            eventElement.style.top = '0';
            eventElement.style.height = '100%';
        } else {
            // Irregular course - calculate position within cell
            const slotStartMinutes = this.timeToMinutes(slot.start);
            const courseStartMinutes = this.timeToMinutes(course.startTime);
            const slotEndMinutes = this.timeToMinutes(slot.end);
            const courseEndMinutes = this.timeToMinutes(course.endTime);
            const slotDuration = slotEndMinutes - slotStartMinutes;
            
            // Calculate position within the slot
            const startOffset = Math.max(0, courseStartMinutes - slotStartMinutes);
            const endOffset = Math.max(0, slotEndMinutes - courseEndMinutes);
            
            // Calculate percentages
            const startPercent = (startOffset / slotDuration) * 100;
            const endPercent = (endOffset / slotDuration) * 100;
            const heightPercent = 100 - startPercent - endPercent;
            
            // Set position and size
            eventElement.style.top = `${startPercent}%`;
            eventElement.style.height = `${heightPercent}%`;
            
            // If the course doesn't fit well in this slot, make it more visible
            if (heightPercent < 30) {
                eventElement.style.zIndex = '10';
                eventElement.style.boxShadow = '0 0 0 2px rgba(231, 76, 60, 0.3)';
            }
        }
        
        // Add event content
        const displayStart = this.formatTimeForDisplay(course.startTime);
        const displayEnd = this.formatTimeForDisplay(course.endTime);
        eventElement.innerHTML = `
            <div class="event-title">${course.name}</div>
            <div class="event-time">${displayStart} - ${displayEnd}</div>
        `;
        
        // Add click event to edit/delete
        eventElement.addEventListener('click', (e) => {
            e.stopPropagation();
            this.openEditDialog(course);
        });
        
        return eventElement;
    }
    
    handleCellClick(day, slot) {
        // Open the add course dialog
        this.openDialog(this.addCourseDialog);
        
        // Pre-fill the form with the selected day and time slot
        // Uncheck all days first
        document.querySelectorAll('input[name="day"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Check the selected day
        const dayCheckbox = document.querySelector(`input[name="day"][value="${day}"]`);
        if (dayCheckbox) {
            dayCheckbox.checked = true;
        }
        
        // Set the time slot
        this.startTimeInput.value = slot.start;
        this.endTimeInput.value = slot.end;
        
        // Select the matching time slot in the dropdown if available
        const timeSlotValue = `${slot.start}-${slot.end}`;
        const timeSlotOption = Array.from(this.timeSlotSelect.options).find(option => 
            option.value === timeSlotValue
        );
        
        if (timeSlotOption) {
            this.timeSlotSelect.value = timeSlotValue;
        } else {
            this.timeSlotSelect.value = "";
        }
        
        // Set a default course name based on the day and slot
        this.courseNameInput.value = `${day.substring(0, 3)} ${slot.label}`;
        
        // Focus on the course name input
        setTimeout(() => {
            this.courseNameInput.focus();
            this.courseNameInput.select();
        }, 100);
    }
    
    exportSchedule() {
        // Show loading state
        const originalText = this.exportBtn.innerHTML;
        this.exportBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Exporting...';
        this.exportBtn.disabled = true;
        
        // Get the schedule table container element
        const scheduleContainer = document.querySelector('.schedule-table-container');
        
        // Give a small delay to ensure DOM is ready
        setTimeout(() => {
            // Use html2canvas to capture the schedule container directly
            html2canvas(scheduleContainer, {
                scale: 2,
                backgroundColor: '#ffffff',
                useCORS: true,
                logging: false,
                allowTaint: true,
                scrollX: 0,
                scrollY: -window.scrollY
            }).then(canvas => {
                // Convert canvas to image
                const image = canvas.toDataURL('image/png', 1.0);
                
                // Create download link
                const link = document.createElement('a');
                const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
                link.download = `my-schedule.png`;
                link.href = image;
                
                // Trigger download
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                // Restore button state
                this.exportBtn.innerHTML = originalText;
                this.exportBtn.disabled = false;
                
            }).catch(error => {
                console.error('Error exporting schedule:', error);
                
                // Restore button state
                this.exportBtn.innerHTML = originalText;
                this.exportBtn.disabled = false;
                
                // Show error message
                alert('Error exporting schedule. Please make sure the schedule is fully loaded and try again.');
            });
        }, 100);
    }
    
    // Helper methods
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
    
    getRandomColor() {
        const colors = [
            '#3498db', '#2ecc71', '#9b59b6', '#e74c3c', '#f39c12',
            '#1abc9c', '#d35400', '#c0392b', '#16a085', '#8e44ad'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
}

// Initialize the schedule maker when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.scheduleMaker = new ScheduleMaker();
});