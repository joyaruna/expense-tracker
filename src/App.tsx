import React, { useState, useEffect } from "react";
import { PlusCircle, Trash2, Asterisk } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import "./App.css";

interface Expense {
  id: number;
  title: string;
  amount: number;
}

interface ExpenseTracker {
  id: number;
  name: string;
  date: Date;
  expenses: Expense[];
  status: "In progress ⚠️" | "Cleared ✅";
  expanded: boolean;
}

const App: React.FC = () => {
  const [trackers, setTrackers] = useState<ExpenseTracker[]>(() => {
    const storedTrackers = localStorage.getItem("trackers");
    if (!storedTrackers) return [];

    return JSON.parse(storedTrackers).map((tracker: Partial<ExpenseTracker>) => ({
      id: tracker.id || Date.now(),
      name: tracker.name || "",
      date: tracker.date ? new Date(tracker.date) : new Date(),
      expenses: tracker.expenses || [],
      status: tracker.status || "In progress ⚠️",
      expanded: tracker.expanded || false,
    })).sort((a: ExpenseTracker, b: ExpenseTracker) => b.date.getTime() - a.date.getTime());
  });


  const [trackerName, setTrackerName] = useState<string>("");
  const [trackerDate, setTrackerDate] = useState<Date | null>(new Date());


  useEffect(() => {
    localStorage.setItem("trackers", JSON.stringify(trackers));
  }, [trackers]);

  const addTracker = (): void => {
    if (!trackerName || !trackerDate) return;
    const newTracker: ExpenseTracker = {
      id: Date.now(),
      name: trackerName,
      date: trackerDate,
      expenses: [],
      status: "In progress ⚠️",
      expanded: false,
    };
    
    setTrackers(prevTrackers => [...prevTrackers, newTracker].sort((a, b) => b.date.getTime() - a.date.getTime()));
    setTrackerName("");
    setTrackerDate(new Date());
  };


  const deleteTracker = (trackerId: number): void => {
    setTrackers(trackers.filter(tracker => tracker.id !== trackerId));
  };


  const addExpense = (trackerId: number, title: string, amount: string): void => {
    if (!title || !amount) return;
    setTrackers(trackers.map(tracker =>
      tracker.id === trackerId
        ? { ...tracker, expenses: [...tracker.expenses, { id: Date.now(), title, amount: parseFloat(amount) }] }
        : tracker
    ));
  };

  const deleteExpense = (trackerId: number, expenseId: number): void => {
    setTrackers(trackers.map(tracker =>
      tracker.id === trackerId
        ? { ...tracker, expenses: tracker.expenses.filter(expense => expense.id !== expenseId) }
        : tracker
    ));
  };
  const toggleStatus = (trackerId: number): void => {
    setTrackers(trackers.map(tracker =>
      tracker.id === trackerId
        ? { ...tracker, status: tracker.status === "In progress ⚠️" ? "Cleared ✅" : "In progress ⚠️" }
        : tracker
    ));
  };

  const toggleExpand = (trackerId: number): void => {
    setTrackers(trackers.map(tracker =>
      tracker.id === trackerId
        ? { ...tracker, expanded: !tracker.expanded }
        : tracker
    ));
  };

  const getTotal = (tracker: ExpenseTracker): number => {
    return tracker.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  };

  return (
    <div className="container">
      <h1 className="container-title">Expense Tracker</h1>
      <div className="input-group">
        <input
          type="text"
          placeholder="Tracker Name"
          value={trackerName}
          onChange={(e) => setTrackerName(e.target.value)}
          className="input-box"
        />
        <DatePicker
          selected={trackerDate}
          onChange={(date: Date | null) => setTrackerDate(date)}
          dateFormat="yyyy-MM-dd"
          placeholderText="Select Date"
          className="date-picker"
        />
        <button className="add-button" onClick={addTracker}>Add Tracker</button>
      </div>
      <div className="tracker-list">
        {trackers.map((tracker) => (
          <div key={tracker.id} className="tracker-card">
            <h2 className="tracker-name">{tracker.name}</h2>
            <p className="tracker-date">Created @ {tracker.date.toDateString()}</p>
            <h3 className="total">Total: ${getTotal(tracker).toFixed(2)}</h3>
            <p className="status">Status: {tracker.status ? tracker.status : "In progress ⚠️"}</p>
            <p onClick={() => toggleExpand(tracker.id)} className="expand-button">
              {tracker.expanded ? "Show Less..🤌" : "View More..👆"}
            </p>
            <p onClick={() => deleteTracker(tracker.id)} className="expand-button"><Trash2 size={15} color="#E30B5C" /></p>
            {tracker.expanded && (
              <>
                {tracker.status === "In progress ⚠️" &&
                  <div className="item-group">
                    <input type="text" placeholder="Input Expense Title" id={`title-${tracker.id}`} className="title-input" />
                    <input type="number" placeholder="Input Amount (USD)" id={`amount-${tracker.id}`} className="amount-input" />
                    <button onClick={() => {
                      const titleInput = document.getElementById(`title-${tracker.id}`) as HTMLInputElement;
                      const amountInput = document.getElementById(`amount-${tracker.id}`) as HTMLInputElement;
                      addExpense(tracker.id, titleInput.value, amountInput.value);
                      titleInput.value = "";
                      amountInput.value = "";
                    }} className="item-add-button">
                      <PlusCircle size={18} color="#097969" />
                    </button>
                  </div>
                }
                {tracker.expenses.map((expense) => (
                  <div key={expense.id} className="item-container">
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                      <Asterisk size={15} color="#800080" />
                      <p className="item-name">{expense.title}: ${expense.amount.toFixed(2)}</p>
                    </div>
                    <Trash2 size={15} color="#E30B5C" className="icon delete" onClick={() => deleteExpense(tracker.id, expense.id)} />
                  </div>
                ))}
                <button onClick={() => toggleStatus(tracker.id)} className="completed-button">
                  {tracker.status === "In progress ⚠️" ? "Done" : "Edit"}
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
