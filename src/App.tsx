import React, { useState, useEffect } from "react";
import { PlusCircle, Trash2, Asterisk } from "lucide-react";

import "./App.css";

interface Expense {
  id: number;
  title: string;
  amount: number;
}

interface ExpenseTracker {
  id: number;
  name: string;
  expenses: Expense[];
  status: "In progress ⚠️" | "Cleared ✅";
}

const App: React.FC = () => {
  const [trackers, setTrackers] = useState<ExpenseTracker[]>(
    JSON.parse(localStorage.getItem("trackers") || "[]")
  );
  const [trackerName, setTrackerName] = useState<string>("");

  useEffect(() => {
    localStorage.setItem("trackers", JSON.stringify(trackers));
  }, [trackers]);

  const addTracker = (): void => {
    if (!trackerName) return;
    const newTracker: ExpenseTracker = {
      id: Date.now(),
      name: trackerName,
      expenses: [],
      status: "In progress ⚠️",
    };
    setTrackers([...trackers, newTracker]);
    setTrackerName("");
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
        <button className="add-button" onClick={addTracker}>Add Tracker</button>
      </div>
      <div className="tracker-list">
        {trackers.map((tracker) => (
          <div key={tracker.id} className="tracker-card">
            <h2 className="tracker-name">{tracker.name}</h2>
            <h3 className="total">Total: ${getTotal(tracker).toFixed(2)}</h3>
            <p className="status">Status: {tracker.status ? tracker.status : "In progress ⚠️"}</p>
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
                  <PlusCircle size={18} color="#097969"  />
                </button>
              </div>
            }
              {tracker.expenses.map((expense) => (
                <div key={expense.id} className="item-container">
                  <div style={{display:'flex', flexDirection:'row', alignItems:'center'}}>
                  <Asterisk size={15} color="#800080" />
                  <p className="item-name">{expense.title}: ${expense.amount.toFixed(2)}</p>
                  </div>
                  <Trash2 size={15} color="#E30B5C" className="icon delete" onClick={() => deleteExpense(tracker.id, expense.id)} />
                </div>
              ))}
            <button onClick={() => toggleStatus(tracker.id)} className="completed-button">
              {tracker.status === "In progress ⚠️" ? "Done" : "Edit"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
