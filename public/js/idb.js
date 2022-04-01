let db;

const request = indexedDB.open('budget_tracker', 1);

request.onupgradeneeded = function(event) {
    const db = event.target.result;

    //create object store 'new_transactions'
    db.createObjectStore('new_transaction', { autoIncrement: true });


};
//on success
request.onsuccess = function(event) {
    db = event.target.result;
    //check if app is online
    if (navigator.onLine) {
        uploadTransaction();
    }
};
//on error
request.onerror = function(event) {
    console.log(event.target.errorCode);
};

// On attempt to submit with no internet
function saveRecord(record) {
    const transaction = db.transaction(['new_transaction'], 'readwrite');

    const budgetObjectStore = transaction.objectStore('new_transaction');

    budgetObjectStore.add(record);
};

// data collector
function uploadTransaction() {
    const transaction = db.transaction(['new_transaction'], 'readwrite');

    const budgetObjectStore = transaction.objectStore('new_transaction');

    const getAll = budgetObjectStore.getAll();

    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(serverResponse => {
                    if (serverResponse.message) {
                        throw new Error(serverResponse);
                    }

                    const transaction = db.transaction(['new_transaction'], 'readwrite');

                    const budgetObjectStore = transaction.objectStore('new_transaction');

                    budgetObjectStore.clear();

                    alert('All saved transactions have been submitted');
                })
                .catch(err => {
                    console.log(err);
                });
        }
    }
}

window.addEventListener('online', uploadTransaction);