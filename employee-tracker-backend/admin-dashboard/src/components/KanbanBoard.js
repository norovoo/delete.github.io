import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './KanbanBoard.css';

const LAMBDA_URL = 'https://xmkiupsz3a.execute-api.us-east-1.amazonaws.com/default/getNewOrderList';
const API_KEY = 'a2F8ZikP6c37aDLijmdFb1o4YCDEG0Mc20ZX31TL';

const KanbanBoard = () => {
    const [tasks, setTasks] = useState([]);
    const [columns, setColumns] = useState({
        todo: [],
        inProgress: [],
        inReview: [],
        done: [],
    });

    // Mapping Lambda statuses to Kanban statuses
    const statusMapping = {
        Created: 'To Do',
        InProgress: 'In Progress',
        Review: 'In Review',
        Complete: 'Done',
    };

    // Fetch tasks from Lambda and transform to match Kanban structure
    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await axios.get(LAMBDA_URL, {
                    headers: { 'x-api-key': API_KEY },
                });

                const orders = response.data.orders || [];
                console.log('Fetched Orders:', orders);

                const transformedTasks = orders.map((order) => ({
                    neighborhood: order.Neighborhood || 'N/A',
                    lot: order.Lot || 'N/A',                    
                    status: statusMapping[order.status] || 'To Do',
                    jobAddress: order.address || 'N/A',
                    dueDate: order.EndDate || 'No Due Date',
                }));

                setTasks(transformedTasks);
            } catch (error) {
                console.error('Error fetching tasks:', error);
            }
        };

        fetchTasks();
    }, []);

    // Categorize tasks into columns based on status
    useEffect(() => {
        if (!Array.isArray(tasks)) {
            console.error('Tasks is not an array:', tasks);
            return;
        }

        const newColumns = {
            todo: tasks.filter((task) => task.status === 'To Do'),
            inProgress: tasks.filter((task) => task.status === 'In Progress'),
            inReview: tasks.filter((task) => task.status === 'In Review'),
            done: tasks.filter((task) => task.status === 'Done'),
        };

        console.log('New Columns:', newColumns);
        setColumns(newColumns);
    }, [tasks]);

    // Handle drag start
    const onDragStart = (event, task) => {
        console.log('Dragging task:', task);
        event.dataTransfer.setData('task', JSON.stringify(task));
    };

    // Allow drag-over
    const onDragOver = (event) => {
        event.preventDefault();
    };

    // Handle drop and update status
    const onDrop = async (event, column) => {
        event.preventDefault();
        const task = JSON.parse(event.dataTransfer.getData('task'));
        const updatedTask = { ...task, status: column };

        // Update the task in columns
        const updatedColumns = { ...columns };
        Object.keys(updatedColumns).forEach((key) => {
            updatedColumns[key] = updatedColumns[key].filter((item) => item.id !== task.id);
        });

        updatedColumns[column].push(updatedTask);
        setColumns(updatedColumns);

        // Persist the status change to Lambda
        try {
            const response = await axios.post(`${LAMBDA_URL}/update-status`, {
                id: task.id,
                status: column,
            }, {
                headers: { 'x-api-key': API_KEY },
            });

            console.log('Status updated successfully:', response.data);
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    // Format column titles for display
    const formatColumnTitle = (column) => {
        return column
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, (str) => str.toUpperCase());
    };

    return (
        <div className="kanban-board">
            {/* Render Kanban Columns */}
            {Object.keys(columns).map((column) => (
                <div
                    key={column}
                    className="kanban-column"
                    onDragOver={onDragOver}
                    onDrop={(event) => onDrop(event, column)}
                >
                    <h2 className="kanban-column-title">{formatColumnTitle(column)}</h2>
                    <div>
                        {columns[column].length > 0 ? (
                            columns[column].map((task) => (
                                <div
                                    key={task.id}
                                    className="kanban-task"
                                    draggable
                                    onDragStart={(event) => onDragStart(event, task)}
                                >
                                    
                                    <p>Neighborhood: <strong> {task.neighborhood} </strong></p>
                                    <p>Lot Number: <strong> {task.lot} </strong></p>
                                    <p>Due Date: <strong>{task.dueDate}</strong></p>
                                </div>
                            ))
                        ) : (
                            <p>No tasks in this column</p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default KanbanBoard;