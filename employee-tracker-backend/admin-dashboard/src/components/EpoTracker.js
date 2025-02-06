import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './EpoTracker.css';
import { FaStickyNote } from "react-icons/fa"

const EpoTracker = () => {
    const [epos, setEpos] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newEpo, setNewEpo] = useState({
        neighborhood: '',
        lot: '',
        address: '',
        amount: '',
        status: 'Created',
        note: '',
    });

    const [selectedLot, setSelectedLot] = useState(null); // Add this line

    const retrieveEpoApi = 'https://fxfd2d0v7g.execute-api.us-east-1.amazonaws.com/default/retreiveEPO';
    const createEpoApi = 'https://jcntg0xhyb.execute-api.us-east-1.amazonaws.com/default/createEPO';

    useEffect(() => {
        fetchEpos();
    }, []);

    const fetchEpos = async (query = '') => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${retrieveEpoApi}?search=${query}`);
            setEpos(response.data.data || []);
        } catch (err) {
            setError('Failed to fetch EPO data. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const addNote = async (lot) => {
        if (!lot || !newNote.trim()) {
            alert("Lot or note is missing.");
            return;
        }

        try {
            const payload = {
                Lot: lot,
                Note: newNote,
            };

            await axios.post(
                "https://fwnrkzvk97.execute-api.us-east-1.amazonaws.com/default/addNoteEPO",
                payload,
                {
                    headers: { "Content-Type": "application/json" },
                }
            );

            alert("Note added successfully");
            setNewNote("");
            fetchEpos(); // Refresh the EPO list
        } catch (err) {
            console.error("Error adding note:", err.response?.data || err.message);
            alert("Failed to add note. Please try again.");
        }
    };

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setNewEpo({
            neighborhood: '',
            lot: '',
            address: '',
            amount: '',
            status: 'Created',
            note: '',
        });
    };

    const handleEdit = (epo) => {
        setEditEpo(epo);
    };

    const handleUpdateEpo = async () => {
        if (!editEpo) return;

        try {
            const payload = {
                Lot: editEpo.header?.job?.lot,
                Address: editEpo.header?.job?.street,
                Amount: editEpo.summary?.orderTotal,
                Status: editEpo.header?.orderType,
            };

            await axios.put(updateEpoApi, payload, { headers: { 'Content-Type': 'application/json' } });
            alert('EPO updated successfully');
            setEditEpo(null);
            fetchEpos(); // Refresh the list
        } catch (err) {
            alert('Failed to update EPO. Please try again.');
        }
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;

        setEditEpo((prev) => {
            const updatedEpo = { ...prev };
            if (name === 'lot') updatedEpo.header.job.lot = value;
            else if (name === 'address') updatedEpo.header.job.street = value;
            else if (name === 'amount') updatedEpo.summary.orderTotal = parseFloat(value);
            else if (name === 'status') updatedEpo.header.orderType = value;
            return updatedEpo;
        });
    };

    const handleNewEpoChange = (e) => {
        const { name, value } = e.target;
        setNewEpo((prev) => ({ ...prev, [name]: value }));
    };

    const addEpo = async () => {
        try {
            const payload = {
                header: {
                    job: {
                        subdivision: newEpo.neighborhood || '',
                        lot: newEpo.lot || '',
                        street: newEpo.address || '',
                    },
                    orderType: newEpo.status || 'Created',
                },
                summary: {
                    orderTotal: parseFloat(newEpo.amount) || 0,
                },
                items: [
                    {
                        itemDescription: newEpo.note || '',
                    },
                ],
            };

            await axios.post(createEpoApi, payload, {
                headers: { 'Content-Type': 'application/json' },
            });

            alert('EPO added successfully');
            closeModal();
            fetchEpos(); // Refresh the EPO list
        } catch (err) {
            alert('Failed to add EPO. Please try again.');
        }
    };

    return (
        <div className="epo-tracker">
            <h1 className="epo-title">EPO Tracker</h1>

            <div className="epo-search">
                <input
                    type="text"
                    className="epo-search-input"
                    placeholder="Search EPOs by Lot..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <button className="epo-search-button" onClick={() => fetchEpos(search)}>
                    Search
                </button>
            </div>

            {loading ? (
                <p className="epo-loading">Loading...</p>
            ) : error ? (
                <p className="epo-error">{error}</p>
            ) : (
                <table className="epo-table">
                    <thead>
                        <tr>
                            <th>Neighborhood</th>
                            <th>Lot</th>
                            <th>Address</th>
                            <th>EPO Amount</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {epos.length > 0 ? (
                            epos.map((epo, index) => (
                                <React.Fragment key={index}>
                                    <tr>
                                        <td>{epo.header?.job?.subdivision || "N/A"}</td>
                                        <td>{epo.header?.job?.lot || "N/A"}</td>
                                        <td>{epo.header?.job?.street || "N/A"}</td>
                                        <td>${parseFloat(epo.summary?.orderTotal || "0").toFixed(2)}</td>
                                        <td>{epo.header?.orderType || "N/A"}</td>
                                        <td>
                                        <FaStickyNote
                                            className="sticky-note-icon"
                                            title={selectedLot === epo.header?.job?.lot ? "Collapse Notes" : "Expand Notes"}
                                            onClick={() =>
                                                setSelectedLot(
                                                    selectedLot === epo.header?.job?.lot ? null : epo.header?.job?.lot
                                                )
                                            }
                                            style={{
                                                cursor: "pointer",
                                                color: selectedLot === epo.header?.job?.lot ? "blue" : "gray",
                                            }}
                                        />
                                        </td>
                                    </tr>

                                    {/* Expanded Notes Section */}
                                    {selectedLot === epo.header?.job?.lot && (
                                        <tr>
                                            <td colSpan="6">
                                                <strong>Notes History:</strong>
                                                <ul>
                                                    {epo.Notes && epo.Notes.length > 0 ? (
                                                        epo.Notes.map((note, noteIndex) => (
                                                            <li key={noteIndex}>
                                                                <strong>{new Date(note.createdDate).toLocaleString()}:</strong> {note.text}
                                                            </li>
                                                        ))
                                                    ) : (
                                                        <li>No notes available</li>
                                                    )}
                                                </ul>

                                                {/* Add Note Input */}
                                                <input
                                                    type="text"
                                                    value={newNote}
                                                    onChange={(e) => setNewNote(e.target.value)}
                                                    placeholder="Enter a new note"
                                                    className="note-input"
                                                />
                                                <button onClick={() => addNote(epo.header?.job?.lot)}>Add Note</button>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="epo-no-data">
                                    No EPOs found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}

            {/* Floating + Button */}
            <button className="add-epo-button" onClick={openModal}>
                +
            </button>

            {/* Add New EPO Modal */}
            {isModalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Add New EPO</h2>
                        <label>
                            Neighborhood:
                            <input
                                type="text"
                                name="neighborhood"
                                value={newEpo.neighborhood}
                                onChange={handleNewEpoChange}
                            />
                        </label>
                        <label>
                            Lot:
                            <input
                                type="text"
                                name="lot"
                                value={newEpo.lot}
                                onChange={handleNewEpoChange}
                            />
                        </label>
                        <label>
                            Address:
                            <input
                                type="text"
                                name="address"
                                value={newEpo.address}
                                onChange={handleNewEpoChange}
                            />
                        </label>
                        <label>
                            EPO Amount:
                            <input
                                type="number"
                                name="amount"
                                value={newEpo.amount}
                                onChange={handleNewEpoChange}
                            />
                        </label>
                        <label>
                            Status:
                            <select
                                name="status"
                                value={newEpo.status}
                                onChange={handleNewEpoChange}
                            >
                                <option value="Created">Created</option>
                                <option value="Paid">Paid</option>
                                <option value="Not Paid">Not Paid</option>
                            </select>
                        </label>
                        <label>
                            Note:
                            <textarea
                                name="note"
                                value={newEpo.note}
                                onChange={handleNewEpoChange}
                            ></textarea>
                        </label>
                        <div className="modal-actions">
                            <button className="submit-button" onClick={addEpo}>
                                Submit
                            </button>
                            <button className="cancel-button" onClick={closeModal}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EpoTracker;