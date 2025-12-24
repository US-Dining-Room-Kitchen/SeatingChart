# Creating SeatingPlanner.tsx

This component is approximately 850 lines and includes:

## State Management
- tables, guests, assignments
- notification, selectedGuestId, modalData
- isAddPartyModalOpen, activeView, mergeSelection
- isMergeMode, scale, isPinching
- confirmModalState, unmergeModalState, showSplash
- layoutOptions, selectedLayoutFile

## Handlers  
- handleGuestFileChange, handleLayoutFileChange
- handleGuestSizeChange, handleAssignedSeatsChange
- handleConfirmDelete, handleGuestNotesChange
- handleAddParty, handleMergeSelect
- beginMergeMode, cancelMergeMode, handleMergeGuests
- performUnmerge, handleGuestUnmerge
- assignGuestToTable, unassignGuest
- handleGuestCardClick, handleTableClick
- handleUnassignInModal, handleReassignInModal
- startApp, calculateScale

## UI Sections
- Notification banner
- Splash screen for layout selection
- Modals (confirmation, reservation details, add party, unmerge)
- Header with title and menu
- Mobile view switcher
- Guest list panel with merge controls
- Map panel with tables and zoom controls

Creating now...
