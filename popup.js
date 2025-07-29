function getCurrentTab() {
    return new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentTab = tabs[0];
        resolve(currentTab.url.includes("AttendanceReport"));
      });
    });
  }
  
  function calculateAttendance() {
    return new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentTab = tabs[0];
        
        chrome.scripting.executeScript({
          target: { tabId: currentTab.id },
          function: () => {
            const rows = document.querySelectorAll('tbody tr');
            let present = 0;
            let absent = 0;
            let total = 0;
            
            rows.forEach(row => {
              const cells = row.querySelectorAll('td');
              if (cells.length >= 2) {
                const attendance = cells[1].textContent.trim().toUpperCase();
                if (attendance === 'PRESENT') {
                  present++;
                  total++;
                } else if (attendance === 'ABSENT') {
                  absent++;
                  total++;
                }
              }
            });
            
            const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
            return { present, absent, total, percentage };
          }
        }, (results) => {
          if (results && results[0]) {
            resolve(results[0].result);
          } else {
            resolve({ present: 0, absent: 0, total: 0, percentage: 0 });
          }
        });
      });
    });
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    const button = document.getElementById("percentageBtn");
  
    button.addEventListener("click", async () => {
      const isOnAttendanceReport = await getCurrentTab();
      
      if (isOnAttendanceReport) {
        const attendance = await calculateAttendance();
        button.textContent = `Total: ${attendance.percentage}%`;
        console.log(`Present: ${attendance.present}, Absent: ${attendance.absent}, Total: ${attendance.total}, Percentage: ${attendance.percentage}%`);
      } else {
        alert("Please open the Attendance Report page");
      }
    });
  });
  