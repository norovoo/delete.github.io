import React, { useState, useEffect } from 'react';
import axios from 'axios';
import KanbanBoard from './KanbanBoard';

const API_KEY = 'a2F8ZikP6c37aDLijmdFb1o4YCDEG0Mc20ZX31TL';
const LAMBDA_URL = 'https://6d6qnwzps73kzauiqbl6nkdrwy0ylkcn.lambda-url.us-east-1.on.aws/';

const ParentComponent = () => {
    const [tasks, setTasks] = useState([]);
    const [filteredTasks, setFilteredTasks] = useState([]);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // months are 0-indexed

    const fetchTasks = async () => {
        try {
            const response = await axios.get(LAMBDA_URL, {
                headers: {
                    'x-api-key': API_KEY,
                },
                params: {
                    startDate: '2023-01-01',
                    endDate: '2024-12-31',
                },
            });

            console.log('Fetched Data from Lambda:', response.data.orders);

            if (response.data.orders && response.data.orders.length > 0) {
                const formattedTasks = response.data.orders.map((order) => ({
                    id: order.OrderID,
                    title: order.header?.task?.name || 'Untitled Task',
                    status: order.header?.status || 'To Do',
                    dueDate: order.header?.endDate || 'No Due Date',
                    startDate: order.header?.startDate || 'No Start Date',
                    lot: order.header.job?.lot || 'No Lot Number',
                    jobAddress: order.header?.billingInformation?.address?.name || 'No Address',
                    orderTotal: order.summary?.orderTotal || 0,
                }));

                setTasks(formattedTasks);
            } else {
                console.warn('No orders found in the API response.');
                setTasks([]);
            }
        } catch (error) {
            console.error('Error fetching tasks from Lambda:', error);
            setTasks([]);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleYearChange = (e) => {
        setSelectedYear(e.target.value);
    };

    const handleMonthChange = (e) => {
        setSelectedMonth(e.target.value);
    };

    useEffect(() => {
        const filtered = tasks.filter((task) => {
            const taskDate = new Date(task.startDate);
            return (
                taskDate.getFullYear() === parseInt(selectedYear) &&
                taskDate.getMonth() + 1 === parseInt(selectedMonth)
            );
        });

        setFilteredTasks(filtered);
    }, [tasks, selectedYear, selectedMonth]);

    return (
        <div>
            <div className="year-month-dropdowns">
                <label>Year:</label>
                <select value={selectedYear} onChange={handleYearChange}>
                    {Array.from({ length: 10 }, (_, i) => {
                        const year = new Date().getFullYear() - i;
                        return (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        );
                    })}
                </select>

                <label>Month:</label>
                <select value={selectedMonth} onChange={handleMonthChange}>
                    {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                            {new Date(0, i).toLocaleString('en-US', { month: 'long' })}
                        </option>
                    ))}
                </select>
            </div>

            <KanbanBoard tasks={filteredTasks} />
        </div>
    );
};

export default ParentComponent;