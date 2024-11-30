// // Retrieve stored summaries and display them in the popup
// chrome.storage.local.get({ summaryDatabase: [] }, (data) => {
//     const summariesDiv = document.getElementById('summaries');
//     data.summaryDatabase.forEach((summary) => {
//       const summaryElement = document.createElement('div');
//       summaryElement.className = 'summary';
//       summaryElement.innerHTML = `<strong>${summary.title}</strong><br/>${summary.summary}`;
//       summariesDiv.appendChild(summaryElement);
//     });
//   });
  