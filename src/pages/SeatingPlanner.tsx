import { useNavigate } from 'react-router-dom';
import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { Guest, Table, Assignments, LayoutOption, GuestWithAssignment } from '../types';
import { parseGuestFile } from '../utils/fileParser';
import { loadLayoutOptions, loadLayoutFromUrl as utilLoadLayout, parseLayoutFile } from '../utils/layoutParser';
import { usePinchZoom } from '../hooks/usePinchZoom';
import { useSwipeNavigation } from '../hooks/useSwipeNavigation';
import { Notification } from '../components/ui/Notification';
import { ConfirmationModal } from '../components/ui/ConfirmationModal';
import { GuestCard } from '../components/seating/GuestCard';
import { TableVisual } from '../components/seating/TableVisual';
import { ReservationDetailsModal } from '../components/seating/ReservationDetailsModal';
import { AddPartyModal } from '../components/seating/AddPartyModal';
import { SplashScreen } from '../components/seating/SplashScreen';
import { SettingsMenu } from '../components/seating/SettingsMenu';
import { ZoomControls } from '../components/seating/ZoomControls';
import { MobileQuickAssignPanel } from '../components/seating/MobileQuickAssignPanel';
import { SelectedGuestBanner } from '../components/seating/SelectedGuestBanner';

const DEFAULT_TABLE_CAPACITY = 10;

interface NotificationState {
  msg: string;
  type: 'info' | 'error';
}

interface ConfirmModalState {
  isOpen: boolean;
  guestId: string | null;
}

interface UnmergeModalState {
  isOpen: boolean;
  guestId: string | null;
}

interface ModalData {
  tableId: string | number;
}

interface TableAssignmentData {
  guests: GuestWithAssignment[];
  remainingSeats: number;
}

export const SeatingPlanner: React.FC = () => {
  const navigate = useNavigate();
  
  // State management
  const [tables, setTables] = useState<Table[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [assignments, setAssignments] = useState<Assignments>({});
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const [selectedGuestId, setSelectedGuestId] = useState<string | null>(null);
  const [modalData, setModalData] = useState<ModalData | null>(null);
  const [isAddPartyModalOpen, setIsAddPartyModalOpen] = useState(false);
  const [activeView, setActiveView] = useState<'list' | 'map'>('list');
  const [mergeSelection, setMergeSelection] = useState<string[]>([]);
  const [isMergeMode, setIsMergeMode] = useState(false);
  const [unmergeModalState, setUnmergeModalState] = useState<UnmergeModalState>({
    isOpen: false,
    guestId: null,
  });
  const [scale, setScale] = useState(1);
  const scaleRef = useRef(scale);
  const [isPinching, setIsPinching] = useState(false);
  const [confirmModalState, setConfirmModalState] = useState<ConfirmModalState>({
    isOpen: false,
    guestId: null,
  });
  const [showSplash, setShowSplash] = useState(true);
  const [layoutOptions, setLayoutOptions] = useState<LayoutOption[]>([]);
  const [selectedLayoutFile, setSelectedLayoutFile] = useState('');
  const [showMobileQuickAssign, setShowMobileQuickAssign] = useState(false);

  // Refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapContentRef = useRef<HTMLDivElement>(null);
  const guestFileInputRef = useRef<HTMLInputElement>(null);
  const layoutFileInputRef = useRef<HTMLInputElement>(null);

  // Keep scaleRef in sync with scale
  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);

  // Load layout options on mount
  useEffect(() => {
    loadLayoutOptions()
      .then(data => setLayoutOptions(data))
      .catch(err => console.warn('Failed to load layouts list', err));
  }, []);
  // Calculate derived state
  const { unassignedGuests, tableAssignments, estimatedTables } = useMemo(() => {
    const unassigned: { guest: Guest; remaining: number }[] = [];
    const tableAssignmentsMap: Record<string | number, TableAssignmentData> = tables.reduce(
      (acc, table) => {
        acc[table.internalId] = { guests: [], remainingSeats: table.capacity };
        return acc;
      },
      {} as Record<string | number, TableAssignmentData>
    );

    guests.forEach(guest => {
      const parts = assignments[guest.id] || [];
      let assignedTotal = 0;
      parts.forEach(p => {
        assignedTotal += p.seats;
        if (tableAssignmentsMap[p.tableId]) {
          tableAssignmentsMap[p.tableId].guests.push({
            guest,
            assignedSeats: p.seats,
          });
          tableAssignmentsMap[p.tableId].remainingSeats -= p.seats;
        }
      });
      if (assignedTotal < guest.size) {
        unassigned.push({ guest, remaining: guest.size - assignedTotal });
      }
    });

    // Estimate tables needed using bin packing
    const capacities: number[] = [];
    const sorted = unassigned.slice().sort((a, b) => b.remaining - a.remaining);
    sorted.forEach(({ remaining }) => {
      let placed = false;
      for (let i = 0; i < capacities.length; i++) {
        if (capacities[i] >= remaining) {
          capacities[i] -= remaining;
          placed = true;
          break;
        }
      }
      if (!placed) {
        capacities.push(DEFAULT_TABLE_CAPACITY - remaining);
      }
    });

    // Sort guests at each table by name
    Object.values(tableAssignmentsMap).forEach(t => {
      t.guests.sort((a, b) =>
        a.guest.name.localeCompare(b.guest.name, undefined, { sensitivity: 'base' })
      );
    });

    return {
      unassignedGuests: unassigned.sort((a, b) =>
        a.guest.name.localeCompare(b.guest.name, undefined, { sensitivity: 'base' })
      ),
      tableAssignments: tableAssignmentsMap,
      estimatedTables: capacities.length,
    };
  }, [assignments, guests, tables]);

  // Auto-scale calculation
  const calculateScale = () => {
    if (mapContainerRef.current && mapContentRef.current) {
      const containerWidth = mapContainerRef.current.offsetWidth;
      const scrollWidth = mapContentRef.current.scrollWidth;
      const scale = scrollWidth > 0 ? containerWidth / scrollWidth : 1;
      setScale(Math.min(scale, 1));
    }
  };

  // Set up pinch zoom for different containers
  usePinchZoom(mapContainerRef, scaleRef, setScale, setIsPinching);

  // Guest navigation handlers for mobile
  const navigateToNextGuest = () => {
    if (unassignedGuests.length === 0) return;
    
    const currentIndex = unassignedGuests.findIndex(
      item => item.guest.id === selectedGuestId
    );
    
    if (currentIndex === -1) {
      // No guest selected, select first
      setSelectedGuestId(unassignedGuests[0].guest.id);
    } else if (currentIndex < unassignedGuests.length - 1) {
      // Select next guest
      setSelectedGuestId(unassignedGuests[currentIndex + 1].guest.id);
    }
  };

  const navigateToPreviousGuest = () => {
    if (unassignedGuests.length === 0) return;
    
    const currentIndex = unassignedGuests.findIndex(
      item => item.guest.id === selectedGuestId
    );
    
    if (currentIndex === -1) {
      // No guest selected, select last
      setSelectedGuestId(unassignedGuests[unassignedGuests.length - 1].guest.id);
    } else if (currentIndex > 0) {
      // Select previous guest
      setSelectedGuestId(unassignedGuests[currentIndex - 1].guest.id);
    }
  };

  // Set up swipe navigation for mobile
  useSwipeNavigation(mapContainerRef, {
    onSwipeLeft: navigateToNextGuest,
    onSwipeRight: navigateToPreviousGuest,
    enabled: activeView === 'map' && window.innerWidth < 1024,
  });

  // Notification helper
  const displayNotification = (msg: string, type: 'info' | 'error') => {
    setNotification({ msg, type });
  };

  // Reset helper
  const handleReset = () => {
    setAssignments({});
    setNotification(null);
    setSelectedGuestId(null);
  };
  // File handlers
  const handleGuestFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const newGuests = await parseGuestFile(file);
      setGuests(newGuests);
      handleReset();
    } catch (err) {
      displayNotification((err as Error).message, 'error');
    }

    e.target.value = '';
  };

  const handleLayoutFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const newTables = await parseLayoutFile(file);
      setTables(newTables);
      handleReset();
    } catch (err) {
      displayNotification(`Failed to parse layout file: ${(err as Error).message}`, 'error');
    }

    e.target.value = '';
  };

  const loadLayoutFromUrl = async (url: string) => {
    try {
      const newTables = await utilLoadLayout(url);
      setTables(newTables);
      handleReset();
    } catch (err) {
      displayNotification(`Failed to load layout: ${(err as Error).message}`, 'error');
    }
  };

  // Guest management handlers
  const handleGuestSizeChange = (guestId: string, newSize: number) => {
    if (newSize === 0) {
      setConfirmModalState({ isOpen: true, guestId });
    } else {
      setGuests(currentGuests =>
        currentGuests.map(g => (g.id === guestId ? { ...g, size: newSize } : g))
      );
      const parts = assignments[guestId] || [];
      const totalAssigned = parts.reduce((sum, p) => sum + p.seats, 0);
      if (totalAssigned > newSize) {
        unassignGuest(guestId);
        const guestToUpdate = guests.find(g => g.id === guestId);
        displayNotification(
          `"${guestToUpdate?.name}" unassigned: new size (${newSize}) is less than currently assigned seats.`,
          'info'
        );
      }
    }
  };

  const handleAssignedSeatsChange = (
    guestId: string,
    tableId: string | number,
    newSeats: number
  ) => {
    let seats = parseInt(String(newSeats), 10);
    if (isNaN(seats) || seats < 0) seats = 0;

    const guest = guests.find(g => g.id === guestId);
    const table = tables.find(t => t.internalId === tableId);
    if (!guest || !table) return;

    const parts = assignments[guestId] || [];
    const otherParts = parts.filter(p => p.tableId !== tableId);
    const otherAssigned = otherParts.reduce((sum, p) => sum + p.seats, 0);
    const tableData = tableAssignments[tableId];
    const currentAtTable = parts.find(p => p.tableId === tableId)?.seats || 0;
    const maxByTable = tableData ? tableData.remainingSeats + currentAtTable : table.capacity;
    const maxByGuest = guest.size - otherAssigned;

    seats = Math.min(seats, maxByTable);

    if (seats > maxByGuest) {
      const needed = seats - maxByGuest;
      if (otherParts.length === 0) {
        window.alert('No other tables to move guests from.');
        seats = maxByGuest;
      } else {
        let source;
        if (otherParts.length === 1) {
          const t = tables.find(t => t.internalId === otherParts[0].tableId);
          if (
            !window.confirm(
              `To seat ${seats} here, move ${needed} from table ${
                t ? t.displayId : otherParts[0].tableId
              }. Continue?`
            )
          )
            return;
          source = otherParts[0];
        } else {
          if (!window.confirm(`To seat ${seats} here, move ${needed} from another table. Continue?`))
            return;
          const options = otherParts
            .map((p, i) => {
              const t = tables.find(t => t.internalId === p.tableId);
              return `${i + 1}: ${t ? t.displayId : p.tableId} (${p.seats})`;
            })
            .join('\n');
          const choice = parseInt(window.prompt(`Move from which table?\n${options}`) || '', 10) - 1;
          if (isNaN(choice) || choice < 0 || choice >= otherParts.length) return;
          source = otherParts[choice];
        }

        const move = Math.min(source.seats, needed);
        seats = Math.min(seats, maxByGuest + move);
        const finalMove = seats - maxByGuest;
        const updatedParts = [
          ...otherParts
            .map(p =>
              p.tableId === source.tableId ? { tableId: p.tableId, seats: p.seats - finalMove } : p
            )
            .filter(p => p.seats > 0),
          ...(seats > 0 ? [{ tableId, seats }] : []),
        ];

        setAssignments(prev => {
          const updated = { ...prev, [guestId]: updatedParts };
          if (updatedParts.length === 0) delete updated[guestId];
          return updated;
        });
        return;
      }
    }

    const newParts = seats > 0 ? [...otherParts, { tableId, seats }] : otherParts;
    setAssignments(prev => {
      const updated = { ...prev, [guestId]: newParts };
      if (newParts.length === 0) delete updated[guestId];
      return updated;
    });
  };

  const handleConfirmDelete = () => {
    const { guestId } = confirmModalState;
    if (!guestId) return;

    const guestToUpdate = guests.find(g => g.id === guestId);
    setGuests(currentGuests => currentGuests.filter(g => g.id !== guestId));
    unassignGuest(guestId);
    displayNotification(`Removed "${guestToUpdate?.name}" from the guest list.`, 'info');
    setConfirmModalState({ isOpen: false, guestId: null });
  };

  const handleGuestNotesChange = (guestId: string, newNotes: string) => {
    setGuests(currentGuests =>
      currentGuests.map(g => (g.id === guestId ? { ...g, notes: newNotes } : g))
    );
  };

  const handleAddParty = (name: string, size: number) => {
    const newParty: Guest = {
      id: `new-g-${Date.now()}`,
      name,
      size,
      notes: '',
    };
    setGuests(prevGuests => [newParty, ...prevGuests]);
  };
  // Merge/Unmerge handlers
  const handleMergeSelect = (guestId: string, checked: boolean) => {
    setMergeSelection(prev =>
      checked ? [...prev, guestId] : prev.filter(id => id !== guestId)
    );
  };

  const beginMergeMode = () => {
    setIsMergeMode(true);
    setMergeSelection([]);
    setSelectedGuestId(null);
  };

  const cancelMergeMode = () => {
    setIsMergeMode(false);
    setMergeSelection([]);
  };

  const handleMergeGuests = () => {
    if (mergeSelection.length < 2) return;

    const guestsToMerge = guests.filter(g => mergeSelection.includes(g.id));
    const newId = `merged-${Date.now()}`;
    const newName = guestsToMerge.map(g => g.name).join(' + ');
    const newSize = guestsToMerge.reduce((sum, g) => sum + g.size, 0);
    const newNotes = guestsToMerge
      .map(g => g.notes)
      .filter(Boolean)
      .join(' | ');

    const mergedFrom = guestsToMerge.map(g => ({
      guest: { ...g },
      assignments: (assignments[g.id] || []).map(p => ({ ...p })),
    }));

    const assignmentMap: Record<string | number, number> = {};
    mergedFrom.forEach(({ assignments: parts }) => {
      parts.forEach(p => {
        assignmentMap[p.tableId] = (assignmentMap[p.tableId] || 0) + p.seats;
      });
    });

    const mergedAssignments = Object.entries(assignmentMap).map(([tableId, seats]) => ({
      tableId,
      seats,
    }));

    setGuests(current => {
      const remaining = current.filter(g => !mergeSelection.includes(g.id));
      return [
        ...remaining,
        {
          id: newId,
          name: newName,
          size: newSize,
          notes: newNotes,
          mergedFrom,
        },
      ];
    });

    setAssignments(prev => {
      const newAssignments = { ...prev };
      guestsToMerge.forEach(g => delete newAssignments[g.id]);
      if (mergedAssignments.length > 0) {
        newAssignments[newId] = mergedAssignments;
      }
      return newAssignments;
    });

    setMergeSelection([]);
    setIsMergeMode(false);
    if (selectedGuestId && mergeSelection.includes(selectedGuestId)) {
      setSelectedGuestId(null);
    }
  };

  const performUnmerge = (mergedGuestId: string) => {
    const mergedGuest = guests.find(g => g.id === mergedGuestId);
    if (!mergedGuest || !mergedGuest.mergedFrom) return;

    const originals = mergedGuest.mergedFrom;
    setGuests(curr => {
      const withoutMerged = curr.filter(g => g.id !== mergedGuestId);
      const restored = originals.map((o: { guest: Guest }) => ({ ...o.guest }));
      return [...withoutMerged, ...restored];
    });

    setAssignments(prev => {
      const newAssignments = { ...prev };
      delete newAssignments[mergedGuestId];
      return newAssignments;
    });

    if (selectedGuestId === mergedGuestId) setSelectedGuestId(null);
  };

  const handleGuestUnmerge = (guestId: string) => {
    performUnmerge(guestId);
  };

  const openUnmergeModal = (guestId: string) =>
    setUnmergeModalState({ isOpen: true, guestId });

  const closeUnmergeModal = () => setUnmergeModalState({ isOpen: false, guestId: null });

  const handleUnmergeConfirm = () => {
    if (unmergeModalState.guestId) {
      performUnmerge(unmergeModalState.guestId);
    }
    closeUnmergeModal();
  };

  // Assignment handlers
  const assignGuestToTable = (guestId: string, tableId: string | number) => {
    const guest = guests.find(g => g.id === guestId);
    const tableData = tableAssignments[tableId];
    if (!guest || !tableData) return;

    const parts = assignments[guestId] || [];
    const assigned = parts.reduce((sum, p) => sum + p.seats, 0);
    const remainingGuest = guest.size - assigned;
    if (remainingGuest <= 0) return;

    const seatsToAssign = Math.min(remainingGuest, tableData.remainingSeats);
    if (seatsToAssign <= 0) {
      displayNotification('Not enough seats available at this table.', 'error');
      return;
    }

    const newParts = [...parts, { tableId, seats: seatsToAssign }];
    setAssignments(prev => ({ ...prev, [guestId]: newParts }));

    if (seatsToAssign === remainingGuest) {
      setSelectedGuestId(null);
      // Auto-return to list view on mobile after full assignment
      // BUT only if not using the quick assign panel (to allow rapid assignments)
      if (window.innerWidth < 1024 && !showMobileQuickAssign) {
        setActiveView('list');
      }
    }
  };

  const unassignGuest = (guestId: string) => {
    if (assignments[guestId]) {
      setAssignments(prev => {
        const newAssignments = { ...prev };
        delete newAssignments[guestId];
        return newAssignments;
      });
    }
  };

  // UI interaction handlers
  const handleGuestCardClick = (guestId: string) => {
    if (selectedGuestId === guestId) {
      setSelectedGuestId(null);
    } else {
      setSelectedGuestId(guestId);
      if (window.innerWidth < 1024) {
        setActiveView('map');
      }
    }
  };

  const handleMobileQuickAssignSelect = (guestId: string) => {
    if (selectedGuestId === guestId) {
      setSelectedGuestId(null);
    } else {
      setSelectedGuestId(guestId);
    }
  };

  const handleTableClick = (table: Table) => {
    if (selectedGuestId) {
      assignGuestToTable(selectedGuestId, table.internalId);
    } else {
      setModalData({ tableId: table.internalId });
    }
  };

  const handleUnassignInModal = (guestId: string) => {
    unassignGuest(guestId);
  };

  const handleReassignInModal = (guestId: string) => {
    unassignGuest(guestId);
    setSelectedGuestId(guestId);
    setModalData(null);
    const guest = guests.find(g => g.id === guestId);
    if (window.innerWidth < 1024) {
      setActiveView('map');
    }
    if (guest) {
      displayNotification(`Select a new table for "${guest.name}".`, 'info');
    }
  };

  const startApp = () => {
    if (!selectedLayoutFile) return;
    loadLayoutFromUrl(`./layouts/${selectedLayoutFile}`);
    setShowSplash(false);
  };

  // Table rendering helper
  const renderTable = (table: Table) => {
    if (!table) return null;
    return (
      <TableVisual
        key={table.internalId}
        table={table}
        assignedGuests={tableAssignments[table.internalId]?.guests || []}
        isSelectedGuest={!!selectedGuestId}
        onClick={() => handleTableClick(table)}
        orientation={table.orientation}
      />
    );
  };

  // Derived values for modals
  const guestToConfirm = guests.find(g => g.id === confirmModalState.guestId);
  const modalTable = modalData ? (tables.find(t => t.internalId === modalData.tableId) || null) : null;
  const modalGuests = modalData ? tableAssignments[modalData.tableId]?.guests || [] : [];
  const unmergeGuest = guests.find(g => g.id === unmergeModalState.guestId);
  
  // Helper to render selected guest banner
  const renderSelectedGuestBanner = () => {
    if (!selectedGuestId || activeView !== 'map') return null;
    
    const selectedGuestData = unassignedGuests.find(
      item => item.guest.id === selectedGuestId
    );
    if (!selectedGuestData) return null;

    const currentIndex = unassignedGuests.findIndex(
      item => item.guest.id === selectedGuestId
    );

    return (
      <SelectedGuestBanner
        guest={selectedGuestData.guest}
        remainingSeats={selectedGuestData.remaining}
        onPrevious={navigateToPreviousGuest}
        onNext={navigateToNextGuest}
        onClose={() => setSelectedGuestId(null)}
        hasPrevious={currentIndex > 0}
        hasNext={currentIndex < unassignedGuests.length - 1}
      />
    );
  };
  
  // Render
  return (
    <div className="bg-gray-100 h-full font-sans flex flex-col">
      <Notification
        message={notification?.msg || ''}
        type={notification?.type}
        onDismiss={() => setNotification(null)}
      />

      {showSplash && (
        <SplashScreen
          layoutOptions={layoutOptions}
          selectedLayout={selectedLayoutFile}
          onSelectLayout={setSelectedLayoutFile}
          onImportGuests={() => guestFileInputRef.current?.click()}
          onStart={startApp}
        />
      )}

      <ConfirmationModal
        isOpen={confirmModalState.isOpen}
        onClose={() => setConfirmModalState({ isOpen: false, guestId: null })}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
      >
        Are you sure you want to remove the party "<strong>{guestToConfirm?.name}</strong>"? This
        action cannot be undone.
      </ConfirmationModal>

      <ReservationDetailsModal
        table={modalTable}
        guests={modalGuests}
        assignments={assignments}
        tables={tables}
        onClose={() => setModalData(null)}
        onUnassign={handleUnassignInModal}
        onReassign={handleReassignInModal}
        onSizeChange={handleGuestSizeChange}
        onSeatsChange={handleAssignedSeatsChange}
        onUnmerge={openUnmergeModal}
      />

      {unmergeModalState.isOpen && unmergeGuest && (
        <ConfirmationModal
          isOpen={true}
          onClose={closeUnmergeModal}
          onConfirm={handleUnmergeConfirm}
          title={`Unmerge "${unmergeGuest.name}"?`}
          confirmText="Yes"
        >
          Unmerging these parties will unassign their seats and return them to the guest list. Would
          you like to proceed?
        </ConfirmationModal>
      )}

      <AddPartyModal
        isOpen={isAddPartyModalOpen}
        onClose={() => setIsAddPartyModalOpen(false)}
        onAddParty={handleAddParty}
      />

      <header className="landscape-header p-4 sm:p-6 lg:p-4 w-full flex-shrink-0">
        <div className="max-w-full mx-auto flex justify-between items-center gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Visual Seating Planner</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.open('documentation.html', '_blank')}
              className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
            >
              Help
            </button>
            <SettingsMenu
              onImportLayout={() => layoutFileInputRef.current?.click()}
              onImportGuests={() => guestFileInputRef.current?.click()}
              onCreateLayout={() => {
                // Navigate to layout creator using React Router
                navigate('/layout-creator');
              }}
            />
            <input
              type="file"
              ref={guestFileInputRef}
              onChange={handleGuestFileChange}
              style={{ display: 'none' }}
              accept=".csv,.txt,.xlsx"
            />
            <input
              type="file"
              ref={layoutFileInputRef}
              onChange={handleLayoutFileChange}
              style={{ display: 'none' }}
              accept=".json"
            />
            <button
              onClick={handleReset}
              className="reset-button px-6 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all"
            >
              Reset
            </button>
          </div>
        </div>
      </header>

      <div className="mobile-view-switcher p-2 bg-gray-200 lg:hidden sticky top-0 z-10 flex-shrink-0">
        <div className="flex w-full rounded-md shadow-sm">
          <button
            onClick={() => setActiveView('list')}
            className={`w-full py-2 text-sm font-medium rounded-l-md ${
              activeView === 'list'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            List View
          </button>
          <button
            onClick={() => setActiveView('map')}
            className={`w-full py-2 text-sm font-medium rounded-r-md border-l border-gray-300 ${
              activeView === 'map'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Map View
          </button>
        </div>
      </div>

      <main className="landscape-main flex-grow min-h-0 flex flex-col lg:flex-row gap-8 p-4 sm:p-6 lg:p-4 lg:overflow-hidden">
        <div
          className={`guest-list-panel flex-grow min-h-0 lg:flex-grow-0 lg:w-96 lg:flex-shrink-0 bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col h-full ${
            activeView === 'list' ? 'flex' : 'hidden'
          } lg:flex`}
        >
          <div className="flex justify-between items-center p-4 border-b flex-shrink-0">
            <h2 className="text-xl font-bold text-gray-700">
              Guest Parties ({unassignedGuests.length}) - Est. Tables: {estimatedTables}
            </h2>
            <div className="flex items-center space-x-2">
              {isMergeMode ? (
                <>
                  <button
                    onClick={handleMergeGuests}
                    disabled={mergeSelection.length < 2}
                    className="bg-green-500 text-white rounded-full px-3 py-2 hover:bg-green-600 transition-colors disabled:opacity-50"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={cancelMergeMode}
                    className="bg-gray-300 text-gray-700 rounded-full px-3 py-2 hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={beginMergeMode}
                    className="bg-green-500 text-white rounded-full px-3 py-2 hover:bg-green-600 transition-colors"
                  >
                    Merge
                  </button>
                  <button
                    onClick={() => setIsAddPartyModalOpen(true)}
                    className="bg-indigo-600 text-white rounded-full p-2 hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>
          <div
            className="overflow-y-auto flex-grow p-4"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {guests.length > 0 ? (
              unassignedGuests.map(item => (
                <GuestCard
                  key={item.guest.id}
                  guest={item.guest}
                  remaining={item.remaining}
                  onSizeChange={handleGuestSizeChange}
                  onNotesChange={handleGuestNotesChange}
                  isSelected={selectedGuestId === item.guest.id}
                  onClick={() => handleGuestCardClick(item.guest.id)}
                  isMerging={isMergeMode}
                  mergeSelected={mergeSelection.includes(item.guest.id)}
                  onMergeSelect={handleMergeSelect}
                  onUnmerge={handleGuestUnmerge}
                />
              ))
            ) : (
              <div className="text-center text-gray-500 mt-10 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-lg">No Guests</h3>
                <p className="text-sm">Import a guest list to get started.</p>
              </div>
            )}
          </div>
        </div>

        <div
          className={`map-panel relative flex-grow min-h-0 bg-white p-4 rounded-xl shadow-lg ${
            activeView === 'map' ? 'flex' : 'hidden'
          } lg:flex flex-col h-full`}
        >
          <div
            ref={mapContainerRef}
            className="w-full h-full overflow-auto"
            style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-x pan-y' }}
          >
            <div
              ref={mapContentRef}
              style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}
              className={`min-w-0 min-h-0 ${isPinching ? '' : 'transition-transform duration-300'}`}
            >
              <div
                className="grid"
                style={{
                  gridTemplateColumns: `repeat(${
                    Math.max(...(tables.length > 0 ? tables.map(t => Number(t.gridCol)) : [0])) + 1
                  }, auto)`,
                  gap: '1rem',
                }}
              >
                {tables.map(table => (
                  <div
                    key={table.internalId}
                    style={{
                      gridColumn: Number(table.gridCol) + 1,
                      gridRow: Number(table.gridRow) + 1,
                    }}
                    className="flex items-center justify-center"
                  >
                    {renderTable(table)}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <ZoomControls
            onZoomIn={() => setScale(s => Math.min(s + 0.1, 2))}
            onZoomOut={() => setScale(s => Math.max(s - 0.1, 0.2))}
            onReset={calculateScale}
          />
          
          {/* Mobile Quick Assign Toggle Button */}
          {!showMobileQuickAssign && unassignedGuests.length > 0 && (
            <button
              onClick={() => setShowMobileQuickAssign(true)}
              className="lg:hidden fixed bottom-4 right-4 z-10 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-colors"
              aria-label="Show quick assign panel"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </button>
          )}
        </div>
      </main>

      {/* Mobile Components */}
      {renderSelectedGuestBanner()}

      {showMobileQuickAssign && activeView === 'map' && (
        <MobileQuickAssignPanel
          unassignedGuests={unassignedGuests}
          selectedGuestId={selectedGuestId}
          onSelectGuest={handleMobileQuickAssignSelect}
          onClose={() => setShowMobileQuickAssign(false)}
        />
      )}
    </div>
  );
};
